import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { NextResponse } from 'next/server';

// Function to decode HTML entities
function decodeHtmlEntities(str: string): string {
  const entities: { [key: string]: string } = {
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&atilde;': 'ã',
    '&otilde;': 'õ',
    '&ccedil;': 'ç',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&Atilde;': 'Ã',
    '&Otilde;': 'Õ',
    '&Ccedil;': 'Ç',
    '&nbsp;': ' ',
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>'
  };

  return str.replace(/&[a-zA-Z]+;/g, match => entities[match] || match);
}

// Function to draw text with basic formatting
function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  font: any,
  boldFont: any,
  color: any
) {
  // Replace HTML tags with their text content
  const cleanText = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();

  // Split text into paragraphs and then into lines that fit the width
  const paragraphs = cleanText.split('\n').filter(p => p.trim());
  let currentY = y;
  const lineHeight = fontSize * 1.5; // Increase line height for better readability

  for (const paragraph of paragraphs) {
    // Split paragraph into words
    const words = paragraph.split(' ');
    let currentLine = '';
    let currentWords: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > width && currentLine) {
        // Justify and draw current line
        const lineWords = currentWords;
        if (lineWords.length > 1 && i < words.length) { // Justify only if not the last line and has multiple words
          const totalWordWidth = lineWords.reduce((sum, word) => sum + font.widthOfTextAtSize(word, fontSize), 0);
          const totalSpacing = width - totalWordWidth;
          const spaceBetweenWords = totalSpacing / (lineWords.length - 1);
          
          let currentX = x;
          lineWords.forEach((word, index) => {
            page.drawText(word, {
              x: currentX,
              y: currentY,
              size: fontSize,
              font,
              color,
            });
            
            if (index < lineWords.length - 1) {
              currentX += font.widthOfTextAtSize(word, fontSize) + spaceBetweenWords;
            }
          });
        } else {
          // Last line or single word - align left
          page.drawText(currentLine.trim(), {
            x,
            y: currentY,
            size: fontSize,
            font,
            color,
          });
        }
        
        currentY -= lineHeight;
        currentLine = word;
        currentWords = [word];
      } else {
        currentLine = testLine;
        currentWords.push(word);
      }
    }
    
    // Draw the last line of the paragraph (not justified)
    if (currentLine) {
      page.drawText(currentLine.trim(), {
        x,
        y: currentY,
        size: fontSize,
        font,
        color,
      });
      currentY -= lineHeight * 1.2; // Add extra space between paragraphs
    }
  }

  return currentY;
}

export async function POST(request: Request) {
  try {
    const { sections } = await request.json();
    console.log('Recebido na API:', sections);

    console.log('Received sections:', JSON.stringify(sections, null, 2));

    if (!sections || !Array.isArray(sections)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid sections data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Constants for formatting
    const titleFontSize = 20;
    const sectionTitleFontSize = 16;
    const bodyFontSize = 12;
    const margin = 50;
    const sectionSpacing = 30;
    const paragraphSpacing = 10;
    
    let y = height - margin; // Start from top of page

    // Add title
    page.drawText('Política de Proteção de Dados Pessoais', {
      x: margin,
      y,
      size: titleFontSize,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= titleFontSize + sectionSpacing;

    // Add each section
    for (const section of sections) {
      try {
        console.log(`Processing section ${section.id}:`, {
          secao: section.secao,
          texto: section.texto
        });

        // Add section ID and name
        const sectionHeader = `${section.id} - ${section.secao}`;
        page.drawText(sectionHeader, {
          x: margin,
          y,
          size: sectionTitleFontSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= sectionTitleFontSize + paragraphSpacing;

        // Add title content
        
        y -= bodyFontSize + paragraphSpacing;

        // Add text content if present
        if (section.texto !== undefined) {
          // Process HTML content
          const decodedText = decodeHtmlEntities(section.texto ?? '');
          console.log(`Decoded text for section ${section.id}:`, decodedText);
          
          // Draw text with basic formatting
          y = drawText(
            page,
            decodedText,
            margin,
            y,
            width - (2 * margin),
            bodyFontSize,
            font,
            boldFont,
            rgb(0, 0, 0)
          );

          // Add a new page if we're running out of space
          if (y < margin) {
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            page = newPage;
            y = height - margin;
          }
        }
        
        y -= sectionSpacing; // Add space between sections
      } catch (error) {
        console.error(`Error processing section ${section.id}:`, error);
        // Continue with next section
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as a response
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="politica-protecao-dados.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 