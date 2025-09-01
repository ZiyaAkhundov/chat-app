import {
    ValidatorConstraint,
	type ValidationArguments,
	type ValidatorConstraintInterface
} from 'class-validator'

import { NewPasswordDto } from '@/src/modules/auth/password/dto/password-recovery.dto'

@ValidatorConstraint({name: 'IsPasswordsMatching', async: false})
export class IsPasswordsMatchingConstraint
	implements ValidatorConstraintInterface
{
	public validate(passwordRepeat: string, args: ValidationArguments) {
		const object = args.object as NewPasswordDto

		return object.password === passwordRepeat
	}

	public defaultMessage(validationArguments?: ValidationArguments) {
		return 'Passwords do not match'
	}
}