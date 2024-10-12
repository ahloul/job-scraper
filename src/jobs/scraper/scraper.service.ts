import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScraperService {
  async scrape(url: string): Promise<string> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Remove unnecessary elements
      await page.evaluate(() => {
        const elementsToRemove = document.querySelectorAll(
          'header, footer, nav, script, style, noscript, aside, .sidebar, .navigation, .nav, .footer, .header'
        );
        elementsToRemove.forEach((element) => element.remove());
      });

      // Get the page's text content
      const textContent = await page.evaluate(() => document.body.innerText);

      if (!textContent) {
        throw new HttpException(
          'Could not extract content from the page.',
          HttpStatus.BAD_REQUEST
        );
      }

      return textContent;
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error);
      throw new HttpException(
        'Failed to scrape the provided URL.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
