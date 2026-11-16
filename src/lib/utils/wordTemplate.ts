import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx';

export interface WordTemplateData {
  type: 'demande_agrement';
  numero: string;
  objet: string;
  contenu: string;
  destinataire: string;
}

async function getLogoImage(): Promise<ImageRun | null> {
  try {
    const logoResponse = await fetch('/logo-document.png');
    const logoBlob = await logoResponse.blob();
    const logoArrayBuffer = await logoBlob.arrayBuffer();
    // @ts-ignore
    return new ImageRun({
      data: logoArrayBuffer,
      transformation: {
        width: 100,
        height: 100,
      },
    });
  } catch (error) {
    console.log('Logo non disponible');
    return null;
  }
}

export async function generateWordDocument(data: WordTemplateData): Promise<Blob> {
  const logoImage = await getLogoImage();

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // En-tête avec logo à gauche et pôles à droite
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 30,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [
                      new Paragraph({
                        children: logoImage ? [logoImage] : [
                          new TextRun({
                            text: 'GROUP MI',
                            bold: true,
                            size: 48,
                            color: '1D4ED8',
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Diversifier, Innover, Impacter',
                            bold: true,
                            size: 16,
                            color: 'D4AF37',
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    verticalAlign: 'center',
                  }),
                  new TableCell({
                    width: {
                      size: 70,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Ingénierie Informatique, Génie Civil & BTP,',
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Transition Energétique, Trading International',
                            bold: true,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: 'center',
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          }),

          // Ligne de séparation dorée
          new Paragraph({
            children: [
              new TextRun({
                text: '─'.repeat(40),
                color: 'D4AF37',
              }),
            ],
            spacing: { after: 400 },
          }),

          // Destinataire
          new Paragraph({
            children: [
              new TextRun({
                text: `À : ${data.destinataire || 'Monsieur le Directeur Général'}`,
                bold: true,
                size: 12,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Référence
          new Paragraph({
            children: [
              new TextRun({
                text: `Réf. : ${data.numero || ''}`,
                bold: true,
                size: 12,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Objet
          new Paragraph({
            children: [
              new TextRun({
                text: `Objet : ${data.objet || ''}`,
                bold: true,
                size: 12,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Contenu
          new Paragraph({
            children: [
              new TextRun({
                text: data.contenu || '',
                size: 11,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Formule de politesse
          new Paragraph({
            children: [
              new TextRun({
                text: 'Veuillez agréer, Monsieur, l\'expression de nos salutations distinguées.',
                size: 11,
                italics: true,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          // Signature
          new Paragraph({
            children: [
              new TextRun({
                text: 'Le Directeur Général',
                bold: true,
                size: 12,
              }),
            ],
            spacing: { before: 400 },
          }),

          // Footer avec informations GROUP MI
          new Paragraph({
            children: [
              new TextRun({
                text: '─'.repeat(40),
                color: 'D4AF37',
              }),
            ],
            spacing: { before: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'GROUP MI',
                bold: true,
                size: 24,
                color: '1D4ED8',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dixième RIAOM, Derrière la Manufacture, Thiès, Sénégal',
                size: 10,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'RC: SN DKR 2026-B-16607 | NINEA: 013042817 2V2',
                size: 10,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Tél: 77 450 20 32 | Email: info@madinainfotech.com',
                size: 10,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
