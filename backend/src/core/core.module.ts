import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { IS_DEV_ENV } from '../shared/utils/is-dev.util'

import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { MailModule } from '../modules/libs/mail/mail.module'
import { AccountModule } from '../modules/auth/account/account.module'
import { SessionModule } from '../modules/auth/session/session.module'
import { VerificationModule } from '../modules/auth/verification/verification.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		PrismaModule,
		RedisModule,
		MailModule,
		AccountModule,
		SessionModule,
		VerificationModule,
	]
})
export class CoreModule {}
