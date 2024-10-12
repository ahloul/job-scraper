// src/jobs/jobs.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getModelToken } from '@nestjs/mongoose';
import { Job } from './schemas/job.schema';
import { ScraperService } from './scraper/scraper.service';
import { OpenaiService } from './openai/openai.service';
import { Model, Types } from 'mongoose';

describe('JobsService', () => {
  let service: JobsService;
  let scraperService: ScraperService;
  let openaiService: OpenaiService;
  let jobModel: Model<Job>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        // Mock ScraperService
        {
          provide: ScraperService,
          useValue: {
            scrape: jest.fn(),
          },
        },
        // Mock OpenaiService
        {
          provide: OpenaiService,
          useValue: {
            summarize: jest.fn(),
          },
        },
        // Mock Job Model
        {
          provide: getModelToken(Job.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    scraperService = module.get<ScraperService>(ScraperService);
    openaiService = module.get<OpenaiService>(OpenaiService);
    jobModel = module.get<Model<Job>>(getModelToken(Job.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapeAndSummarize', () => {
    it('should return existing job if it exists', async () => {
      const url = 'http://example.com/job-posting';
      const existingJob = { _id: new Types.ObjectId(), url, summary: 'Existing summary' };

      (jobModel.findOne as jest.Mock).mockResolvedValue(existingJob);

      const result = await service.scrapeAndSummarize(url);

      expect(jobModel.findOne).toHaveBeenCalledWith({ url });
      expect(result).toEqual(existingJob);
    });

    it('should scrape, summarize, and save a new job', async () => {
      const url = 'http://example.com/job-posting';
      const scrapedContent = 'Scraped job description';
      const summary = 'Summarized job description';

      (jobModel.findOne as jest.Mock).mockResolvedValue(null);
      (scraperService.scrape as jest.Mock).mockResolvedValue(scrapedContent);
      (openaiService.summarize as jest.Mock).mockResolvedValue(summary);

      // Mock the create method to return the created job
      (jobModel.create as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        url,
        summary,
      });

      const result = await service.scrapeAndSummarize(url);

      expect(jobModel.findOne).toHaveBeenCalledWith({ url });
      expect(scraperService.scrape).toHaveBeenCalledWith(url);
      expect(openaiService.summarize).toHaveBeenCalledWith(scrapedContent);
      expect(jobModel.create).toHaveBeenCalledWith({ url, summary });
      expect(result).toMatchObject({ url, summary });
    });

    it('should throw an exception if scraping fails', async () => {
      const url = 'http://example.com/job-posting';

      (jobModel.findOne as jest.Mock).mockResolvedValue(null);
      (scraperService.scrape as jest.Mock).mockRejectedValue(new Error('Scraping failed'));

      await expect(service.scrapeAndSummarize(url)).rejects.toThrow(
        'Failed to process the job posting.',
      );

      expect(scraperService.scrape).toHaveBeenCalledWith(url);
    });

    it('should throw an exception if summarization fails', async () => {
      const url = 'http://example.com/job-posting';
      const scrapedContent = 'Scraped job description';

      (jobModel.findOne as jest.Mock).mockResolvedValue(null);
      (scraperService.scrape as jest.Mock).mockResolvedValue(scrapedContent);
      (openaiService.summarize as jest.Mock).mockRejectedValue(new Error('Summarization failed'));

      await expect(service.scrapeAndSummarize(url)).rejects.toThrow(
        'Failed to process the job posting.',
      );

      expect(scraperService.scrape).toHaveBeenCalledWith(url);
      expect(openaiService.summarize).toHaveBeenCalledWith(scrapedContent);
    });
  });

  describe('findAll', () => {
    it('should return all jobs', async () => {
      const jobs = [{ _id: new Types.ObjectId(), url: 'http://example.com', summary: 'Summary 1' }];

      (jobModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(jobs),
      });

      const result = await service.findAll();

      expect(jobModel.find).toHaveBeenCalled();
      expect(result).toEqual(jobs);
    });

    it('should throw an exception if retrieval fails', async () => {
      (jobModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findAll()).rejects.toThrow('Failed to retrieve jobs.');

      expect(jobModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a job by ID', async () => {
      const jobId = new Types.ObjectId().toHexString();
      const job = { _id: jobId, url: 'http://example.com', summary: 'Summary' };

      (jobModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(job),
      });

      const result = await service.findOne(jobId);

      expect(jobModel.findById).toHaveBeenCalledWith(jobId);
      expect(result).toEqual(job);
    });

    it('should throw a NotFoundException if job does not exist', async () => {
      const jobId = new Types.ObjectId().toHexString();

      (jobModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(jobId)).rejects.toThrow('Job not found.');

      expect(jobModel.findById).toHaveBeenCalledWith(jobId);
    });

    it('should throw an exception if retrieval fails', async () => {
      const jobId = new Types.ObjectId().toHexString();

      (jobModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findOne(jobId)).rejects.toThrow('Failed to retrieve the job.');

      expect(jobModel.findById).toHaveBeenCalledWith(jobId);
    });
  });
});
