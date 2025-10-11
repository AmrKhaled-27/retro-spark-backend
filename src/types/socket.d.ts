import { Socket } from 'socket.io';
import { AuthenticatedUser } from './auth.types';
import { BoardColumn } from '@prisma/client';
import { JoinBoardDto } from '../dto/join-board.dto';
import { UpdateBoardColumnDto } from '../dto/update-board-column.dto';
import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  user?: AuthenticatedUser;
}

export interface ServerToClientEvents {
  ColumnEdited: (payload: BoardColumn) => void;
  SocketError: (error: any) => void;
}

export interface ClientToServerEvents {
  JoinBoard: (payload: JoinBoardDto) => BoardColumn[];
  LeaveBoard: (payload: JoinBoardDto) => boolean;
  EditColumn: (payload: UpdateBoardColumnDto) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
