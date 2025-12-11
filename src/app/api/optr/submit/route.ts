import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

type SubmissionInput = {
  id?: string;
  title?: string;
  agency?: string;
  responseDate?: string;
  status?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as SubmissionInput;
  const id = body.id ?? "unknown";
  const title = body.title ?? "OPTR Opportunity";
  const agency = body.agency ?? "Unknown Agency";
  const responseDate = body.responseDate ?? "TBD";
  const status = body.status ?? "Evaluation";

  const pdfBuffer = await buildPdf({
    id,
    title,
    agency,
    responseDate,
    status
  });

  const base64 = pdfBuffer.toString("base64");
  const pdfUrl = `data:application/pdf;base64,${base64}`;

  return NextResponse.json({
    ok: true,
    id,
    pdfUrl,
    fileName: `optr-submission-${id}.pdf`
  });
}

async function buildPdf(data: {
  id: string;
  title: string;
  agency: string;
  responseDate: string;
  status: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    doc.fontSize(18).text("OPTR Submission Packet", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Opportunity ID: ${data.id}`);
    doc.text(`Title: ${data.title}`);
    doc.text(`Agency: ${data.agency}`);
    doc.text(`Response Date: ${data.responseDate}`);
    doc.text(`Status: ${data.status}`);
    doc.moveDown();
    doc.text("This PDF was generated automatically by OPTR.", {
      align: "left"
    });
    doc.text("Replace this with real submission content when ready.", {
      align: "left"
    });

    doc.end();
  });
}
