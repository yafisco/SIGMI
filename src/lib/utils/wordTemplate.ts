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
          // En-tête
          new Paragraph({
            children: [
              new TextRun({
                text: 'GROUP MI',
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Diversifier, Innover, Impacter',
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '______________________________________',
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
              }),
            ],
            spacing: { after: 400 },
          }),

          // Contenu
          new Paragraph({
            text: data.contenu || '',
            spacing: { after: 200 },
          }),

          // Formule de politesse
          new Paragraph({
            text: 'Veuillez agréer, Monsieur, l\'expression de nos salutations distinguées.',
            spacing: { before: 400, after: 200 },
          }),

          // Signature
          new Paragraph({
            children: [
              new TextRun({
                text: 'Le Directeur Général',
                bold: true,
              }),
            ],
            spacing: { before: 400 },
          }),

          // Footer avec informations GROUP MI
          new Paragraph({
            children: [
              new TextRun({
                text: '______________________________________',
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
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dixième RIAOM, Derrière la Manufacture, Thiès, Sénégal',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'RC: SN DKR 2026-B-16607 | NINEA: 013042817 2V2',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Tél: 77 450 20 32 | Email: info@madinainfotech.com',
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
