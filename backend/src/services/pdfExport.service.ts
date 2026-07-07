import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { createChildLogger } from '../config/logger';

const logger = createChildLogger('pdf-export');

const EXPORT_DIR = path.join(process.cwd(), 'storage', 'exports');

const THEME_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  MINIMAL: { bg: '#FFFFFF', accent: '#2563EB', text: '#111827' },
  CORPORATE: { bg: '#F8FAFC', accent: '#1E3A8A', text: '#0F172A' },
  CREATIVE: { bg: '#FFF7ED', accent: '#EA580C', text: '#1C1917' },
  DARK: { bg: '#111827', accent: '#22D3EE', text: '#F9FAFB' },
  ACADEMIC: { bg: '#FFFFFF', accent: '#065F46', text: '#1F2937' },
};

interface SlideInput {
  order: number;
  title: string;
  content: string;
  notes?: string | null;
}


export class PdfExportService {
  ensureExportDir() {
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }
  }

  async generate(presentationId: string, title: string, theme: string, slides: SlideInput[]): Promise<string> {
    this.ensureExportDir();
    const colors = THEME_COLORS[theme] ?? THEME_COLORS.MINIMAL;
    const filename = `${presentationId}.pdf`;
    const filepath = path.join(EXPORT_DIR, filename);

    const doc = new PDFDocument({ size: [960, 540], margin: 0 }); 
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    slides.forEach((slide, idx) => {
      if (idx > 0) doc.addPage({ size: [960, 540], margin: 0 });

      doc.rect(0, 0, 960, 540).fill(colors.bg);

      // Accent bar
      doc.rect(0, 0, 960, 12).fill(colors.accent);

      doc
        .fillColor(colors.text)
        .font('Helvetica-Bold')
        .fontSize(32)
        .text(slide.title, 60, 80, { width: 840 });

      doc
        .fillColor(colors.text)
        .font('Helvetica')
        .fontSize(18)
        .text(slide.content, 60, 160, { width: 840, lineGap: 6 });

      doc
        .fillColor(colors.accent)
        .font('Helvetica-Oblique')
        .fontSize(12)
        .text(`Slide ${slide.order} of ${slides.length}`, 60, 500);
    });

    doc.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });

    logger.info({ presentationId, filepath }, 'PDF export generated');
    return `/storage/exports/${filename}`;
  }

  getAbsolutePath(filename: string): string {
    return path.join(EXPORT_DIR, filename);
  }
}

export const pdfExportService = new PdfExportService();
