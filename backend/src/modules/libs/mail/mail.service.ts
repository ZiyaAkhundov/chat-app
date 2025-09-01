import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

import { verifyEmailTemplate } from './templates/verify-email.template'
import { SessionMetadata } from '@/src/shared/types/session-metadata.types'
import { PasswordChangeNotificationTemplate } from './templates/password-reset-notification.template'
import { PasswordRecoveryTemplate } from './templates/password-recovery.template'
import { PasswordChangeTemplate } from './templates/password-change.template'

@Injectable()
export class MailService {
	public constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	public async sendEmailVerificationToken(email: string, token: string) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(verifyEmailTemplate({ domain, token }))

		return this.sendMail(email, 'Account verification', html)
	}

	public async sendPasswordResetToken(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
		const html = await render(
			PasswordRecoveryTemplate({ domain, token, metadata })
		)

		return this.sendMail(email, 'Password reset', html)
	}

	public async sendPasswordChangeNotificationMail(
		email: string,
		metadata: SessionMetadata
	) {
		const html = await render(
			PasswordChangeNotificationTemplate({ metadata })
		)

		return this.sendMail(email, 'Password has been changed', html)
	}

	public async sendPasswordChangeToken(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const html = await render(
			PasswordChangeTemplate({ token, metadata })
		)

		return this.sendMail(email, 'Password change', html)
	}

	private sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}
}
