import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.userRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            passwordHash: hashedPassword,
            userType: createUserDto.userType,
        });

        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            select: ['id', 'name', 'email', 'userType', 'createdAt'],
        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'userType', 'createdAt'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        if (updateUserDto.password) {
            user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
        }

        if (updateUserDto.name) user.name = updateUserDto.name;
        if (updateUserDto.email) user.email = updateUserDto.email;
        if (updateUserDto.userType) user.userType = updateUserDto.userType;

        return this.userRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const result = await this.userRepository.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    async findByUserType(userType: string): Promise<User[]> {
        return this.userRepository.find({
            where: { userType: userType as any },
            select: ['id', 'name', 'email', 'userType', 'createdAt'],
        });
    }
}
