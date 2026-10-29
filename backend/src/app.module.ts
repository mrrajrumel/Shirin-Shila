import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PressModule } from './press/press.module';
@Module({ imports: [PrismaModule, PressModule] })
export class AppModule {}
