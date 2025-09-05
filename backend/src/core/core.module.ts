import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { IS_DEV_ENV } from '../shared/utils/is-dev.util'

import { PrismaModule } from './prisma/prisma.module'
import { RedisConfigModule } from './redis/redis.module'
import { MailModule } from '../modules/libs/mail/mail.module'
import { AccountModule } from '../modules/auth/account/account.module'
import { SessionModule } from '../modules/auth/session/session.module'
import { VerificationModule } from '../modules/auth/verification/verification.module'
import { PasswordModule } from '../modules/auth/password/password.module'
import { TotpModule } from '../modules/auth/totp/totp.module'
import { StorageModule } from '../modules/libs/storage/storage.module'
import { ImageModule } from '../modules/image/image.module'
import { RedisModule } from '../modules/redis/redis.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		PrismaModule,
		RedisConfigModule,
		RedisModule,
		MailModule,
		AccountModule,
		SessionModule,
		VerificationModule,
		PasswordModule,
		TotpModule,
		StorageModule,
		ImageModule
	]
})
export class CoreModule {}
