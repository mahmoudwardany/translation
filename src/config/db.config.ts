/* eslint-disable prettier/prettier */
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmCOnfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url:'postgres://rvrkopsz:nR0oTgBDgnF2YNLtI7vdNjT2dAr4FbnO@silly.db.elephantsql.com/rvrkopsz',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};

