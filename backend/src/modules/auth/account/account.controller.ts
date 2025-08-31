import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors } from '@nestjs/common';
import { AccountService } from './account.service';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { CreateAccountDto } from './dto/create-account.dto';
import type { User } from '@prisma/client';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { UserCacheInterceptorFactory } from '@/src/shared/interceptors/cache-factory.interceptor';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Authorization()
  @ApiCookieAuth()
  @Get('me')
  @UseInterceptors(UserCacheInterceptorFactory(60*60))
  @ApiOperation({ summary: 'Get current logged-in user info' })
  @ApiResponse({ status: 200, description: 'Returns user info', type: UserResponseDto })
  public async me(@Authorized('id') id: string) {
    return this.accountService.me(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account successfully created' })
  @ApiBody({ type: CreateAccountDto })
  public async create(@Body() input: CreateAccountDto) {
    return this.accountService.create(input);
  }

  @Authorization()
  @ApiCookieAuth()
  @Put('email')
  @ApiOperation({ summary: 'Change user email' })
  @ApiResponse({ status: 200, description: 'Email successfully changed' })
  @ApiBody({ type: ChangeEmailDto })
  public async changeEmail(
    @Authorized() user: User,
    @Body() input: ChangeEmailDto
  ) {
    return this.accountService.changeEmail(user, input);
  }

  @Authorization()
  @ApiCookieAuth()
  @Put('password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiBody({ type: ChangePasswordDto })
  public async changePassword(
    @Authorized() user: User,
    @Body() input: ChangePasswordDto
  ) {
    return this.accountService.changePassword(user, input);
  }
}

