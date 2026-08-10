import PDFDocument from 'pdfkit';
import https from 'https';
import http from 'http';
import { createChildLogger } from '../config/logger';

const logger = createChildLogger('pdf-export');

const THEME_COLORS: Record<string, { bg: string; accent: string; text: string; muted: string }> = {
  MINIMAL:   { bg: '#FFFFFF', accent: '#64748B', text: '#111827', muted: '#6B7280' },
  CORPORATE: { bg: '#F8FAFC', accent: '#1E3A8A', text: '#0F172A', muted: '#475569' },
  CREATIVE:  { bg: '#FFF7ED', accent: '#EA580C', text: '#1C1917', muted: '#78716C' },
  DARK:      { bg: '#111827', accent: '#22D3EE', text: '#F9FAFB', muted: '#9CA3AF' },
  ACADEMIC:  { bg: '#FFFFFF', accent: '#065F46', text: '#1F2937', muted: '#6B7280' },
};

export interface SlideInput {
  order: number;
  title: string;
  content: string;
  notes?: string | null;
  imageUrl?: string | null;
}

const fetchImageBuffer = (url: string): Promise<Buffer | null> =>
  new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;
      protocol.get(url, (res) => {
        if (res.statusCode !== 200) { res.resume(); resolve(null); return; }
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', () => resolve(null));
      }).on('error', () => resolve(null));
    } catch { resolve(null); }
  });

export class PdfExportService {
  private readonly W = 960;
  private readonly H = 540;

  async generateBuffer(title: string, theme: string, slides: SlideInput[]): Promise<Buffer> {
    const colors = THEME_COLORS[theme] ?? THEME_COLORS.MINIMAL;
    const { W, H } = this;

    const doc = new PDFDocument({ size: [W, H], margin: 0, autoFirstPage: false });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const bufferReady = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    for (const slide of slides) {
      doc.addPage({ size: [W, H], margin: 0 });
      doc.rect(0, 0, W, H).fill(colors.bg);

      const imageBuffer = slide.imageUrl ? await fetchImageBuffer(slide.imageUrl) : null;

      if (imageBuffer) {
        const imgX = Math.round(W * 0.56);
        const imgW = W - imgX;
        try { doc.image(imageBuffer, imgX, 0, { width: imgW, height: H }); }
        catch { logger.warn({ slideOrder: slide.order }, 'Could not embed image'); }

        doc.rect(0, 0, imgX, 10).fill(colors.accent);
        doc.fillColor(colors.muted).font('Helvetica').fontSize(9).text(`${slide.order} / ${slides.length}`, 50, 28);
        doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(26).text(slide.title, 50, 55, { width: imgX - 70, lineGap: 4 });
        const titleH = doc.heightOfString(slide.title, { width: imgX - 70 });
        doc.fillColor(colors.text).font('Helvetica').fontSize(13).text(slide.content, 50, 55 + titleH + 18, { width: imgX - 70, lineGap: 5, height: H - 55 - titleH - 60 });
      } else {
        doc.rect(0, 0, W, 10).fill(colors.accent);
        doc.fillColor(colors.muted).font('Helvetica').fontSize(9).text(`${slide.order} / ${slides.length}`, 60, 28);
        doc.fillColor(colors.text).font('Helvetica-Bold').fontSize(32).text(slide.title, 60, 60, { width: 840, lineGap: 4 });
        const titleH = doc.heightOfString(slide.title, { width: 840 });
        doc.fillColor(colors.text).font('Helvetica').fontSize(15).text(slide.content, 60, 60 + titleH + 20, { width: 840, lineGap: 6, height: H - 60 - titleH - 60 });
      }

      doc.fillColor(colors.muted).font('Helvetica').fontSize(8).text(title, 50, H - 24, { width: W - 100, align: 'center' });
    }

    doc.end();
    return bufferReady;
  }
}

export const pdfExportService = new PdfExportService();
