import { Module } from '@nestjs/common';
import { BoardColumnsController } from './board-columns.controller';
import { BoardColumnsService } from './board-columns.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamModule } from '../team/team.module';
import { BoardColumnsGateway } from './board-columns.gateway';

@Module({
  imports: [PrismaModule, TeamModule],
  controllers: [BoardColumnsController],
  providers: [BoardColumnsService, BoardColumnsGateway],
  exports: [BoardColumnsService],
})
export class BoardColumnsModule {}
