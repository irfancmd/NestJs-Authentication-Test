import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import Redis from "ioredis";

// Ideally, we should put it in a dedicated file
export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage implements OnApplicationBootstrap, OnApplicationShutdown {
    private redisClient: Redis;

    onApplicationBootstrap() {
        // Ideally, we should move this to a dedicated "RedisModule"
        // instead of initiating the connection here.
        this.redisClient =  new Redis({
            // Best practice will be to use environment variables here
            host: 'localhost',
            port: 6379
        });
    }

    onApplicationShutdown(signal?: string) {
        this.redisClient.quit();
    }

    async insert(userId: number, tokenId: string): Promise<void> {
        await this.redisClient.set(this.getKey(userId), tokenId);
    }

    async validate(userId: number, tokenId: string): Promise<boolean> {
        const storedId = await this.redisClient.get(this.getKey(userId));

        // Automatic refresh token reuse detection. Here, we may decide to log it or report it to admins.
        if(storedId !== tokenId) {
            throw new InvalidatedRefreshTokenError();
        }

        return  storedId === tokenId;
    }

    async invalidate(userId: number): Promise<void> {
        await this.redisClient.del(this.getKey(userId));
    }

    private getKey(userId: number): string {
        return `user-${userId}`;
    }
}
