import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ScrapeJobDto } from './dto/scrape-job.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('scrape')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Scrape a job posting from a URL' })
  @ApiResponse({ status: 201, description: 'Job successfully scraped.' })
  @ApiResponse({ status: 400, description: 'Invalid URL provided.' })
  async scrapeJob(@Body() scrapeJobDto: ScrapeJobDto) {
    try {
      const job = await this.jobsService.scrapeAndSummarize(scrapeJobDto.url);
      return job;
    } catch (error) {
      console.error('Error in scrapeJob controller:', error);
      throw new HttpException(
        error.message || 'Failed to scrape and summarize the job.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all job summaries' })
  @ApiResponse({ status: 200, description: 'List of all jobs.' })
  async findAll() {
    try {
      const jobs = await this.jobsService.findAll();
      return jobs;
    } catch (error) {
      console.error('Error in findAll controller:', error);
      throw new HttpException(
        'Failed to retrieve jobs.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a job summary by ID' })
  @ApiResponse({ status: 200, description: 'Job found.' })
  @ApiResponse({ status: 404, description: 'Job not found.' })
  async findOne(@Param('id') id: string) {
    try {
      const job = await this.jobsService.findOne(id);
      return job;
    } catch (error) {
      console.error(`Error in findOne controller with id ${id}:`, error);
      throw new HttpException(
        error.message || 'Failed to retrieve the job.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
