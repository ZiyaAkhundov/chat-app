import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'oldPassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public oldPassword: string;

  @ApiProperty({
    description: 'New password to replace the old one',
    example: 'newPassword456',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  public newPassword: string;
}
