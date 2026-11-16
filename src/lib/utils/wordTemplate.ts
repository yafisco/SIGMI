import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export interface WordTemplateData {
  type: 'demande_agrement';
  numero: string;
  objet: string;
  contenu: string;
  destinataire: string;
}

export async function generateWordDocument(data: WordTemplateData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // En-tête GROUP MI
          new Paragraph({
            children: [
              new TextRun({
                text: 'GROUP MI',
                bold: true,
                size: 48,
                color: '1D4ED8',
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Ingénierie Informatique | Génie Civil & BTP | Transition Energétique | Trading International',
                bold: true,
                size: 22,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Diversifier, Innover, Impacter',
                bold: true,
                size: 24,
                color: 'D4AF37',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '______________________________________',
                color: 'D4AF37',
              }),
            ],
            alignment: AlignmentType.CENTER,
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
                text: '______________________________________',
                color: 'D4AF37',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'GROUP MI',
                bold: true,
                size: 28,
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
