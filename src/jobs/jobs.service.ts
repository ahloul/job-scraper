// src/jobs/jobs.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from './schemas/job.schema';
import { Model } from 'mongoose';
import { ScraperService } from './scraper/scraper.service';
import { OpenaiService } from './openai/openai.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private readonly scraperService: ScraperService,
    private readonly openaiService: OpenaiService,
  ) {}

  async scrapeAndSummarize(url: string): Promise<Job> {
    // Check for existing job to prevent duplicates
    const existingJob = await this.jobModel.findOne({ url });
    if (existingJob) {
      return existingJob;
    }

    try {
      const content = await this.scraperService.scrape(url);
      const summary = await this.openaiService.summarize(content);

      // Use create() to create and save the job document
      const createdJob = await this.jobModel.create({
        url,
        summary,
      });

      return createdJob;
    } catch (error) {
      console.error('Error in scrapeAndSummarize:', error);
      throw new HttpException(
        'Failed to process the job posting.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Job[]> {
    try {
      return await this.jobModel.find().exec();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new HttpException('Failed to retrieve jobs.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<Job> {
    try {
      const job = await this.jobModel.findById(id).exec();
      if (!job) {
        throw new HttpException('Job not found.', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(`Error retrieving job with id ${id}:`, error);
      throw new HttpException('Failed to retrieve the job.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
