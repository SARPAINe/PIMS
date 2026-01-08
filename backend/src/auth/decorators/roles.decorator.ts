import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../common/enums';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);
