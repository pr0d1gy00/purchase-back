import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "generated/prisma/client";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.UserCreateInput) {
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password
            }
        })
        return user
    }
    async findAll() {
        return this.prisma.user.findMany();
    }
    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        })
    }
    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: {
                id
            }
        })
    }
    async update(id: string, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: {
                id
            },
            data
        })
    }
    async remove(id: string) {
        return this.prisma.user.delete({
            where: {
                id
            }
        })
    }
}