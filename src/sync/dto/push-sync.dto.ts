import { Type } from "class-transformer";
import { IsArray, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

class SyncChangesBucketDto {
    @IsArray()
    created: any[]

    @IsArray()
    @IsString({ each: true })
    deleted: string[]

    @IsArray()
    updated: any[]
}

class SyncChangesDto {
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesBucketDto)
    stores?: SyncChangesBucketDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesBucketDto)
    products?: SyncChangesBucketDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesBucketDto)
    purchases?: SyncChangesBucketDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesBucketDto)
    purchaseItems?: SyncChangesBucketDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesBucketDto)
    categories?: SyncChangesBucketDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesBucketDto)
    exchangeRates?: SyncChangesBucketDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesBucketDto)
    purchaseGroups?: SyncChangesBucketDto;
}

export class PushSyncDto {
    @IsNumber()
    lastPulledAt: number; // El momento en el que el cliente nos mandó esto
    @IsObject()
    @ValidateNested()
    @Type(() => SyncChangesDto)
    changes: SyncChangesDto;
}