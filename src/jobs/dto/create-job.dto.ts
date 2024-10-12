import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ description: 'Job URL' })
  url: string;

  @ApiProperty({ description: 'Job summary' })
  summary: string;
}
