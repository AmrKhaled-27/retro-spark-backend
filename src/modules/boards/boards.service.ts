import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardColumnsService } from '../board-columns/board-columns.service';

@Injectable()
export class BoardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardColumnsService: BoardColumnsService,
  ) {}

  async create(createBoardDto: CreateBoardDto, teamId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const board = await prisma.board.create({
        data: { ...createBoardDto, teamId },
      });

      await this.boardColumnsService.createDefaultColumns(board.id, prisma);

      return board;
    });
  }

  findAll(teamId: number) {
    return this.prisma.board.findMany({ where: { teamId }, include: { columns: true } });
  }

  async findOne(id: number, teamId: number) {
    const board = await this.prisma.board.findFirst({
      where: { id, teamId },
      include: { columns: true },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    return board;
  }

  async update(id: number, teamId: number, updateBoardDto: UpdateBoardDto) {
    await this.findOne(id, teamId);
    return this.prisma.board.update({
      where: { id },
      data: updateBoardDto,
    });
  }

  async remove(id: number, teamId: number) {
    await this.findOne(id, teamId);
    return this.prisma.board.delete({ where: { id } });
  }
}
