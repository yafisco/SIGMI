import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface GMITemplateData {
  type: 'facture' | 'rapport' | 'demande_agrement';
  numero?: string;
  titre?: string;
  date?: string;
  client?: string;
  objet?: string;
  contenu?: string;
  montant?: number;
  data?: any;
}

async function getLogoBase64(): Promise<string> {
  const response = await fetch('/logo-document.png');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateGMITPDF(data: GMITemplateData): Promise<jsPDF> {
  const doc = new jsPDF();
  
  try {
    // Logo image en base64 - taille ajustée
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', 15, 15, 40, 40);
  } catch (error) {
    // Fallback si l'image ne charge pas
    doc.setFontSize(24);
    doc.setTextColor(29, 78, 216);
    doc.text('MI', 15, 35);
  }

  // Texte des pôles à droite du logo - format compact
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Ingénierie Informatique, Génie Civil & BTP,', 60, 25);
  doc.text('Transition Energétique, Trading International,', 60, 35);
  
  // Ligne de séparation
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(15, 60, 195, 60);
  
  let yPos = 75;
  
  // Pour demande d'agrément : "A........." en haut à droite
  if (data.type === 'demande_agrement') {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('A.........', 170, yPos);
    yPos += 15;
  }

  // Référence
  if (data.numero) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Réf.: ${data.numero}`, 15, yPos);
    yPos += 12;
  }

  // Objet
  if (data.objet) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Objet: ${data.objet}`, 15, yPos);
    yPos += 15;
  }
  
  // Contenu principal
  if (data.contenu) {
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const contenuLines = doc.splitTextToSize(data.contenu, 170);
    contenuLines.forEach((line: string) => {
      doc.text(line, 15, yPos);
      yPos += 6;
    });
  }
  
  // Données spécifiques (pour rapports/factures)
  if (data.data) {
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Détails:', 15, yPos);
    yPos += 8;
    
    const details = Object.entries(data.data).map(([key, value]) => [key, String(value)]);
    autoTable(doc, {
      startY: yPos,
      head: [['Métrique', 'Valeur']],
      body: details,
      theme: 'grid',
      headStyles: { fillColor: [29, 78, 216], textColor: 255 },
      styles: { fontSize: 10 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Montant (pour factures)
  if (data.montant) {
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Montant: ${data.montant.toLocaleString('fr-FR')} FCFA`, 15, yPos);
    yPos += 15;
  }
  
  // Footer : Lieu, date et signature
  yPos += 20;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fait à Thiès le ${new Date().toLocaleDateString('fr-FR')}`, 15, yPos);

  // Signature alignée à droite
  yPos += 20;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Le Directeur Général', 150, yPos);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(135, yPos + 2, 175, yPos + 2);

  // Pied de page avec informations de contact
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);

    // Informations de contact en bas de page
    let footerY = 275;
    doc.text('Holding GROUP MI', 15, footerY);
    footerY += 4;
    doc.text('Dixième RIAOM, Derrière la Manufacture, Thiès, Sénégal', 15, footerY);
    footerY += 4;
    doc.text('RC : SN DKR 2026-B-16607  |  NINEA : 013042817 2V2', 15, footerY);
    footerY += 4;
    doc.text('Tel : 77 450 20 32  |  Email : info@madinainfotech.com', 15, footerY);

    // Numéro de page
    doc.text(`Page ${i} / ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return doc;
}
