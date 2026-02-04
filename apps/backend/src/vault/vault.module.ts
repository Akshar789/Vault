import { Module } from '@nestjs/common';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { DatabaseService } from '../database/database.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VaultController],
  providers: [VaultService, DatabaseService],
})
export class VaultModule {}
