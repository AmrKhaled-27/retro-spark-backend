import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { SerializedBoardDto } from './dto/serialized-board.dto';
import { ResponseDtoFor } from 'src/common/dtos/generic-response.dto';

@ApiTags('Boards')
@Controller('teams/:teamId/boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @ApiOperation({ summary: 'Create a new board' })
  @ApiCreatedResponse({
    type: ResponseDtoFor({ fields: ['data'], dataDto: SerializedBoardDto }),
    description: 'The board has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({ fields: ['errors'] }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({ type: ResponseDtoFor({ fields: ['errors'] }), description: 'Forbidden.' })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Serialize(SerializedBoardDto)
  @Post()
  create(@Param('teamId') teamId: string, @Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto, +teamId);
  }

  @ApiOperation({ summary: 'Get all boards for a team' })
  @ApiOkResponse({
    type: ResponseDtoFor({ fields: ['data'], dataDto: [SerializedBoardDto] }),
    description: 'List of boards.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({ fields: ['errors'] }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({ type: ResponseDtoFor({ fields: ['errors'] }), description: 'Forbidden.' })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.FACILITATOR, Role.PARTICIPANT)
  @Serialize(SerializedBoardDto)
  @Get()
  findAll(@Param('teamId') teamId: string) {
    return this.boardsService.findAll(+teamId);
  }

  @ApiOperation({ summary: 'Get a specific board' })
  @ApiOkResponse({
    type: ResponseDtoFor({ fields: ['data'], dataDto: SerializedBoardDto }),
    description: 'Board details.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({ fields: ['errors'] }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({ type: ResponseDtoFor({ fields: ['errors'] }), description: 'Forbidden.' })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.FACILITATOR, Role.PARTICIPANT)
  @Serialize(SerializedBoardDto)
  @Get(':boardId')
  findOne(@Param('boardId') id: string, @Param('teamId') teamId: string) {
    return this.boardsService.findOne(+id, +teamId);
  }

  @ApiOperation({ summary: 'Update a board' })
  @ApiOkResponse({
    type: ResponseDtoFor({ fields: ['data'], dataDto: SerializedBoardDto }),
    description: 'The board has been successfully updated.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({ fields: ['errors'] }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({ type: ResponseDtoFor({ fields: ['errors'] }), description: 'Forbidden.' })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Serialize(SerializedBoardDto)
  @Patch(':boardId')
  update(
    @Param('boardId') id: string,
    @Param('teamId') teamId: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(+id, +teamId, updateBoardDto);
  }

  @ApiOperation({ summary: 'Delete a board' })
  @ApiNoContentResponse({ description: 'The board has been successfully deleted.' })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({ fields: ['errors'] }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({ type: ResponseDtoFor({ fields: ['errors'] }), description: 'Forbidden.' })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':boardId')
  remove(@Param('boardId') id: string, @Param('teamId') teamId: string) {
    return this.boardsService.remove(+id, +teamId);
  }
}
