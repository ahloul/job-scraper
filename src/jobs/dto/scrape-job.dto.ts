import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScrapeJobDto {
  @ApiProperty({
    description: 'The URL of the job posting to scrape',
    example: 'https://example.com/job-posting',
  })
  @IsUrl()
  url: string;
}
