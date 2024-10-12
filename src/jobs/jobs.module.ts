import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { ScraperService } from './scraper/scraper.service';
import { OpenaiService } from './openai/openai.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],
  providers: [JobsService, ScraperService, OpenaiService],
  controllers: [JobsController],
})
export class JobsModule {}
