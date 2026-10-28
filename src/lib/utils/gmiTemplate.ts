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
  const response = await fetch('/logo-group-mi.png');
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
    // Logo image en base64
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'PNG', 20, 15, 30, 30);
  } catch (error) {
    // Fallback si l'image ne charge pas
    doc.setFontSize(24);
    doc.setTextColor(29, 78, 216);
    doc.text('MI', 20, 35);
  }
  
  // En-tête texte à côté du logo
  doc.setFontSize(18);
  doc.setTextColor(29, 78, 216);
  doc.text('GROUP MI', 60, 28);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Diversifier, innover, impacter', 60, 35);
  
  // 6 pôles à côté du logo
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 50);
  const poles = [
    'Ingénierie Informatique',
    'Génie Civil & BTP',
    'Transition Energétique',
    'Trading International',
    'Agro Business',
  ];
  
  let poleY = 42;
  poles.forEach((pole, index) => {
    doc.text(pole, 60, poleY);
    poleY += 5;
  });
  
  // Ligne de séparation
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(20, 75, 190, 75);
  
  let yPos = 90;
  
  // Titre du document
  if (data.titre) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(data.titre.toUpperCase(), 105, yPos, { align: 'center' });
    yPos += 15;
  }
  
  // Référence
  if (data.numero) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Réf.: ${data.numero}`, 20, yPos);
    yPos += 12;
  }
  
  // Date
  if (data.date) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date: ${data.date}`, 20, yPos);
    yPos += 12;
  }
  
  // Client
  if (data.client) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Client: ${data.client}`, 20, yPos);
    yPos += 12;
  }
  
  // Objet
  if (data.objet) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Objet: ${data.objet}`, 20, yPos);
    yPos += 15;
  }
  
  // Contenu
  if (data.contenu) {
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    const contenuLines = doc.splitTextToSize(data.contenu, 170);
    contenuLines.forEach((line: string) => {
      doc.text(line, 20, yPos);
      yPos += 6;
    });
  }
  
  // Données spécifiques (pour rapports/factures)
  if (data.data) {
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Détails:', 20, yPos);
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
    doc.text(`Montant: ${data.montant.toLocaleString('fr-FR')} FCFA`, 20, yPos);
    yPos += 15;
  }
  
  // Lieu et date signature
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('A..........', 20, yPos);
  yPos += 12;
  doc.text(`Fait à Thiès le ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos);
  
  // Signature soulignée
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Le Directeur Général', 20, yPos);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(20, yPos + 2, 70, yPos + 2);
  
  // Pied de page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} / ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('Document généré par SIGMI - Groupe MI', 105, 290, { align: 'center' });
  }
  
  return doc;
}
