import { IsNotEmpty, IsString, Length } from "class-validator";

export class EnableTotpDto {
    @IsString()
    @IsNotEmpty()
    public secret: string

    @IsString()
    @IsNotEmpty()
    @Length(6,6)
    public pin: string
}