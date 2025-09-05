import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common'
import { type User } from '@prisma/client'
import { hash, verify } from 'argon2'
import sharp from 'sharp'

import { PrismaService } from '@/src/core/prisma/prisma.service'

import { StorageService } from '../../libs/storage/storage.service'
import { VerificationService } from '../verification/verification.service'

import { ChangeEmailDto } from './dto/change-email.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { ChangeProfileInfoDto } from './dto/change-profile-info.dto'
import { CreateAccountDto } from './dto/create-account.dto'
import { RedisCacheService } from '../../redis/cache.service'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService,
		private readonly redisCacheService: RedisCacheService,
		private readonly storageService: StorageService
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
				createdAt: true
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

		await this.redisCacheService.invalidateUserCache(user.id)

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

	public async changeAvatar(user: User, file: Express.Multer.File) {
		if (!file) throw new BadRequestException('File not provided')

		const buffer = file.buffer
		const fileName = `/uploads/${user.id}.webp`

		if (file.originalname.endsWith('.gif')) {
			const processedBuffer = await sharp(buffer, { animated: true })
				.resize(512, 512)
				.webp()
				.toBuffer()

			await this.storageService.upload(
				processedBuffer,
				fileName,
				'image/webp'
			)
		} else {
			const processedBuffer = await sharp(buffer)
				.resize(512, 512)
				.webp()
				.toBuffer()

			await this.storageService.upload(
				processedBuffer,
				fileName,
				'image/webp'
			)
		}

		await this.prismaService.user.update({
			where: { id: user.id },
			data: { avatar: fileName }
		})

		return true
	}

	public async removeAvatar(user: User) {
		if (!user.avatar) return false

		await this.storageService.remove(user.avatar)

		await this.prismaService.user.update({
			where: { id: user.id },
			data: { avatar: null }
		})

		return true
	}

	public async changeProfileInfo(user: User, input: ChangeProfileInfoDto) {
		const { username, displayName, bio } = input

		const usernameExists = await this.prismaService.user.findUnique({
			where: { username }
		})

		if (usernameExists && username !== user.username) {
			throw new Error('Username already exists')
		}

		await this.prismaService.user.update({
			where: { id: user.id },
			data: { username, displayName, bio }
		})

		return true
	}
}
