import { Module } from '@nestjs/common';
import { BoardColumnsController } from './board-columns.controller';
import { BoardColumnsService } from './board-columns.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [PrismaModule, TeamModule],
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService],
  exports: [BoardColumnsService],
})
export class BoardColumnsModule {}
