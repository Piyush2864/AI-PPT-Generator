import PptxGenJS from 'pptxgenjs';
import https from 'https';
import http from 'http';
import { createChildLogger } from '../config/logger';
import type { SlideInput } from './pdfExport.service';

const logger = createChildLogger('pptx-export');

const THEME_COLORS: Record<string, { bg: string; accent: string; text: string; muted: string }> = {
  MINIMAL:   { bg: 'FFFFFF', accent: '64748B', text: '111827', muted: '6B7280' },
  CORPORATE: { bg: 'F8FAFC', accent: '1E3A8A', text: '0F172A', muted: '475569' },
  CREATIVE:  { bg: 'FFF7ED', accent: 'EA580C', text: '1C1917', muted: '78716C' },
  DARK:      { bg: '111827', accent: '22D3EE', text: 'F9FAFB', muted: '9CA3AF' },
  ACADEMIC:  { bg: 'FFFFFF', accent: '065F46', text: '1F2937', muted: '6B7280' },
};

const fetchBase64Image = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;
      protocol
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            resolve(null);
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const buf = Buffer.concat(chunks);
            const mime = res.headers['content-type'] || 'image/jpeg';
            resolve(`data:${mime};base64,${buf.toString('base64')}`);
          });
          res.on('error', () => resolve(null));
        })
        .on('error', () => resolve(null));
    } catch {
      resolve(null);
    }
  });

export class PptxExportService {
  async generateBuffer(title: string, theme: string, slides: SlideInput[]): Promise<Buffer> {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = title;

    const colors = THEME_COLORS[theme] ?? THEME_COLORS.MINIMAL;

    for (const s of slides) {
      const slide = pptx.addSlide();
      slide.background = { color: colors.bg };

      
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.1,
        fill: { color: colors.accent },
        line: { color: colors.accent },
      });

      
      if (s.notes) {
        slide.addNotes(s.notes);
      }

      
      slide.addText(`SLIDE ${s.order} / ${slides.length}`, {
        x: 0.6,
        y: 0.3,
        w: 3.0,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: colors.muted,
        fontFace: 'Arial',
      });

      
      slide.addText(title, {
        x: 0.6,
        y: 5.2,
        w: 8.8,
        h: 0.3,
        fontSize: 9,
        color: colors.muted,
        fontFace: 'Arial',
        align: 'center',
      });

      const imageBase64 = s.imageUrl ? await fetchBase64Image(s.imageUrl) : null;

      if (imageBase64) {
        
        try {
          slide.addImage({
            data: imageBase64,
            x: 5.5,
            y: 0.5,
            w: 4.0,
            h: 4.4,
            sizing: { type: 'cover', w: 4.0, h: 4.4 },
          });
        } catch {
          logger.warn({ slideOrder: s.order }, 'Could not embed image in PPTX slide');
        }

        
        slide.addText(s.title, {
          x: 0.6,
          y: 0.7,
          w: 4.6,
          h: 1.0,
          fontSize: 22,
          bold: true,
          color: colors.text,
          fontFace: 'Arial',
        });

        
        const paragraphs = s.content.split('\n').filter(Boolean);
        const textObjects = paragraphs.map((p) => ({
          text: p,
          options: { fontSize: 13, color: colors.text, lineSpacing: 20, bullet: paragraphs.length > 1 },
        }));

        slide.addText(textObjects, {
          x: 0.6,
          y: 1.8,
          w: 4.6,
          h: 3.2,
          fontFace: 'Arial',
          valign: 'top',
        });
      } else {
        
        slide.addText(s.title, {
          x: 0.6,
          y: 0.7,
          w: 8.8,
          h: 1.0,
          fontSize: 26,
          bold: true,
          color: colors.text,
          fontFace: 'Arial',
        });

        const paragraphs = s.content.split('\n').filter(Boolean);
        const textObjects = paragraphs.map((p) => ({
          text: p,
          options: { fontSize: 14, color: colors.text, lineSpacing: 22, bullet: paragraphs.length > 1 },
        }));

        slide.addText(textObjects, {
          x: 0.6,
          y: 1.9,
          w: 8.8,
          h: 3.1,
          fontFace: 'Arial',
          valign: 'top',
        });
      }
    }

    const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    return buffer;
  }
}

export const pptxExportService = new PptxExportService();
