import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UpdatePasswordDto,
} from "./dto";
import { JwtAuthGuard, RolesGuard } from "../auth/guards";
import { Roles, CurrentUser } from "../auth/decorators";
import { UserType } from "../common/enums";
import { User } from "../entities";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserType.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  // @Roles(UserType.ADMIN)
  findAll(@Query("userType") userType?: string) {
    if (userType) {
      return this.usersService.findByUserType(userType);
    }
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles(UserType.ADMIN)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @Roles(UserType.ADMIN)
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @Roles(UserType.ADMIN)
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }

  @Patch(":id/profile")
  updateProfile(
    @Param("id") id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: User,
  ) {
    // Users can only update their own profile, admins can update any profile
    if (user.userType !== UserType.ADMIN && user.id !== +id) {
      throw new Error("You can only update your own profile");
    }
    return this.usersService.updateProfile(+id, updateProfileDto);
  }

  @Patch(":id/password")
  updatePassword(
    @Param("id") id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: User,
  ) {
    // Users can only update their own password, admins can update any password
    if (user.userType !== UserType.ADMIN && user.id !== +id) {
      throw new Error("You can only update your own password");
    }
    return this.usersService.updatePassword(+id, updatePasswordDto);
  }
}
