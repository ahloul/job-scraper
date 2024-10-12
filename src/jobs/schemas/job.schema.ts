// src/jobs/schemas/job.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

@Schema()
export class Job {
  @Prop()
  _id?: Types.ObjectId; // Added _id as optional

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  summary: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
