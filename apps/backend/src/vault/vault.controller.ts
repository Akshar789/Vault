import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VaultService } from './vault.service';

@Controller('vault')
@UseGuards(AuthGuard('jwt'))
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('items')
  async getItems(@Request() req) {
    return this.vaultService.getItems(req.user.userId);
  }

  @Get('items/:id')
  async getItem(@Request() req, @Param('id') id: string) {
    return this.vaultService.getItem(req.user.userId, id);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async createItem(@Request() req, @Body() createItemDto: any) {
    return this.vaultService.createItem(req.user.userId, createItemDto);
  }

  @Put('items/:id')
  async updateItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateItemDto: any,
  ) {
    return this.vaultService.updateItem(req.user.userId, id, updateItemDto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@Request() req, @Param('id') id: string) {
    return this.vaultService.deleteItem(req.user.userId, id);
  }
}
