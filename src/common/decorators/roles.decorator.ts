import { SetMetadata } from '@nestjs/common';
import { AccessRoles } from '../../types/role.enum';

export const Roles = (...roles: AccessRoles[]) => SetMetadata('roles', roles);
