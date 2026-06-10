import { CallHandler, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable, of, tap } from "rxjs";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class IdempotencyInterceptor {
    constructor(private readonly redisService: RedisService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        if (request.method === "GET") {
            return next.handle();
        }
        const idempotencyKey = request.headers['x-idempotency-key'];

        if (!idempotencyKey) {
            throw new Error("x-idempotency-key is required");
        }
        const cachedResponse = await this.redisService.get(idempotencyKey);

        if (cachedResponse) {
            console.log("Returning cached response");
            return of(cachedResponse);
        }

        return next.handle().pipe(
            tap(async (response) => {
                this.redisService.setWithTTL(idempotencyKey, response, 43200);
            })
        );
    }
}
