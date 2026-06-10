import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class PullSyncDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lastPulledAt?: number;
}