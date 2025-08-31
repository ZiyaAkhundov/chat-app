import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator'

export class LoginDto {
	@ApiProperty({
		description: 'User login (username or email)',
		example: 'johndoe',
	})
	@IsString()
	@IsNotEmpty()
	public login: string

	@ApiProperty({
		description: 'User password',
		example: 'strongpassword123',
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	public password: string

	@ApiProperty({
		description: 'Optional PIN code for additional security',
		example: '123456',
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@Length(6, 6)
	public pin?: string
}
