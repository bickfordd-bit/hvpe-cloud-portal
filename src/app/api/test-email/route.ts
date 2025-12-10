import { sendTemplateEmail } from "@/lib/emailSender";

const TEST_PARAMS = {
  to: "bickfordd@gmail.com",
  name: "Derek",
  overviewLink: "https://bickfordtechnologies.com/hvpe",
  calendlyLink: "https://calendly.com",
};

export async function GET() {
  const result = await sendTemplateEmail("INVESTOR_WELCOME", TEST_PARAMS);

  return Response.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error ? "Email send failed" : undefined,
  });
}
