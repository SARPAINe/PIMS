import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "../entities";
import { RegisterDto, LoginDto } from "./dto";
import { JwtPayload } from "./strategies/jwt.strategy";
import { UserType } from "src/common/enums";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists!!");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash: hashedPassword,
      userType: UserType.USER,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      userType: savedUser.userType,
    };
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        userType: user.userType,
      };

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
        },
      };
    } catch (error) {
      console.error("Error during login:", error);
      throw new Error(
        "An error occurred during login. Please try again later.",
      );
    }
  }

  async validateUser(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
