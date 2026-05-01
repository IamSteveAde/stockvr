import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { Response } from 'express';

// --- Types ---
export interface InvoiceData {
  invoiceId: string;
  dateIssued: string;
  paymentStatus: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  nextBillingDate: string;
  restaurantName: string;
  contactPerson: string;
  email: string;
  description: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  amountPaid: string;
  year: string;
}

// --- Load HTML template once at startup ---
const TEMPLATE_PATH = path.join(__dirname, '../../../templates', 'invoice.html');
const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

// --- Replace all placeholders ---
function buildHtml(data: InvoiceData): string {
  const statusClassMap: Record<string, string> = {
    Paid: 'paid',
    Pending: 'pending',
    Unpaid: 'unpaid',
  };

  return templateHtml
    .replace(/{{InvoiceId}}/g, data.invoiceId)
    .replace(/{{DateIssued}}/g, data.dateIssued)
    .replace(/{{PaymentStatus}}/g, data.paymentStatus)
    .replace(/{{PaymentStatusClass}}/g, statusClassMap[data.paymentStatus] ?? 'pending')
    .replace(/{{BillingPeriodStart}}/g, data.billingPeriodStart)
    .replace(/{{BillingPeriodEnd}}/g, data.billingPeriodEnd)
    .replace(/{{NextBillingDate}}/g, data.nextBillingDate)
    .replace(/{{RestaurantName}}/g, data.restaurantName)
    .replace(/{{ContactPerson}}/g, data.contactPerson)
    .replace(/{{Email}}/g, data.email)
    .replace(/{{Description}}/g, data.description)
    .replace(/{{Amount}}/g, data.amount)
    .replace(/{{PaymentDate}}/g, data.paymentDate)
    .replace(/{{PaymentMethod}}/g, data.paymentMethod)
    .replace(/{{Reference}}/g, data.reference)
    .replace(/{{AmountPaid}}/g, data.amountPaid)
    .replace(/{{Year}}/g, data.year);
}

// --- Generate PDF buffer ---
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // required on Linux/VPS
  });

  try {
    const page = await browser.newPage();
    const html = buildHtml(data);

    await page.setContent(html, { waitUntil: 'networkidle0' }); // waits for fonts to load

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true, // important — renders background colors
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close(); // always close even if error
  }
}

// --- Express route handler ---
