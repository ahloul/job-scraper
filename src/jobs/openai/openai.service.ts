import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {  OpenAI } from 'openai';

@Injectable()
export class OpenaiService {
  private client: OpenAI;

  constructor() {

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
    });
  }

 
  async summarize(text: string): Promise<string> {
    try {
      const chatCompletion: OpenAI.Chat.ChatCompletion  = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that summarizes job descriptions.',
          },
          {
            role: 'user',
            content: `Please provide a concise summary of the following job description:\n\n${text}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      const summary = chatCompletion.choices[0].message?.content.trim();

      if (!summary) {
        throw new HttpException(
          'Received empty response from OpenAI API.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return summary;
    } catch (error) {
      console.error('Error summarizing text with OpenAI:', error);
      throw new HttpException(
        'Failed to summarize the text using OpenAI API.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
