import { IsPasswordsMatchingConstraint } from '@/src/shared/validators/is-passwords-matching-constraint.validator'
import {
    IsEmail,
	IsNotEmpty,
	IsString,
	IsUUID,
	MinLength,
    Validate
} from 'class-validator'

export class NewPasswordDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	public password: string

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
    @Validate(IsPasswordsMatchingConstraint)
	public passwordRepeat: string

	@IsUUID('4')
	@IsNotEmpty()
	public token: string
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    public email: string
}