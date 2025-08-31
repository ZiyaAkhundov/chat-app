import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common'
import { type User } from '@prisma/client'
import { hash, verify } from 'argon2'

import { PrismaService } from '@/src/core/prisma/prisma.service'

import { ChangeEmailDto } from './dto/change-email.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateAccountDto } from './dto/create-account.dto'
import { VerificationService } from '../verification/verification.service'
import { CacheInvalidationService } from '../../libs/cache/cache-invalidation.service'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService,
		private readonly cacheInvalidationService: CacheInvalidationService,
	) {}

	public async me(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			omit: {
				password: true,
				totpSecret: true,
				updatedAt: true,
				createdAt: true,
			}
		})

		return user
	}

	public async create(input: CreateAccountDto) {
		const { email, password, username } = input

		const isUsernameExists = await this.prismaService.user.findUnique({
			where: {
				username
			}
		})

		if (isUsernameExists) {
			throw new ConflictException('This username is already exists')
		}

		const isEmailExists = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (isEmailExists) {
			throw new ConflictException('This email is already exists')
		}

		const user = await this.prismaService.user.create({
			data: {
				username,
				email,
				password: await hash(password),
				displayName: username
			}
		})

		await this.verificationService.sendEmailVerificationToken(user)

		return true
	}

	public async changeEmail(user: User, input: ChangeEmailDto) {
		const { email } = input

		const isEmailExists = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (isEmailExists) {
			throw new ConflictException('This email is already exists')
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email
			}
		})
		
		await this.cacheInvalidationService.invalidateUserCache(user.id);
		
		return true
	}

	public async changePassword(user: User, input: ChangePasswordDto) {
		const { oldPassword, newPassword } = input

		const isPasswordCorrect = await verify(user.password, oldPassword)

		if (!isPasswordCorrect) {
			throw new BadRequestException('Old password is incorrect')
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				password: await hash(newPassword)
			}
		})

		return true
	}
}
