import jsPDF from 'jspdf';

interface HeaderFooterOptions {
  title: string;
  logoBase64?: string;
}

interface FooterOptions {
  pageNumber: number;
  totalPages: number;
}

export function addGMIHeader(doc: jsPDF, options: HeaderFooterOptions): number {
  const pageWidth = 210;
  const margin = 15;

  // Logo
  if (options.logoBase64) {
    doc.addImage(options.logoBase64, 'PNG', margin, margin, 40, 40);
  } else {
    doc.setFontSize(24);
    doc.setTextColor(29, 78, 216);
    doc.text('MI', margin, margin + 15);
  }

  // Pôles
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Ingénierie Informatique, Génie Civil & BTP,', margin + 45, margin + 25);
  doc.text('Transition Energétique, Trading International,', margin + 45, margin + 35);

  // Ligne de séparation dorée
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 50, pageWidth - margin, margin + 50);

  // Titre centré
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  const titleWidth = doc.getTextWidth(options.title);
  doc.text(options.title, (pageWidth - titleWidth) / 2, margin + 65);

  return margin + 80; // Retourne la position Y après l'en-tête
}

export function addGMIFooter(doc: jsPDF, options: FooterOptions): void {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  // Ligne de séparation dorée
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('GROUP MI - Dixième RIAOM, Derrière la Manufacture, Thiès, Sénégal', margin, pageHeight - 15);
  doc.text('RC: SN DKR 2026-B-16607 | NINEA: 013042817 2V2 | Tél: 77 450 20 32', margin, pageHeight - 10);
  doc.text(`Page ${options.pageNumber} / ${options.totalPages}`, pageWidth - margin - 20, pageHeight - 10, { align: 'right' });
}

export async function loadLogoBase64(): Promise<string> {
  try {
    const logoBlob = await fetch('/logo-document.png').then(res => res.blob());
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(logoBlob);
    });
  } catch (error) {
    return '';
  }
}
