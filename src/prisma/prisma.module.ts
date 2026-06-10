import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from 'generated/prisma/client';

@Global() // @Global hace que no tengas que importar este módulo en cada lugar donde uses Prisma.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exportamos el servicio para que otros módulos lo puedan inyectar.
})
export class PrismaModule {
}
