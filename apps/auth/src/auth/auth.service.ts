import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, username, firstName, lastName, phoneNumber } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma['user'].findFirst({
      where: {
        OR: [
          { email },
          ...(username ? [{ username }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) throw new ConflictException('Email already exists');
      if (existingUser.username === username) throw new ConflictException('Username already exists');
      if (existingUser.phoneNumber === phoneNumber) throw new ConflictException('Phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    try {
      const user = await this.prisma['user'].create({
        data: { email, password: hashedPassword, username, firstName, lastName, phoneNumber },
      });
      const payload = { sub: user.id, email: user.email, role: user.role };
      const access_token = await this.jwtService.signAsync(payload, {
        secret: process.env['JWT_SECRET'],
        expiresIn: process.env['JWT_EXPIRE_TIME'],
      });
      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto & { refresh_token: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma['user'].findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        { secret: process.env['JWT_SECRET'], expiresIn: process.env['JWT_EXPIRE_TIME'] }
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        { secret: process.env['JWT_REFRESH_SECRET'], expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] }
      )
    ]);

    await this.usersService.update(user.id, {
      refreshToken: await bcrypt.hash(refresh_token, 10)
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma['user'].findUnique({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('User not found');

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env['JWT_SECRET'],
      });
      return payload;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env['JWT_REFRESH_SECRET']
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid refresh token');
      const tokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!tokenMatches) throw new UnauthorizedException('Invalid refresh token');
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(
          { ...newPayload, type: 'access' },
          { secret: process.env['JWT_SECRET'], expiresIn: process.env['JWT_EXPIRE_TIME'] }
        ),
        this.jwtService.signAsync(
          { ...newPayload, type: 'refresh' },
          { secret: process.env['JWT_REFRESH_SECRET'], expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] }
        )
      ]);
      await this.usersService.update(user.id, {
        refreshToken: await bcrypt.hash(newRefreshToken, 10)
      });
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token validation failed');
    }
  }
}
