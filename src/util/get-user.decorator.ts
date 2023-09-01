/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';

export const GetUser = createParamDecorator((data, context:ExecutionContext) : UserEntity => {
    const request = context.switchToHttp().getRequest();
    return request.user;
});
