import { Controller, Body, Param, Patch, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BoardColumnsService } from './board-columns.service';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { SerializedBoardColumnDto } from './dto/serialized-board-column.dto';
import { ResponseDtoFor } from '../../common/dtos/generic-response.dto';

@ApiTags('Board Columns')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams/:teamId/board-columns')
export class BoardColumnsController {
  constructor(private readonly boardColumnsService: BoardColumnsService) {}

  @ApiOperation({ summary: 'Update a board column' })
  @ApiOkResponse({
    type: ResponseDtoFor({ fields: ['data'], dataDto: SerializedBoardColumnDto }),
    description: 'The board column has been successfully updated.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({ fields: ['errors'] }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({ type: ResponseDtoFor({ fields: ['errors'] }), description: 'Forbidden.' })
  @ApiParam({ name: 'teamId', type: 'number', description: 'The ID of the team' })
  @ApiParam({ name: 'columnId', type: 'number', description: 'The ID of the board column' })
  @Roles(Role.OWNER, Role.ADMIN, Role.FACILITATOR)
  @Serialize(SerializedBoardColumnDto)
  @Patch(':teamId/:columnId')
  update(
    @Param('columnId', ParseIntPipe) columnId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('teamId', ParseIntPipe) _teamId: number,
    @Body() updateBoardColumnDto: UpdateBoardColumnDto,
  ) {
    return this.boardColumnsService.update(columnId, updateBoardColumnDto);
  }

  @ApiOperation({ summary: 'Delete a board column' })
  @ApiNoContentResponse({ description: 'The board column has been successfully deleted.' })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({ fields: ['errors'] }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({ type: ResponseDtoFor({ fields: ['errors'] }), description: 'Forbidden.' })
  @ApiParam({ name: 'teamId', type: 'number', description: 'The ID of the team' })
  @ApiParam({ name: 'columnId', type: 'number', description: 'The ID of the board column' })
  @Roles(Role.OWNER, Role.ADMIN, Role.FACILITATOR)
  @Delete(':teamId/:columnId')
  remove(
    @Param('columnId', ParseIntPipe) columnId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('teamId', ParseIntPipe) _teamId: number,
  ) {
    return this.boardColumnsService.remove(columnId);
  }
}
