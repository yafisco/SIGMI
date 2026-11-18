import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addGMIHeader, addGMIFooter, loadLogoBase64 } from './gmiHeaderFooter';

interface DevisData {
  numero: string;
  date: string;
  date_validite: string;
  objet: string;
  client_nom: string;
  client_interlocuteur?: string;
  client_fonction?: string;
  client_adresse: string;
  client_ville?: string;
  client_pays?: string;
  client_tel: string;
  client_email: string;
  commercial_nom: string;
  lignes: Array<{
    n: number;
    designation: string;
    description?: string;
    qte: number;
    unite: string;
    pu_ht: number;
    remise: number;
    total_ligne: number;
  }>;
  sous_total_ht: number;
  montant_remise: number;
  total_ht: number;
  taux_tva: number;
  montant_tva: number;
  total_ttc: number;
  total_ttc_en_lettres: string;
  conditions_paiement: string;
  delai_livraison: string;
  garantie: string;
  notes_client: string;
}

export async function generateDevisPDF(data: DevisData): Promise<jsPDF> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // Charger le logo
  const logoBase64 = await loadLogoBase64();

  // En-tête avec le même style que le PDF prospects
  let yPos = addGMIHeader(doc, { title: 'DEVIS', logoBase64 });

  // Bloc infos sur 2 colonnes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  // Colonne gauche : N°, Date, Validité, Objet, Commercial
  doc.setFont('helvetica', 'bold');
  doc.text('N° Devis :', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.numero, margin + 25, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Date :', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, margin + 25, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Valable jusqu\'au :', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date_validite, margin + 25, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Objet :', margin, yPos);
  doc.setFont('helvetica', 'normal');
  const objetText = doc.splitTextToSize(data.objet, 50);
  doc.text(objetText, margin + 25, yPos);
  yPos += objetText.length * 5;

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Commercial :', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.commercial_nom, margin + 25, yPos);

  // Colonne droite : Encadré CLIENT
  const clientBoxX = margin + 80;
  const clientBoxY = yPos - 42;
  const clientBoxWidth = pageWidth - margin - clientBoxX;
  const clientBoxHeight = 50;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(clientBoxX, clientBoxY, clientBoxWidth, clientBoxHeight);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CLIENT', clientBoxX + 5, clientBoxY + 7);

  let clientY = clientBoxY + 14;
  doc.setFont('helvetica', 'bold');
  doc.text('Entreprise :', clientBoxX + 5, clientY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(data.client_nom, clientBoxX + 35, clientY);

  if (data.client_interlocuteur) {
    clientY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Interlocuteur :', clientBoxX + 5, clientY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const interlocuteurText = data.client_fonction 
      ? `${data.client_interlocuteur} (${data.client_fonction})`
      : data.client_interlocuteur;
    doc.text(interlocuteurText, clientBoxX + 35, clientY);
  }

  clientY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Adresse :', clientBoxX + 5, clientY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const adresseText = [data.client_adresse, data.client_ville, data.client_pays].filter(Boolean).join(', ');
  doc.text(adresseText || '-', clientBoxX + 35, clientY);

  clientY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Tél :', clientBoxX + 5, clientY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(data.client_tel, clientBoxX + 35, clientY);

  clientY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Email :', clientBoxX + 5, clientY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(data.client_email, clientBoxX + 35, clientY);

  yPos = clientBoxY + clientBoxHeight + 10;

  // Tableau des lignes
  const tableData = data.lignes.map(ligne => [
    ligne.n.toString(),
    ligne.designation,
    ligne.qte.toString(),
    ligne.unite,
    ligne.pu_ht.toLocaleString('fr-FR'),
    ligne.remise > 0 ? `${ligne.remise}%` : '-',
    ligne.total_ligne.toLocaleString('fr-FR'),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Désignation', 'Qté', 'Unité', 'P.U. HT', 'Remise', 'Total HT']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [100, 100, 100],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: 6,
      halign: 'center',
      valign: 'middle',
    },
    styles: {
      fontSize: 9,
      cellPadding: 5,
      halign: 'left',
      valign: 'middle',
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 18 },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 25, halign: 'right' },
    },
    didDrawPage: (data) => {
      // Footer sur chaque page
      addGMIFooter(doc, { pageNumber: doc.internal.pages.length, totalPages: doc.internal.pages.length });
    },
  });

  // Description sous chaque ligne
  yPos = (doc as any).lastAutoTable.finalY + 3;
  data.lignes.forEach((ligne) => {
    if (ligne.description) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const descLines = doc.splitTextToSize(ligne.description, 80);
      descLines.forEach((line: string) => {
        doc.text(line, margin + 25, yPos);
        yPos += 4;
      });
    }
  });

  // Vérifier s'il faut ajouter une page pour le reste du contenu
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = margin;
    addGMIHeader(doc, { title: 'DEVIS (suite)', logoBase64 });
  }

  // Bloc totaux, aligné à droite
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Sous-total HT :`, pageWidth - margin - 60, yPos, { align: 'right' });
  doc.text(`${data.sous_total_ht.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 10, yPos, { align: 'right' });

  if (data.montant_remise > 0) {
    yPos += 6;
    doc.text(`Remise :`, pageWidth - margin - 60, yPos, { align: 'right' });
    doc.text(`− ${data.montant_remise.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 10, yPos, { align: 'right' });
  }

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total HT :`, pageWidth - margin - 60, yPos, { align: 'right' });
  doc.text(`${data.total_ht.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 10, yPos, { align: 'right' });

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`TVA (${data.taux_tva} %) :`, pageWidth - margin - 60, yPos, { align: 'right' });
  doc.text(`${data.montant_tva.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 10, yPos, { align: 'right' });

  // TOTAL TTC en gras sur fond gris foncé
  yPos += 6;
  doc.setFillColor(100, 100, 100);
  doc.rect(pageWidth - margin - 65, yPos - 5, 60, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`TOTAL TTC :`, pageWidth - margin - 60, yPos, { align: 'right' });
  doc.text(`${data.total_ttc.toLocaleString('fr-FR')} FCFA`, pageWidth - margin - 10, yPos, { align: 'right' });

  // Montant en lettres
  yPos += 15;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Arrêté le présent devis à la somme de :`, margin, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.total_ttc_en_lettres} francs CFA.`, margin, yPos);

  // Conditions
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CONDITIONS', margin, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.text(`• Paiement : ${data.conditions_paiement}`, margin, yPos);
  yPos += 5;
  doc.text(`• Délai de livraison : ${data.delai_livraison}`, margin, yPos);
  yPos += 5;
  doc.text(`• Garantie : ${data.garantie}`, margin, yPos);

  // Notes client
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('NOTES', margin, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const notesLines = doc.splitTextToSize(data.notes_client, contentWidth);
  notesLines.forEach((line: string) => {
    doc.text(line, margin, yPos);
    yPos += 5;
  });

  // Vérifier s'il faut ajouter une page pour la signature
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = margin;
    addGMIHeader(doc, { title: 'DEVIS (suite)', logoBase64 });
  }

  // Zone de signature sur 2 colonnes
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('BON POUR ACCORD', margin, yPos);
  doc.text('Pour GROUP MI', pageWidth - margin - 50, yPos, { align: 'right' });

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.text('Date : ______________', margin, yPos);
  doc.text(data.commercial_nom, pageWidth - margin - 50, yPos, { align: 'right' });

  yPos += 8;
  doc.text('Signature et cachet du client :', margin, yPos);
  doc.text('Signature :', pageWidth - margin - 50, yPos, { align: 'right' });

  // Footer final
  addGMIFooter(doc, { pageNumber: doc.internal.pages.length, totalPages: doc.internal.pages.length });

  return doc;
}
