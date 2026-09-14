import { jsPDF } from 'jspdf';

export interface EstimatePdfPhase {
  label: string;
  pct: number;
  color: string;
  amount: number;
}

export interface EstimatePdfExtra {
  label: string;
  amount: number;
}

export interface EstimatePdfPkg {
  name: string;
  tier: string;
  rate: number;
  total: number;
  selected: boolean;
}

export interface EstimatePdfData {
  company: string;
  estimateId: string;
  date: string;
  category: string;
  packageName: string;
  packageTier: string;
  ratePerSqft: number;
  plotAreaSqft: number;
  builtUpPerFloorSqft: number;
  parkingSqft: number;
  totalBuiltUpSqft: number;
  configuration: string;
  durationMonths: number;
  baseCost: number;
  extrasCost: number;
  grandTotal: number;
  emiMonthly: number;
  monthlyOutflow: number;
  phases: EstimatePdfPhase[];
  extras: EstimatePdfExtra[];
  packages: EstimatePdfPkg[];
  disclaimer: string;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 46;

const CRUST: RGB = [21, 10, 4];
const BRAND: RGB = [255, 125, 0];
const INK: RGB = [24, 12, 5];
const GREY: RGB = [150, 138, 125];
const LINE: RGB = [232, 224, 214];
const TINT: RGB = [255, 233, 214];
const MUTE: RGB = [96, 40, 0];

type RGB = [number, number, number];

function money(n: number): string {
  return `Rs. ${Math.round(n).toLocaleString('en-IN')}`;
}

function sqft(n: number): string {
  return `${Math.round(n).toLocaleString('en-IN')} sqft`;
}

function parseHex(hex: string): RGB {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function buildEstimatePdf(d: EstimatePdfData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  let y = 0;

  doc.setProperties({
    title: `${d.company} — Construction Cost Estimate`,
    subject: 'Free construction cost estimation report',
    creator: d.company,
    keywords: 'construction, estimate, cost, ganesh builders',
  });

  const footer = (): void => {
    const page = doc.getNumberOfPages();
    if (page === 1) {
      return;
    }
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.7);
    doc.line(M, PAGE_H - 38, PAGE_W - M, PAGE_H - 38);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text(`${d.company} · Estimate prepared for planning purposes — not a binding quotation`, M, PAGE_H - 22);
    doc.text(`Page ${page}`, PAGE_W - M, PAGE_H - 22, { align: 'right' });
  };

  const pageBreak = (needed: number): void => {
    if (y + needed > PAGE_H - 52) {
      doc.addPage();
      y = M;
      footer();
    }
  };

  const heading = (label: string, title: string): void => {
    y += 14;
    pageBreak(34);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND);
    doc.text(label.toUpperCase(), M, y);
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(title, M, y);
    y += 8;
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(1.2);
    doc.line(M, y, M + 26, y);
    y += 16;
  };

  const drawDonutSlice = (
    cx: number,
    cy: number,
    rIn: number,
    rOut: number,
    startRad: number,
    endRad: number,
    color: RGB,
  ): void => {
    const steps = Math.max(6, Math.ceil((endRad - startRad) / (Math.PI / 18)));
    const outer: Array<[number, number]> = [];
    const inner: Array<[number, number]> = [];
    for (let i = 0; i <= steps; i++) {
      const a = startRad + ((endRad - startRad) * i) / steps;
      outer.push([cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut]);
      inner.push([cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn]);
    }
    doc.setFillColor(...color);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.9);
    doc.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) {
      doc.lineTo(outer[i][0], outer[i][1]);
    }
    for (let i = inner.length - 1; i >= 0; i--) {
      doc.lineTo(inner[i][0], inner[i][1]);
    }
    doc.close();
    doc.fillStroke();
  };

  /* ---------- masthead ---------- */

  doc.setFillColor(...CRUST);
  doc.rect(0, 0, PAGE_W, 104, 'F');
  doc.setFillColor(...BRAND);
  doc.rect(0, 104, PAGE_W, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(...BRAND);
  doc.text(d.company.toUpperCase(), M, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(214, 178, 140);
  doc.text('Chennai · Construction & Interior Contractors', M, 66);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND);
  doc.text('CONSTRUCTION COST ESTIMATE', PAGE_W - M, 46, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 190, 182);
  doc.text(d.date, PAGE_W - M, 62, { align: 'right' });
  doc.text(`Report ID  ${d.estimateId}`, PAGE_W - M, 76, { align: 'right' });

  y = 132;

  /* ---------- 1 · project summary ---------- */

  heading('Project Summary', 'Your Construction Plan');

  const snapshot: Array<[string, string]> = [
    ['Category', d.category],
    ['Construction package', `${d.packageName} — ${d.packageTier}`],
    ['Base construction rate', `Rs. ${d.ratePerSqft.toLocaleString('en-IN')} / sqft`],
    ['Configuration', d.configuration],
    ['Built-up area per floor', sqft(d.builtUpPerFloorSqft)],
    ['Total built-up area', sqft(d.totalBuiltUpSqft)],
    ['Plot area', sqft(d.plotAreaSqft)],
    ['Parking area', d.parkingSqft ? sqft(d.parkingSqft) : 'Not included'],
    ['Estimated duration', `${d.durationMonths} months`],
  ];

  for (const [lbl, val] of snapshot) {
    pageBreak(24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GREY);
    doc.text(lbl, M, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(val, PAGE_W - M, y, { align: 'right' });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(M, y + 7, PAGE_W - M, y + 7);
    y += 22;
  }

  /* ---------- 2 · total card ---------- */

  heading('Cost Snapshot', 'Estimated Construction Cost');

  const cardW = PAGE_W - M * 2;

  {
    pageBreak(114);
    const cTop = y - 4;
    doc.setFillColor(...BRAND);
    doc.rect(M, cTop, cardW, 96, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTE);
    doc.text('TOTAL ESTIMATED CONSTRUCTION COST — CHENNAI', M + 18, cTop + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text(money(d.grandTotal), M + 18, cTop + 42);
    doc.setDrawColor(255, 224, 196);
    doc.setLineWidth(0.8);
    doc.line(M + 18, cTop + 52, M + cardW - 18, cTop + 52);

    const statW = (cardW - 36) / 4;
    const stats: Array<[string, string]> = [
      ['Base rate', `Rs. ${d.ratePerSqft.toLocaleString('en-IN')} / sqft`],
      ['Total built-up', sqft(d.totalBuiltUpSqft)],
      ['Plot area', sqft(d.plotAreaSqft)],
      ['Configuration', d.configuration],
    ];
    stats.forEach(([lbl, val], i) => {
      const x = M + 18 + i * statW;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(val, x, cTop + 74);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(255, 224, 196);
      doc.text(lbl.toUpperCase(), x, cTop + 86);
    });
    y = cTop + 112;
  }

  /* ---------- 3 · duration card ---------- */

  heading('Schedule', 'Estimated Construction Duration');

  {
    pageBreak(96);
    const dTop = y - 4;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, dTop, cardW, 78, 12, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text('ESTIMATED CONSTRUCTION DURATION', M + 18, dTop + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...INK);
    doc.text(`${d.durationMonths} months`, M + 18, dTop + 40);

    const tX = M + 18;
    const tW = cardW - 36;
    const tY = dTop + 52;
    doc.setFillColor(240, 234, 226);
    doc.roundedRect(tX, tY, tW, 8, 4, 4, 'F');
    const fillW = Math.min(1, (d.durationMonths || 0) / 14) * tW;
    doc.setFillColor(...BRAND);
    doc.roundedRect(tX, tY, Math.max(fillW, 4), 8, 4, 4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);
    ['0', '5', '10', '14'].forEach((t, i) => {
      doc.text(t, tX + (i * tW) / 3, tY + 22);
    });
    y = dTop + 78 + 16;
  }

  /* ---------- 4 · mini stats ---------- */

  {
    pageBreak(56);
    const m4W = (PAGE_W - M * 2 - 3 * 12) / 4;
    const m4: Array<[string, string]> = [
      ['Base cost', money(d.baseCost)],
      ['Add-ons', money(d.extrasCost)],
      ['EMI @ 7.1% · 20 yr', `${money(d.emiMonthly)} /mo`],
      ['Monthly outflow', `${money(d.monthlyOutflow)} /mo`],
    ];
    m4.forEach(([lbl, val], i) => {
      const x = M + i * (m4W + 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(val, x, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(...GREY);
      doc.text(lbl.toUpperCase(), x, y + 13);
    });
    y += 32;
  }

  /* ---------- 5 · cost distribution (donut + phases) ---------- */

  heading('Cost Distribution', 'Phase-wise Breakup of Base Cost');

  {
    const rowsN = d.phases.length;
    const blockH = rowsN * 19 + 12;
    pageBreak(blockH + 12);
    y = y; // stay after pagebreak

    const donutOut = 56;
    const donutIn = 37;
    const dcx = M + 72;
    const dcy = y + rowsN * 19 * 0.6;

    let acc = 0;
    for (const ph of d.phases) {
      const start = -Math.PI / 2 + (acc / 100) * Math.PI * 2;
      acc += ph.pct;
      const end = -Math.PI / 2 + (acc / 100) * Math.PI * 2;
      drawDonutSlice(dcx, dcy, donutIn, donutOut, start, end, parseHex(ph.color));
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text('GRAND TOTAL', dcx, dcy - 7, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(money(d.grandTotal), dcx, dcy + 7, { align: 'center' });

    const colL = M + 148;
    const colMid = PAGE_W - M - 92;
    const colEnd = PAGE_W - M;
    let rowTop = y;

    for (const ph of d.phases) {
      doc.setFillColor(...parseHex(ph.color));
      doc.rect(colL, rowTop - 7, 4, 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(ph.label, colL + 11, rowTop);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text(`${ph.pct}%`, colMid, rowTop, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(money(ph.amount), colEnd, rowTop, { align: 'right' });
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.line(colL, rowTop + 7, colEnd, rowTop + 7);
      rowTop += 19;
    }

    y = rowTop + 8;
  }

  /* ---------- 6 · package comparison ---------- */

  heading('Package Comparison', 'All Options at a Glance');

  const colRate = PAGE_W - M - 92;
  const colTotal = PAGE_W - M;

  {
    pageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text('PACKAGE', M, y);
    doc.text('RATE / SQFT', colRate, y, { align: 'right' });
    doc.text('EST. TOTAL', colTotal, y, { align: 'right' });
    y += 12;
  }

  for (const p of d.packages) {
    pageBreak(24);
    const rowTop = y;
    if (p.selected) {
      doc.setFillColor(...TINT);
      doc.rect(M, rowTop, PAGE_W - M * 2, 19, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text(p.tier, M + 4, rowTop + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(p.name + (p.selected ? '  (your pick)' : ''), M + 4, rowTop + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GREY);
    doc.text(`Rs. ${p.rate.toLocaleString('en-IN')}`, colRate, rowTop + 11, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(money(p.total), colTotal, rowTop + 11, { align: 'right' });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(M, rowTop + 19, PAGE_W - M, rowTop + 19);
    y = rowTop + 23;
  }

  /* ---------- 7 · complete estimate sheet ---------- */

  heading('Complete Estimate Sheet', 'Line-by-line Construction Cost');

  const colSectMid = PAGE_W - M - 92;
  const colSectEnd = PAGE_W - M;

  {
    pageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text('PHASE / ITEM', M, y);
    doc.text('% SHARE', colSectMid, y, { align: 'right' });
    doc.text('AMOUNT', colSectEnd, y, { align: 'right' });
    y += 12;
  }

  for (const ph of d.phases) {
    pageBreak(18);
    doc.setFillColor(...parseHex(ph.color));
    doc.rect(M, y - 7, 4, 4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(ph.label, M + 12, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    doc.text(`${ph.pct}%`, colSectMid, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(money(ph.amount), colSectEnd, y, { align: 'right' });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(M, y + 6, PAGE_W - M, y + 6);
    y += 17;
  }

  if (d.extras.length > 0) {
    y += 2;
    pageBreak(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND);
    doc.text('ADD-ON ITEMS', M, y);
    y += 10;
    for (const ex of d.extras) {
      pageBreak(17);
      doc.setFillColor(...BRAND);
      doc.rect(M, y - 7, 4, 4, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(ex.label, M + 12, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...GREY);
      doc.text('—', colSectMid, y, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...INK);
      doc.text(money(ex.amount), colSectEnd, y, { align: 'right' });
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.line(M, y + 6, PAGE_W - M, y + 6);
      y += 17;
    }
  }

  y += 4;
  pageBreak(26);
  doc.setFillColor(...TINT);
  doc.rect(M, y - 13, PAGE_W - M * 2, 16, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND);
  doc.text('Grand total', M + 12, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text('100%', colSectMid, y, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(money(d.grandTotal), colSectEnd, y, { align: 'right' });
  y += 22;

  /* ---------- 8 · disclaimer + sign-off ---------- */

  y += 8;
  pageBreak(72);
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(1);
  doc.line(M, y, M, y + 44);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  const disc = doc.splitTextToSize(d.disclaimer, PAGE_W - M - 16);
  doc.text(disc, M + 12, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(190, 180, 170);
  doc.text('Generated with the free estimator at ganeshhomes.in', M + 12, y + 40);

  footer();

  return doc;
}