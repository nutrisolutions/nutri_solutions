import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BRAND_PURPLE = "#7045c3";
const TEXT_DARK = "#0f172a";
const TEXT_MUTED = "#475569";

const COMPANY_NAME = "NUTRI SOLUTIONS PRIVATE LIMITED";
const COMPANY_ADDRESS_LINES = ["Hyderabad, Telangana, India", "Email: hr@nutrisolutions.com · www.nutrisolutions.co.in"];

const PAGE_MARGIN = 50;
const LOGO_HEIGHT = 40;

let logoBufferPromise = null;
const loadLogoBuffer = () => {
  if (!logoBufferPromise) {
    const svgPath = path.join(__dirname, "../../assets/logo.svg");
    logoBufferPromise = sharp(fs.readFileSync(svgPath), { density: 300 })
      .png()
      .toBuffer()
      .catch(() => null);
  }
  return logoBufferPromise;
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

const formatMoney = (value) => `Rs ${Math.round(value).toLocaleString("en-IN")}/-`;

const parseCtcToNumber = (ctc) => {
  const digits = String(ctc || "").replace(/[^0-9.]/g, "");
  const num = parseFloat(digits);
  return Number.isFinite(num) ? num : 0;
};

/** Splits an annual CTC into a standard component breakup, mirroring common Indian payroll structures. */
const computeSalaryBreakup = (ctcNumber) => {
  const basic = ctcNumber * 0.5;
  const da = ctcNumber * 0.15667;
  const hra = ctcNumber * 0.2;
  const conveyance = ctcNumber * 0.035556;
  const medical = ctcNumber * 0.027778;
  const special = ctcNumber - (basic + da + hra + conveyance + medical);
  const grossAnnual = ctcNumber;
  const ptAnnual = 2400;
  const pfAnnual = basic * 0.12;
  const totalDeductionsAnnual = ptAnnual + pfAnnual;
  const netAnnual = grossAnnual - totalDeductionsAnnual;

  const rows = [
    ["Basic", basic],
    ["Dearness Allowance", da],
    ["House Rent Allowance", hra],
    ["Conveyance", conveyance],
    ["Medical Expenses", medical],
    ["Special Allowance", special]
  ];

  return { rows, grossAnnual, ptAnnual, pfAnnual, totalDeductionsAnnual, netAnnual };
};

// Fixed-position drawing only (logo + company name) — safe to call post-hoc on a
// finalized page via switchToPage, same as drawFooter. Never called mid text-flow,
// which avoids clobbering pdfkit's internal cursor during automatic pagination.
const drawHeader = (doc, logoBuffer) => {
  if (logoBuffer) {
    try {
      const logoWidth = (LOGO_HEIGHT * 181) / 299;
      doc.image(logoBuffer, doc.page.width - PAGE_MARGIN - logoWidth, 30, { height: LOGO_HEIGHT });
    } catch {
      // ignore image placement failures, letter still generates without the mark
    }
  }
  doc.font("Helvetica-Bold").fontSize(9).fillColor(BRAND_PURPLE).text(COMPANY_NAME, PAGE_MARGIN, 36);
};

const drawFooter = (doc) => {
  const pageWidth = doc.page.width;
  // pdfkit auto-paginates ANY explicitly-positioned text past page.height - margins.bottom,
  // even with an explicit y — so the footer (which necessarily lives in that reserved
  // zone) must be drawn with the bottom margin temporarily zeroed, then restored.
  const originalBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  const footerY = doc.page.height - 56;

  doc
    .moveTo(PAGE_MARGIN, footerY)
    .lineTo(pageWidth - PAGE_MARGIN, footerY)
    .strokeColor(BRAND_PURPLE)
    .opacity(0.3)
    .lineWidth(1)
    .stroke()
    .opacity(1);

  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(COMPANY_NAME, PAGE_MARGIN, footerY + 8, { align: "center", width: pageWidth - 100, lineBreak: false });
  doc
    .fillColor(TEXT_MUTED)
    .font("Helvetica")
    .fontSize(8)
    .text(COMPANY_ADDRESS_LINES.join(" · "), PAGE_MARGIN, footerY + 19, {
      align: "center",
      width: pageWidth - 100,
      lineBreak: false
    });

  doc.page.margins.bottom = originalBottom;
};

/**
 * Creates a document with a reserved top margin (90pt) for the header on every page —
 * including pages pdfkit inserts automatically when flowing text overflows — so
 * content can paginate naturally instead of every section being forced onto its own
 * mostly-empty page. Header/footer are drawn post-hoc in finalizeDocument, once the
 * page count is known, rather than live during text flow.
 */
const newDocument = async () => {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 90, bottom: 65, left: PAGE_MARGIN, right: PAGE_MARGIN },
    bufferPages: true
  });
  const logoBuffer = await loadLogoBuffer();
  return { doc, logoBuffer };
};

const heading = (doc, text) => {
  doc.moveDown(0.7);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(TEXT_DARK).text(text, { underline: true });
  doc.moveDown(0.2);
};

const paragraph = (doc, text, opts = {}) => {
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_DARK).text(text, { align: "justify", ...opts });
};

/** A procedurally-drawn signature flourish (no external font/image needed) to give generated letters a "signed" look. */
const drawSignatureFlourish = (doc, x, y) => {
  doc.save();
  doc.strokeColor(BRAND_PURPLE).lineWidth(1.4).opacity(0.85);
  doc
    .moveTo(x, y + 14)
    .bezierCurveTo(x + 14, y - 6, x + 22, y + 22, x + 36, y + 8)
    .bezierCurveTo(x + 46, y - 4, x + 54, y + 18, x + 68, y + 6)
    .bezierCurveTo(x + 78, y - 2, x + 86, y + 12, x + 100, y + 4)
    .stroke();
  doc.restore();
};

const finalizeDocument = (doc, logoBuffer) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(i);
      drawHeader(doc, logoBuffer);
      drawFooter(doc);
    }

    doc.end();
  });

export const generateOfferLetterBuffer = async (details) => {
  const { doc, logoBuffer } = await newDocument();
  const ctcNumber = parseCtcToNumber(details.ctc);
  const breakup = computeSalaryBreakup(ctcNumber);

  // --- Offer summary ---
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_MUTED).text(formatDate(details.offerDate), { align: "right" });
  if (details.employeeCode) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(TEXT_MUTED).text(`Ref: ${details.employeeCode}`);
  }
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(TEXT_DARK).text(`Mr./Ms. ${details.fullName}`);
  doc.moveDown(0.8);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(BRAND_PURPLE)
    .text("CONFIDENTIAL – OFFER OF EMPLOYMENT", { align: "center", underline: true });
  doc.moveDown(0.8);

  paragraph(doc, `Dear ${details.fullName},`);
  doc.moveDown(0.4);
  paragraph(doc, `Welcome to ${COMPANY_NAME}. Congratulations! We welcome you on board.`);
  doc.moveDown(0.4);
  paragraph(
    doc,
    `With reference to your application and subsequent interview, we are pleased to offer you a position with ` +
      `${COMPANY_NAME} as ${details.position || "—"}` +
      (details.department ? ` in the ${details.department} department` : "") +
      `. You are required to report for duty on ${formatDate(details.joiningDate)} at the address: ${details.workLocation || "—"}.`
  );
  doc.moveDown(0.4);
  paragraph(
    doc,
    `Your post carries an initial remuneration of ${formatMoney(ctcNumber)} (${ctcNumber ? "Rupees as detailed in the annexure" : "—"}) per annum. Please refer to Annexure II for details on the compensation structure.`
  );

  heading(doc, "Acceptance Terms:");
  paragraph(
    doc,
    `Your appointment will be effective on your joining date, i.e. ${formatDate(details.joiningDate)}. Please contact us immediately if you require an alternative joining date. If you do not confirm your acceptance or we are unable to agree an alternative date, this offer will be withdrawn. ` +
      `Please review the employment terms and conditions noted in this letter and its annexures, then confirm your acceptance through the employee portal.`
  );
  doc.moveDown(0.6);
  paragraph(doc, `We look forward to welcoming you to ${COMPANY_NAME}.`, { align: "left" });

  // --- Terms (flows naturally onto further pages as needed, no forced breaks) ---
  heading(doc, "Date of Joining:");
  paragraph(
    doc,
    `If you accept this offer, you must join duty and commence your role not later than ${formatDate(details.joiningDate)}. In case you do not report on the agreed date, ${COMPANY_NAME} may treat this offer as declined.`
  );
  heading(doc, "Office Hours:");
  paragraph(
    doc,
    `Our usual office hours are of 9 hours' duration every day, Monday to Friday, with one hour normally allowed for lunch. Office hours may change in the future to support work requirements across different time zones.`
  );
  heading(doc, "Training:");
  paragraph(
    doc,
    `You will hold yourself in readiness for any training whenever required, at the company's expense. Refusal to participate in a training program without valid reason may lead to termination of employment.`
  );
  heading(doc, "Secrecy / Confidentiality:");
  paragraph(
    doc,
    `You will not, during or after your employment with the company, divulge or disclose to any person, or make use of for any purpose other than the company's business, any information or knowledge obtained during your employment relating to the business or affairs of the company, and will use your best endeavours to prevent any other person from doing so.`
  );
  heading(doc, "This offer letter and your employment with the company are subject to:");
  paragraph(doc, `• Satisfactory results of a complete background and reference check carried out by the company.`);
  paragraph(
    doc,
    `• You are required to sign the Employment Agreement, Non-Disclosure & Non-Compete Agreement, and the annexures attached herewith. Non-compliance may result in termination without notice period or compensation.`
  );

  heading(doc, "Assignments / Transfer / Deputation:");
  paragraph(
    doc,
    `You will initially be based at ${details.workLocation || "the assigned location"}. However, ${COMPANY_NAME}, at its discretion, may transfer you to any of its subsidiary, affiliate, or client offices in India or overseas, in which case your employment may be governed by the terms applicable at the new location.`
  );
  heading(doc, "Verification of Particulars:");
  paragraph(
    doc,
    `You acknowledge that the company has offered you employment based on the specific information and records furnished by you. If any particulars are found false or incorrect on verification, the company may, at its absolute discretion, terminate or suspend your services without notice.`
  );
  heading(doc, "Termination of Employment:");
  paragraph(
    doc,
    `A) During the probation period mentioned in this offer, your performance will be closely monitored; the company reserves the right to terminate your services without prior notice if performance is not satisfactory.`
  );
  paragraph(
    doc,
    `B) Unauthorized or unapproved absence from duty for a continuous period of 7 working days will result in loss of lien on employment, and your employment shall automatically end without notice or notice pay.`
  );
  paragraph(
    doc,
    `C) You will be governed by the company's code of conduct; any breach may result in termination without notice, and the company reserves the right to pursue other legal remedies to protect its legitimate interests.`
  );
  heading(doc, "Mandatory Period of Service:");
  paragraph(
    doc,
    `In consideration of the training imparted during probation, you shall work at the company for at least a period of 12 months from the date of successful completion of your probation. During probation and this mandatory service period, you shall not leave, abandon, or resign from the company's services.`
  );

  heading(doc, "Leave Policy:");
  paragraph(
    doc,
    `Employees under probation are not entitled to leave. After successful completion of probation, an employee is entitled to one day of casual leave for every completed month, with a maximum of 3 accumulated days at a time. Leave applications must be submitted to hr@nutrisolutions.com at least 3 days prior to the date of leave.`
  );
  heading(doc, "Code of Conduct:");
  paragraph(doc, `A) Your remuneration is strictly confidential between you and the company.`);
  paragraph(doc, `B) You shall maintain proper discipline and dignity of your office at all times.`);
  paragraph(doc, `C) You shall inform the company of any changes in your personal data within three days of occurrence.`);
  paragraph(doc, `D) Your salary will count from your training start date.`);
  paragraph(
    doc,
    `E) At the time of joining, you must submit your education documents, Aadhar Card, and PAN Card; non-submission may lead to cancellation of this offer letter.`
  );
  heading(doc, "Other Conditions:");
  paragraph(doc, `I. The company expects you to work with a high standard of initiative, efficiency, and economy.`);
  paragraph(
    doc,
    `II. You will devote your entire time to the company's work and will not undertake any business or work for any other company, entity, or person.`
  );
  paragraph(
    doc,
    `III. You will be responsible for the safe keeping and return, in good condition, of all company property in your possession, use, custody, or charge, and will compensate for any loss or damage.`
  );

  // --- Annexure I — document checklist (own page) ---
  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(13).fillColor(BRAND_PURPLE).text("Annexure - I", { align: "center" });
  doc.moveDown(0.3);
  paragraph(doc, `You need to furnish the following documents at the time of joining. Joining will not happen without these documents.`);
  doc.moveDown(0.5);

  const checklist = [
    ["A", "Original copy of this offer letter"],
    ["B", "Date of birth proof: Aadhar Card (or Birth Certificate / Xth marksheet / Passport / PAN Card / Driving License)"],
    ["C", "Photo ID: Aadhar or PAN Card (or Voter ID / Driving License / Passport)"],
    ["D", "Permanent address proof (Passport / Driving License / Voter ID / utility bill, latest)"],
    ["E", "Education qualification proof: Xth, XIIth, Graduation, Post-Graduation certificates & mark sheets"],
    ["F", "Passport size photographs: 5 copies (white background)"],
    ["G", "PAN Card photocopy (or application receipt if not yet issued)"],
    ["H", "Relieving or experience letter from previous employer(s) (last 2 employments)"],
    ["I", "Salary slips / salary certificate from previous employer(s); bank statement if unavailable"],
    ["J", "Employee ID proof from previous employer (salary slip / appraisal letter)"],
    ["K", "Marriage certificate (if applicable)"],
    ["L", "Self-declaration medical fitness form, signed and stamped by a doctor"]
  ];

  checklist.forEach(([letter, text]) => {
    const rowY = doc.y;
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(TEXT_DARK).text(letter, PAGE_MARGIN, rowY, { width: 20 });
    doc.font("Helvetica").fontSize(9.5).fillColor(TEXT_DARK).text(text, PAGE_MARGIN + 24, rowY, { width: 470 });
    doc.moveDown(0.5);
  });

  // --- Annexure II — compensation (own page) ---
  doc.addPage();
  doc.font("Helvetica-Bold").fontSize(13).fillColor(BRAND_PURPLE).text("Annexure - II", { align: "center" });
  doc.moveDown(0.6);

  const infoRows = [
    ["Name", details.fullName],
    ["Designation", details.position || "—"],
    ["Location", details.workLocation || "—"]
  ];
  infoRows.forEach(([label, value]) => {
    const rowY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXT_MUTED).text(label, PAGE_MARGIN, rowY, { width: 150 });
    doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK).text(value, PAGE_MARGIN + 160, rowY, { width: 300 });
    doc.moveDown(0.5);
  });

  doc.moveDown(0.5);
  const tableTop = doc.y;
  const colLabel = PAGE_MARGIN;
  const colMonth = 330;
  const colAnnual = 430;

  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(TEXT_MUTED);
  doc.text("Component", colLabel, tableTop);
  doc.text("Per Month", colMonth, tableTop);
  doc.text("Per Annum", colAnnual, tableTop);
  doc.moveDown(0.5);

  doc
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(545, doc.y)
    .strokeColor(TEXT_MUTED)
    .opacity(0.4)
    .lineWidth(0.5)
    .stroke()
    .opacity(1);
  doc.moveDown(0.3);

  const drawSalaryRow = (label, annual, bold = false) => {
    const rowY = doc.y;
    const font = bold ? "Helvetica-Bold" : "Helvetica";
    doc.font(font).fontSize(9.5).fillColor(TEXT_DARK);
    doc.text(label, colLabel, rowY, { width: 260 });
    doc.text(Math.round(annual / 12).toLocaleString("en-IN"), colMonth, rowY, { width: 90 });
    doc.text(Math.round(annual).toLocaleString("en-IN"), colAnnual, rowY, { width: 100 });
    doc.moveDown(0.5);
  };

  breakup.rows.forEach(([label, value]) => drawSalaryRow(label, value));
  drawSalaryRow("Total Gross Salary", breakup.grossAnnual, true);
  drawSalaryRow("Professional Tax", breakup.ptAnnual);
  drawSalaryRow("Provident Fund", breakup.pfAnnual);
  drawSalaryRow("Total Deductions", breakup.totalDeductionsAnnual, true);
  drawSalaryRow("Net Pay", breakup.netAnnual, true);

  doc.moveDown(0.8);
  paragraph(
    doc,
    `Salary will be paid monthly by bank transfer, subject to your regular attendance and submission of PAN details in the company's records.`
  );
  doc.moveDown(1.2);
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK).text("Employee Signature: _______________________");

  // --- Amendments & acceptance (own page, with the company's digital signature) ---
  doc.addPage();
  heading(doc, "Amendments:");
  paragraph(
    doc,
    `The company, at its discretion, may alter, replace, or annul any of the above terms as circumstances warrant. Changes will be communicated through proper channels.`
  );
  doc.moveDown(0.4);
  paragraph(
    doc,
    `If you agree to accept this position, please notify in writing by signing your name and the date of joining at the bottom of this page. A copy of this letter will be provided to you.`
  );
  doc.moveDown(0.4);
  paragraph(
    doc,
    `Irrespective of whether you join ${COMPANY_NAME} or not, you shall keep the details contained in this letter confidential.`
  );
  doc.moveDown(0.6);
  paragraph(doc, `We take this opportunity to welcome you to ${COMPANY_NAME}.`);

  doc.moveDown(1.5);
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_MUTED).text(`For ${COMPANY_NAME}`);
  const companySigY = doc.y + 10;
  drawSignatureFlourish(doc, PAGE_MARGIN, companySigY);
  doc.y = companySigY + 34;
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(TEXT_DARK).text(details.hrName || "HR Team");
  doc.font("Helvetica").fontSize(9).fillColor(TEXT_MUTED).text("Authorized Signatory · Digitally generated and signed");

  doc.moveDown(1.5);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(TEXT_DARK).text("Acceptance");
  doc.moveDown(0.4);
  paragraph(doc, `I, ${details.fullName}, hereby confirm acceptance of all the above terms and conditions and will join.`);
  doc.moveDown(2);
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica").fontSize(10).text("Signature: _______________________        Date: _______________");

  return finalizeDocument(doc, logoBuffer);
};

export const generateJoiningLetterBuffer = async (details) => {
  const { doc, logoBuffer } = await newDocument();

  doc.font("Helvetica-Bold").fontSize(16).fillColor(TEXT_DARK).text("Letter of Appointment", { align: "center" });
  doc.moveDown(1.2);

  const infoRows = [
    ["Date", formatDate(details.offerDate)],
    ["Employee Name", details.fullName],
    ["Employee No.", details.employeeCode || "—"],
    ["Appointed as", details.position || "—"]
  ];
  infoRows.forEach(([label, value]) => {
    doc.x = PAGE_MARGIN;
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(TEXT_DARK).text(`${label}: `, { continued: true });
    doc.font("Helvetica").fillColor(TEXT_DARK).text(value);
  });

  doc.moveDown(0.8);
  paragraph(
    doc,
    `We refer to your recent interview for the above position and are pleased to inform you that we are offering you the position with our company effective from ${formatDate(details.joiningDate)}, under the following terms and conditions.`
  );
  doc.moveDown(0.8);

  const terms = [
    ["Salary", `${details.ctc || "—"} per annum`],
    ["Probation Period", details.probationMonths ? `${details.probationMonths} month(s) from the date of joining` : "As per company policy"],
    ["Working Hours", "9 hours per day, Monday to Friday"],
    ["Leave Policy", "No leave during probation; standard leave policy applies thereafter"],
    ["Notice Period", "One month's notice is required to leave the company"],
    ["Reporting Manager", details.reportingManagerName || "To be assigned"],
    ["Work Location", details.workLocation || "—"]
  ];

  terms.forEach(([label, value]) => {
    doc.x = PAGE_MARGIN;
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(TEXT_MUTED).text(`${label}: `, { continued: true });
    doc.font("Helvetica").fillColor(TEXT_DARK).text(value);
    doc.moveDown(0.2);
  });

  doc.moveDown(0.8);
  paragraph(
    doc,
    `We congratulate you on your appointment and assure you of our full support for your professional growth and development.`
  );

  doc.moveDown(1.2);
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_DARK).text("Sincerely,");
  const hrSigY = doc.y + 10;
  drawSignatureFlourish(doc, PAGE_MARGIN, hrSigY);
  doc.y = hrSigY + 34;
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(TEXT_DARK).text(details.hrName || "HR Team");
  doc.font("Helvetica").fontSize(9).fillColor(TEXT_MUTED).text("HR Manager · Authorized Signatory · Digitally generated and signed");
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_MUTED).text(COMPANY_NAME);

  return finalizeDocument(doc, logoBuffer);
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

export const generatePayslipBuffer = async (details) => {
  const { doc, logoBuffer } = await newDocument();
  const basisAnnual =
    details.mode === "manual" ? (Number(details.manualAmount) || 0) * 12 : parseCtcToNumber(details.ctc);
  const breakup = computeSalaryBreakup(basisAnnual);
  const totalDays = daysInMonth(details.periodYear, details.periodMonth);
  const lopDays = Math.min(Number(details.lopDays) || 0, totalDays);
  const paidDays = totalDays - lopDays;
  const proration = totalDays ? paidDays / totalDays : 1;
  const periodLabel = `${MONTH_NAMES[details.periodMonth - 1]} ${details.periodYear}`;

  doc.font("Helvetica-Bold").fontSize(14).fillColor(BRAND_PURPLE).text("Payslip", { align: "center" });
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_MUTED).text(periodLabel, { align: "center" });
  doc.moveDown(1);

  const infoRows = [
    ["Employee Name", details.fullName],
    ["Employee No.", details.employeeCode || "—"],
    ["Designation", details.position || "—"],
    ["Department", details.department || "—"],
    ["Pay Period", periodLabel],
    ["Paid Days", `${paidDays} / ${totalDays}${lopDays ? ` (LOP: ${lopDays} day(s))` : ""}`]
  ];
  infoRows.forEach(([label, value]) => {
    const rowY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXT_MUTED).text(label, PAGE_MARGIN, rowY, { width: 150 });
    doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK).text(String(value), PAGE_MARGIN + 160, rowY, { width: 300 });
    doc.moveDown(0.5);
  });

  doc.moveDown(0.5);
  const colLabel = PAGE_MARGIN;
  const colAmount = 430;
  const tableTop = doc.y;
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(TEXT_MUTED);
  doc.text("Component", colLabel, tableTop);
  doc.text("Amount", colAmount, tableTop);
  doc.moveDown(0.5);
  doc
    .moveTo(PAGE_MARGIN, doc.y)
    .lineTo(545, doc.y)
    .strokeColor(TEXT_MUTED)
    .opacity(0.4)
    .lineWidth(0.5)
    .stroke()
    .opacity(1);
  doc.moveDown(0.3);

  const drawRow = (label, amount, bold = false) => {
    const rowY = doc.y;
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9.5).fillColor(TEXT_DARK);
    doc.text(label, colLabel, rowY, { width: 260 });
    doc.text(Math.round(amount).toLocaleString("en-IN"), colAmount, rowY, { width: 100 });
    doc.moveDown(0.5);
  };

  let grossMonthly = 0;
  breakup.rows.forEach(([label, annual]) => {
    const monthly = (annual / 12) * proration;
    grossMonthly += monthly;
    drawRow(label, monthly);
  });
  drawRow("Gross Earnings", grossMonthly, true);

  const ptMonthly = breakup.ptAnnual / 12;
  const pfMonthly = (breakup.pfAnnual / 12) * proration;
  const totalDeductions = ptMonthly + pfMonthly;
  drawRow("Professional Tax", ptMonthly);
  drawRow("Provident Fund", pfMonthly);
  drawRow("Total Deductions", totalDeductions, true);
  drawRow("Net Pay", grossMonthly - totalDeductions, true);

  doc.x = PAGE_MARGIN;
  doc.moveDown(1);
  paragraph(
    doc,
    `This is a system-generated payslip and does not require a physical signature. For queries, contact hr@nutrisolutions.com.`
  );

  return finalizeDocument(doc, logoBuffer);
};

export const generateAppraisalLetterBuffer = async (details) => {
  const { doc, logoBuffer } = await newDocument();
  const oldCtcNumber = parseCtcToNumber(details.oldCtc);
  const newCtcNumber = parseCtcToNumber(details.newCtc);
  const incrementPercent = oldCtcNumber ? ((newCtcNumber - oldCtcNumber) / oldCtcNumber) * 100 : 0;

  doc.font("Helvetica").fontSize(10).fillColor(TEXT_MUTED).text(formatDate(details.appraisalDate), { align: "right" });
  doc.moveDown(0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(BRAND_PURPLE)
    .text("LETTER OF APPRAISAL", { align: "center", underline: true });
  doc.moveDown(0.8);

  paragraph(doc, `Dear ${details.fullName},`);
  doc.moveDown(0.4);
  paragraph(
    doc,
    `We are pleased to inform you that, in recognition of your performance and contribution to ${COMPANY_NAME}, your compensation has been revised effective ${formatDate(details.effectiveDate)}.`
  );
  doc.moveDown(0.6);

  const rows = [
    ["Designation", details.position || "—"],
    ["Department", details.department || "—"],
    ["Previous CTC", details.oldCtc ? formatMoney(oldCtcNumber) + " per annum" : "—"],
    ["Revised CTC", details.newCtc ? formatMoney(newCtcNumber) + " per annum" : "—"],
    ["Increment", `${incrementPercent >= 0 ? "+" : ""}${incrementPercent.toFixed(1)}%`],
    ["Effective Date", formatDate(details.effectiveDate)]
  ];
  rows.forEach(([label, value]) => {
    const rowY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(TEXT_MUTED).text(label, PAGE_MARGIN, rowY, { width: 150 });
    doc.font("Helvetica").fontSize(10).fillColor(TEXT_DARK).text(value, PAGE_MARGIN + 160, rowY, { width: 300 });
    doc.moveDown(0.5);
  });

  if (details.remarks) {
    doc.moveDown(0.4);
    heading(doc, "Remarks:");
    paragraph(doc, details.remarks);
  }

  doc.moveDown(0.6);
  paragraph(
    doc,
    `This revision reflects our confidence in your continued contribution to the team. Please refer to Annexure II on file for the detailed compensation breakup, or contact HR for an updated breakup at your revised CTC.`
  );
  doc.moveDown(0.6);
  paragraph(doc, `Congratulations, and we look forward to your continued success at ${COMPANY_NAME}.`);

  doc.moveDown(1.5);
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica").fontSize(10.5).fillColor(TEXT_DARK).text("Sincerely,");
  const sigY = doc.y + 10;
  drawSignatureFlourish(doc, PAGE_MARGIN, sigY);
  doc.y = sigY + 34;
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(TEXT_DARK).text(details.hrName || "HR Team");
  doc.font("Helvetica").fontSize(9).fillColor(TEXT_MUTED).text("HR Manager · Authorized Signatory · Digitally generated and signed");
  doc.font("Helvetica").fontSize(10).fillColor(TEXT_MUTED).text(COMPANY_NAME);

  return finalizeDocument(doc, logoBuffer);
};
