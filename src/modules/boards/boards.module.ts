import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { TeamModule } from '../team/team.module';
import { BoardColumnsModule } from '../board-columns/board-columns.module';

@Module({
  imports: [TeamModule, BoardColumnsModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
