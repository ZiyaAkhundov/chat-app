import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class VerificationDto {
    @ApiProperty({
        description: 'Verification token sent to the user',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID('4')
    @IsNotEmpty()
    public token: string
}