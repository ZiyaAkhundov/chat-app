import { IsPasswordsMatchingConstraint } from '@/src/shared/validators/is-passwords-matching-constraint.validator'
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	MinLength,
    Validate
} from 'class-validator'

export class PasswordChangeDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	public currentPassword: string

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	public password: string

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@Validate(IsPasswordsMatchingConstraint)
	public passwordRepeat: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Length(6, 6)
	public pin?: string
}