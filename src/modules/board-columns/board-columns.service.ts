import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { DefaultColumn } from './types/default-columns.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class BoardColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: number, updateBoardColumnDto: UpdateBoardColumnDto) {
    const column = await this.prisma.boardColumn.findUnique({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    if (updateBoardColumnDto.index !== undefined && updateBoardColumnDto.index !== column.index) {
      await this.prisma.$transaction(async (prisma) => {
        const { board_id, index: oldIndex } = column;
        const newIndex = updateBoardColumnDto.index;

        const {
          _count: { id: column_count },
        } = await prisma.boardColumn.aggregate({
          where: { board_id },
          _count: { id: true },
        });

        await prisma.boardColumn.update({
          where: { id },
          data: { index: column_count },
        });

        if (newIndex > oldIndex) {
          await prisma.boardColumn.updateMany({
            where: {
              board_id,
              index: {
                gt: oldIndex,
                lte: newIndex,
              },
            },
            data: {
              index: {
                decrement: 1,
              },
            },
          });
        } else {
          await prisma.boardColumn.updateMany({
            where: {
              board_id,
              index: {
                gte: newIndex,
                lt: oldIndex,
              },
            },
            data: {
              index: {
                increment: 1,
              },
            },
          });
        }

        await prisma.boardColumn.update({
          where: { id },
          data: { index: newIndex },
        });
      });
    }

    return this.prisma.boardColumn.update({
      where: { id },
      data: {
        title: updateBoardColumnDto.title,
        is_active: updateBoardColumnDto.is_active,
      },
    });
  }

  async remove(id: number, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    const column = await prisma.boardColumn.findUnique({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    await prisma.boardColumn.delete({ where: { id } });

    await prisma.boardColumn.updateMany({
      where: {
        board_id: column.board_id,
        index: {
          gt: column.index,
        },
      },
      data: {
        index: {
          decrement: 1,
        },
      },
    });

    return { message: 'Board column deleted successfully' };
  }

  async createDefaultColumns(boardId: number, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    const defaultColumns = [
      { title: DefaultColumn.WentWell, index: 0, board_id: boardId },
      { title: DefaultColumn.ToImprove, index: 1, board_id: boardId },
      { title: DefaultColumn.ActionItems, index: 2, board_id: boardId },
    ];

    await prisma.boardColumn.createMany({
      data: defaultColumns,
    });
  }
}
