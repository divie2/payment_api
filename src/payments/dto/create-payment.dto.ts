import { IsInt, IsOptional, IsPositive, Max, MaxLength, IsString, IsEmail } from "class-validator"


export class CreatePaymentDto{
    @IsInt()
    @IsPositive()
    @Max(100_000_000)
    amountKobo: number 

    @IsEmail()
    customerEmail: string

    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?:string

}

