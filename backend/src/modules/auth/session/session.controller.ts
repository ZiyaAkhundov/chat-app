import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { SessionService } from './session.service';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all sessions for the current user' })
  @ApiResponse({ status: 200, description: 'List of user sessions', type: [Object] })
	@Get('find-all')
	public async findUserSessions(@Req() req: Request) {
		return this.sessionService.findUserSessions(req)
	}

  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get the current session' })
  @ApiResponse({ status: 200, description: 'Current user session', type: Object })
  @Get('find-current')
	public async findCurrentSession(@Req() req: Request) {
		return this.sessionService.findCurrentSession(req)
	}

  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'User logged in successfully', type: Object })
  @Post('login')
	public async login(@Req() req: Request, @Body() data: LoginDto, @UserAgent() userAgent: string) {
		return this.sessionService.login(req, data, userAgent)
	}

  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User logged out successfully', type: Object })
  @Post('logout')
	public async logout(@Req() req: Request) {
		return this.sessionService.logout(req)
	}

  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Clear session for the current user' })
  @ApiResponse({ status: 200, description: 'User session cleared', type: Object })
  @Post('clear-session')
	public async clearSession(@Req() req: Request) {
		return this.sessionService.clearSession(req)
	}

	@Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Remove a specific session by ID' })
  @ApiParam({ name: 'id', required: true, type: String, description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session removed successfully', type: Object })
	@Post('remove/:id')
	public async removeSessionById(@Req() req: Request, @Param('id') id: string) {
		return this.sessionService.removeSessionById(req, id)
	}
}
