import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export class ChangeProfileInfoDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/)
	public username: string

    @IsString()
    @IsNotEmpty()
	public displayName: string

    @IsString()
    @IsOptional()
    @MaxLength(300)
	public bio?: string
}
