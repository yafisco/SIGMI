import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, convertInchesToTwip } from 'docx';

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
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
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
                    ],
                    verticalAlign: 'center',
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
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
                            font: 'Eras Light ITC',
                            size: 32, // taille 16 points = 32 half-points
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Transition Energétique, Trading International, Agro Business',
                            font: 'Eras Light ITC',
                            size: 32,
                          }),
                        ],
                      }),
                    ],
                    verticalAlign: 'center',
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
          }),

          // Première barre de séparation après l'en-tête (ligne complète)
          new Paragraph({
            children: [
              new TextRun({
                text: '____________________________________________________________________________',
              }),
            ],
            spacing: { after: 400 },
          }),

          // Destinataire en haut à droite
          new Paragraph({
            children: [
              new TextRun({
                text: data.destinataire || 'A......',
                font: 'Eras Light ITC',
                size: 22, // taille 11 points = 22 half-points
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          }),

          // Référence
          new Paragraph({
            children: [
              new TextRun({
                text: `Réf. : ${data.numero || ''}`,
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Objet souligné
          new Paragraph({
            children: [
              new TextRun({
                text: `Objet: ${data.objet || ''}`,
                font: 'Eras Light ITC',
                size: 22,
                underline: {},
              }),
            ],
            spacing: { after: 400 },
          }),

          // Contenu
          new Paragraph({
            children: [
              new TextRun({
                text: data.contenu || '',
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Formule de politesse
          new Paragraph({
            children: [
              new TextRun({
                text: 'Veuillez agréer, Monsieur, l\'expression de nos salutations distinguées.',
                font: 'Eras Light ITC',
                size: 22,
                italics: true,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          // Signature avec espace dédié
          new Paragraph({
            children: [
              new TextRun({
                text: `Fait à Thiès le ${new Date().toLocaleDateString('fr-FR')}`,
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 800, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Le Directeur Général',
                font: 'Eras Light ITC',
                size: 22,
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
          }),
          // Ligne pour signature
          new Paragraph({
            children: [
              new TextRun({
                text: '_____________________',
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 1200 },
          }),

          // Footer avec plus d'espacement avant pour éviter le chevauchement
          new Paragraph({
            children: [
              new TextRun({
                text: '____________________________________________________________________________',
              }),
            ],
            spacing: { before: 400, after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Holding GROUP MI',
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dixième RIAOM, Derrière la Manufacture, Thiès, Sénégal',
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'RC : SN DKR 2026-B-16607',
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'NINEA : 013042817 2V2',
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Tel : 77 450 20 32',
                font: 'Eras Light ITC',
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Email : info@madinainfotech.com',
                font: 'Eras Light ITC',
                size: 22,
                color: '0000FF',
                underline: {},
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
