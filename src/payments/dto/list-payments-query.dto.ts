import { Type } from "class-transformer"
import { IsInt, IsOptional, Max, Min, IsIn} from "class-validator"
import type { Payment } from "../payment.types.js"

export class ListPaymentsQueryDto {

    @Min(1)
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    page: number = 1

    @Min(1)
    @Type(() => Number)
    @Max(100)
    @IsInt()
    @IsOptional()
    limit: number = 20

    @IsOptional()
    @IsIn(["pending", "success", "failed"])
    status?: Payment["status"]

}