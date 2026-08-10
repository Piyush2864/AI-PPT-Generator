import { createChildLogger } from '../config/logger';
import { env } from '../config/env';

const logger = createChildLogger('image-search');

export interface SlideImage {
  imageUrl: string;
  imagePhotographerName: string;
  imagePhotographerUrl: string;
}

interface UnsplashSearchResponse {
  results: Array<{
    urls: { regular: string; small: string };
    user: { name: string; links: { html: string } };
  }>;
}

export class ImageSearchService {
  private readonly accessKey = env.UNSPLASH_ACCESS_KEY;
  private readonly baseUrl = 'https://api.unsplash.com';

  async searchForSlide(
    slideTitle: string,
    presentationTopic: string,
  ): Promise<SlideImage | null> {
    if (!this.accessKey) return null;

   
    const rawQuery = `${slideTitle} ${presentationTopic}`;
    
    const query = rawQuery.split(/\s+/).slice(0, 6).join(' ');

    try {
      const url = new URL(`${this.baseUrl}/search/photos`);
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', '1');
      url.searchParams.set('orientation', 'landscape');
      url.searchParams.set('content_filter', 'high'); 

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1',
        },
      });

      if (!response.ok) {
        logger.warn({ status: response.status, query }, 'Unsplash API returned non-OK status');
        return null;
      }

      const data = (await response.json()) as UnsplashSearchResponse;
      const photo = data?.results?.[0];

      if (!photo) {
        logger.debug({ query }, 'No Unsplash results for query');
        return null;
      }

      
      return {
        imageUrl: photo.urls?.regular ?? photo.urls?.small,
        imagePhotographerName: photo.user?.name ?? 'Unknown',
        imagePhotographerUrl: `${photo.user?.links?.html}?utm_source=slideforge&utm_medium=referral`,
      };
    } catch (err) {
      logger.warn({ err, query }, 'Unsplash image fetch failed — continuing without image');
      return null;
    }
  }

  async fetchImagesForSlides(
    slides: { title: string }[],
    presentationTopic: string,
  ): Promise<(SlideImage | null)[]> {
    if (!this.accessKey) return slides.map(() => null);

    const CONCURRENCY = 5;
    const results: (SlideImage | null)[] = [];

    for (let i = 0; i < slides.length; i += CONCURRENCY) {
      const batch = slides.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((slide) => this.searchForSlide(slide.title, presentationTopic)),
      );
      results.push(...batchResults);

      if (i + CONCURRENCY < slides.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    logger.info(
      {
        total: slides.length,
        found: results.filter(Boolean).length,
      },
      'Image fetch complete',
    );

    return results;
  }
}

export const imageSearchService = new ImageSearchService();
