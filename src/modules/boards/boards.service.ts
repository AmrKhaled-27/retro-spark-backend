import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createBoardDto: CreateBoardDto, teamId: number) {
    return this.prisma.board.create({ data: { ...createBoardDto, teamId } });
  }

  findAll(teamId: number) {
    return this.prisma.board.findMany({ where: { teamId } });
  }

  async findOne(id: number, teamId: number) {
    const board = await this.prisma.board.findFirst({
      where: { id, teamId },
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
