import { prisma } from "../../../../helpers/db/client";
import { getProductsDao, getProductsRecords, TListProductDTO } from "../../../stock/products/list/util";
import PDFDocument from 'pdfkit-table';
import { Response } from 'express';
import fs from "fs";
import path from "path";

export async function getAllProducts(businessUid: string) {

  // const businessUid = ""
  let page = 1
  let limit = 50
  let toRun = true
  const allProducts = []

  while (toRun) {
    const batchProducts = await getProductsRecords({ businessUid, limit, page })

    const d = getProductsDao(batchProducts)

    if (d.meta.isLastPage) {
      toRun = false
    }

    if (d.products.length > 0) {
      allProducts.push(...d.products)
    }

    page += 1
  }

  return allProducts


}


// export function jsonToPdf(data: Record<string, any>, res: Response) {
//   const doc = new PDFDocument({ margin: 50 });

//   // Set headers so browser triggers download
//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'attachment; filename="stockvarDownload.pdf"');

//   // Pipe PDF directly into the response
//   doc.pipe(res);

//   // Title
//   doc.fontSize(20).font('Helvetica-Bold').text('Data Export', { align: 'center' });
//   doc.moveDown();

//   // Render each key-value pair
//   renderObject(doc, data, 0);

//   doc.end();
// }

export function jsonToPdf(filename: string, title: string, table_data: any[], columns: string[], res: Response) {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

  // const filepath = path.resolve(`./pdfs/${filename}.pdf`)

  // console.log(filepath)
  doc.pipe(res);

  const table = {
    title,
    // subtitle: "Subtitle",
    // headers: ["msisdn", "destination", "duration", "date"],
    headers: columns,
    rows: table_data,
  };
  // options
  const options = {}

  doc.table(table, options);
  doc.end();

  // doc.on("end", ()=>{

  // })
}



// function renderObject(doc: PDFKit.PDFDocument, obj: any, depth: number) {
//   const indent = depth * 20;

//   for (const [key, value] of Object.entries(obj)) {
//     if (value === null || value === undefined) {
//       doc.fontSize(11)
//         .font('Helvetica-Bold').text(`${key}: `, { indent, continued: true })
//         .font('Helvetica').text('null');
//     } else if (Array.isArray(value)) {
//       doc.fontSize(11).font('Helvetica-Bold').text(`${key}:`, { indent });
//       value.forEach((item, i) => {
//         if (typeof item === 'object') {
//           doc.fontSize(10).font('Helvetica').text(`[${i}]`, { indent: indent + 20 });
//           renderObject(doc, item, depth + 2);
//         } else {
//           doc.fontSize(10).font('Helvetica').text(`[${i}]: ${item}`, { indent: indent + 20 });
//         }
//       });
//     } else if (typeof value === 'object') {
//       doc.fontSize(11).font('Helvetica-Bold').text(`${key}:`, { indent });
//       renderObject(doc, value, depth + 1);
//     } else {
//       doc.fontSize(11)
//         .font('Helvetica-Bold').text(`${key}: `, { indent, continued: true })
//         .font('Helvetica').text(String(value));
//     }

//     doc.moveDown(0.3);
//   }
// }