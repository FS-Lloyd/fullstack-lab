import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: ['dist/**/*.entity.js'],
  autoLoadEntities: true,
  synchronize: false,
}));
