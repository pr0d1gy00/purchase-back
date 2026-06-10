import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisService {
    constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) { }
    async get(key: string) {
        return this.redis.get(key)
    }
    async setWithTTL(key: string, value: string, ttlSeconds: number) {
        return this.redis.set(key, value, 'EX', ttlSeconds)
    }
}