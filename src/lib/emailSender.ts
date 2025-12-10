import nodemailer from "nodemailer";
import { renderEmailTemplate, TemplateId, TemplateParams } from "./emailTemplates";

type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: unknown;
};

export async function sendTemplateEmail(
  templateId: TemplateId,
  params: TemplateParams,
): Promise<EmailResult> {
  const payload = renderEmailTemplate(templateId, params);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: params.to,
    subject: payload.subject,
    html: payload.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[HVPE][Email] Sent:", templateId, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[HVPE][Email][Error]", error);
    return { success: false, error };
  }
}
