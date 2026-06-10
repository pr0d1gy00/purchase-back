import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service"
import type { User } from "generated/prisma/client";
import { IdempotencyInterceptor } from "src/common/interceptors/idempotency.interceptor";

@Controller('users')
export class ControllerUsers {
    constructor(private readonly userService: UsersService) { }
    @UseInterceptors(IdempotencyInterceptor)
    @Post()
    async create(@Body() body: User) {
        return this.userService.create(body)
    }
    @Get()
    async findAll() {
        return this.userService.findAll()
    }
    @Get(":id")
    async getOne(@Param() id: string) {
        return this.userService.findOne(id)
    }
    @Patch(":id")
    async update(@Param() id: string, @Body() body: User) {
        return this.userService.update(id, body)
    }
    @Delete(":id")
    async delete(@Param() id: string) {
        return this.userService.remove(id)
    }
}