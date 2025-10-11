import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JoinBoardDto } from './dto/join-board.dto';
import { BoardColumnsService } from './board-columns.service';
import { Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/filters/ws-exception.filter';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { Server } from 'socket.io';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/types/auth.types';
import { ClientToServerEvents, ServerToClientEvents, TypedSocket } from '../../types/socket';

@UseFilters(WsExceptionFilter)
@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@WebSocketGateway({ namespace: 'board-columns', cors: true })
export class BoardColumnsGateway {
  @WebSocketServer()
  private readonly server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(BoardColumnsGateway.name);

  constructor(private readonly boardColumnsService: BoardColumnsService) {}

  @SubscribeMessage('JoinBoard')
  async joinBoard(
    @MessageBody() payload: JoinBoardDto,
    @ConnectedSocket() socket: TypedSocket,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`User (${user.email}) is joining board (${payload.boardId})`);

    socket.join(this.generateRoomName(payload.boardId));

    const columns = await this.boardColumnsService.getColumns(payload.boardId);
    return columns;
  }

  @SubscribeMessage('EditColumn')
  async editColumn(@MessageBody() payload: UpdateBoardColumnDto) {
    this.logger.log(`Updating column with id ${payload.columnId}`);

    const columnId = payload.columnId!;
    if (!columnId) {
      throw new WsException('Column id must be provided!');
    }

    const updatedColumn = await this.boardColumnsService.update(columnId, payload);
    this.server
      .to(this.generateRoomName(updatedColumn.board_id))
      .emit('ColumnEdited', updatedColumn);
  }

  @SubscribeMessage('LeaveBoard')
  async leaveBoard(
    @MessageBody() payload: JoinBoardDto,
    @ConnectedSocket() socket: TypedSocket,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.logger.log(`User (${user.email}) is leaving board (${payload.boardId})`);

    socket.leave(this.generateRoomName(payload.boardId));

    return true;
  }

  // Utils
  generateRoomName(boardId: number) {
    return `board-${boardId}`;
  }
}
