import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => {
        if (!config.JWT_SECRET) throw new Error('JWT_SECRET must be defined in environment');
        if (!config.JWT_EXPIRE_TIME) throw new Error('JWT_EXPIRE_TIME must be defined in environment');
        return config;
      }
    }),
    JwtModule.register({
      global: true,
      secret: process.env['JWT_SECRET'],
      signOptions: { 
        expiresIn: process.env['JWT_EXPIRE_TIME'],
        algorithm: 'HS256'
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
