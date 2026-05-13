import { UserService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);

    await this.userService.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, phone, password } = registerDto;

    const emailExist = await this.userService.findByEmail(email);

    if (emailExist) {
      throw new ConflictException('Email already used');
    }

    const phoneExist = await this.userService.findByPhone(phone);

    if (phoneExist) {
      throw new ConflictException('Phone already used');
    }

    const hashedPassword = bcrypt.hashSync(
      password,
      +this.configService.get('SALT'),
    );

    const user = await this.userService.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user.id);

    await this.userService.update(user.id, {
      refreshToken: tokens.refreshToken,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email,
        phone,
        name,
      },
    };
  }

  private async generateTokens(userId: string) {
    const payload = { userId };

    // Access token — short lived, Refresh token — long lived
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
