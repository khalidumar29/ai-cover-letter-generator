import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

/**
 * Renders a cover letter as a business-letter PDF.
 *
 * pdf-lib is used rather than a React renderer because the document is laid
 * out as flowing paragraphs on a page, not as a component tree, and its
 * standard fonts are built into the PDF spec — so there are no font files to
 * ship and nothing native to compile.
 */

// US Letter, in points.
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const BODY_SIZE = 11.5;
const BODY_LEADING = BODY_SIZE * 1.55;
const PARAGRAPH_GAP = BODY_SIZE * 0.85;

const INK = rgb(0.09, 0.09, 0.11);
const MUTED = rgb(0.45, 0.45, 0.49);

export type LetterDocument = {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  company: string;
  content: string;
  date: Date;
};

const dateFormat = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function renderLetterPdf(letter: LetterDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const body = await pdf.embedFont(StandardFonts.TimesRoman);
  const heading = await pdf.embedFont(StandardFonts.TimesRomanBold);

  pdf.setTitle(`Cover letter — ${letter.jobTitle} at ${letter.company}`);
  pdf.setAuthor(letter.applicantName);
  pdf.setCreator("AI Cover Letter Generator");
  pdf.setCreationDate(letter.date);

  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const nextPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  const drawLine = (text: string, font: PDFFont, size: number, color = INK) => {
    if (y - size < MARGIN) nextPage();
    page.drawText(text, { x: MARGIN, y: y - size, size, font, color });
    y -= size * 1.5;
  };

  // Letterhead: the applicant's own details, then the date.
  drawLine(sanitize(letter.applicantName), heading, 16);
  drawLine(sanitize(letter.applicantEmail), body, BODY_SIZE, MUTED);
  y -= BODY_SIZE;
  drawLine(dateFormat.format(letter.date), body, BODY_SIZE, MUTED);
  y -= BODY_SIZE;
  drawLine(sanitize(`${letter.jobTitle} — ${letter.company}`), heading, BODY_SIZE + 0.5);
  y -= PARAGRAPH_GAP;

  for (const paragraph of sanitize(letter.content).split(/\n{2,}/)) {
    const text = paragraph.replace(/\n/g, " ").trim();
    if (!text) continue;

    for (const line of wrap(text, body, BODY_SIZE, CONTENT_WIDTH)) {
      if (y - BODY_LEADING < MARGIN) nextPage();
      page.drawText(line, { x: MARGIN, y: y - BODY_SIZE, size: BODY_SIZE, font: body, color: INK });
      y -= BODY_LEADING;
    }
    y -= PARAGRAPH_GAP;
  }

  return pdf.save();
}

/** Greedy line breaking against the font's real glyph widths. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    // A single word wider than the column has to be split mid-word.
    current = font.widthOfTextAtSize(word, size) <= maxWidth ? word : breakWord(word, font, size, maxWidth, lines);
  }

  if (current) lines.push(current);
  return lines;
}

function breakWord(
  word: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
  lines: string[],
): string {
  let chunk = "";
  for (const character of word) {
    if (font.widthOfTextAtSize(chunk + character, size) > maxWidth && chunk) {
      lines.push(chunk);
      chunk = character;
    } else {
      chunk += character;
    }
  }
  return chunk;
}

/**
 * The standard fonts encode WinAnsi only, so anything outside it — an emoji,
 * a non-Latin script — would throw at draw time. Map the typography the model
 * actually emits and drop the rest.
 */
function sanitize(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”‟]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[   ]/g, " ")
    .replace(/[•●]/g, "-")
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, "");
}

/** Safe, readable filename for the Content-Disposition header. */
export function letterFilename(jobTitle: string, company: string): string {
  const slug = `${company}-${jobTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `cover-letter-${slug || "draft"}.pdf`;
}
