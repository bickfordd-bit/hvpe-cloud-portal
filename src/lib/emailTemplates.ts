export type TemplateId =
  | "INVESTOR_WELCOME"
  | "LICENSE_ACTIVATION"
  | "PORTAL_LOGIN_LINK"
  | "DAILY_PERFORMANCE"
  | "LIVE_TRADE_ALERT";

export type TemplateParams = {
  to: string;
  name?: string;
  overviewLink?: string;
  calendlyLink?: string;
  loginLink?: string;
  performanceSummary?: string;
  tradeSymbol?: string;
  tradePrice?: number;
  [key: string]: unknown;
};

type TemplateDefinition = {
  subject: (params: TemplateParams) => string;
  body: (params: TemplateParams) => string;
};

const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  INVESTOR_WELCOME: {
    subject: () => "Welcome to HVPE — Bickford Technologies",
    body: (params) => `
      <html>
        <body style="font-family: Inter, system-ui, sans-serif; background:#05070A; color:#F9FAFB; margin:0; padding:24px;">
          <div style="max-width:600px; margin:0 auto; padding:24px; background:#0B0D12; border-radius:18px; border:1px solid #1F1F1F;">
            <h1 style="font-size:20px; margin-bottom:8px;">Welcome, ${params.name ?? "Operator"}.</h1>
            <p style="color:#94A3B8; margin-bottom:16px;">
              HVPE is live and watching every loop. Your intelligence surface is now anchored at:
              <strong style="color:#F8FAFC;">${params.overviewLink ?? "Bickford Technologies"}</strong>
            </p>
            <p style="margin-bottom:16px;">
              When you are ready to meet with the team, lock a slot on the calendar below.
            </p>
            <a href="${params.calendlyLink ?? "#"}" style="display:inline-flex; align-items:center; justify-content:center; padding:12px 18px; background:#2A82FF; color:#fff; border-radius:999px; text-decoration:none; font-weight:600;">
              Schedule a Strategy Session
            </a>
            <p style="margin-top:24px; color:#94A3B8;">HVPE ⟽ High Velocity Profit Engine</p>
          </div>
        </body>
      </html>
    `,
  },
  LICENSE_ACTIVATION: {
    subject: () => "Your HVPE license activation instructions",
    body: (params) => `
      <html>
        <body style="font-family: Inter, system-ui, sans-serif; background:#05070A; color:#F9FAFB; margin:0; padding:24px;">
          <div style="max-width:600px; margin:0 auto; padding:24px; background:#0F1117; border-radius:18px; border:1px solid #1F1F1F;">
            <h1 style="margin-bottom:8px;">License Activation Pending</h1>
            <p style="color:#94A3B8;">
              We received your request to unlock HVPE Apex. Click the button below to finalize the activation.
            </p>
            <a href="${params.loginLink ?? "#"}" style="display:inline-flex; align-items:center; justify-content:center; padding:12px 18px; background:#00FF9D; color:#030712; border-radius:999px; text-decoration:none; font-weight:600; margin-top:12px;">
              Complete Activation
            </a>
            <p style="margin-top:18px; color:#94A3B8;">
              Questions? Reply to this email and our engineers will respond inside 60 minutes.
            </p>
          </div>
        </body>
      </html>
    `,
  },
  PORTAL_LOGIN_LINK: {
    subject: () => "Here is your HVPE Portal login link",
    body: (params) => `
      <html>
        <body style="font-family: Inter, system-ui, sans-serif; background:#05070A; color:#F9FAFB; margin:0; padding:24px;">
          <div style="max-width:600px; margin:0 auto; padding:24px; background:#10131A; border-radius:18px; border:1px solid #1F1F1F;">
            <h1 style="margin-bottom:8px;">Portal Access</h1>
            <p style="color:#94A3B8;">Jump straight into HVPE:</p>
            <a href="${params.loginLink ?? "#"}" style="display:inline-flex; align-items:center; justify-content:center; padding:12px 18px; background:#2AF0FF; color:#020617; border-radius:999px; text-decoration:none; font-weight:600;">
              Access the Portal
            </a>
            <p style="margin-top:16px; color:#94A3B8;">Your current persona: ${params.name ?? "Operator"}.</p>
          </div>
        </body>
      </html>
    `,
  },
  DAILY_PERFORMANCE: {
    subject: () => "HVPE Daily Performance Summary",
    body: (params) => `
      <html>
        <body style="font-family: Inter, system-ui, sans-serif; background:#05070A; color:#F9FAFB; margin:0; padding:24px;">
          <div style="max-width:600px; margin:0 auto; padding:24px; background:#11141C; border-radius:18px; border:1px solid #1F1F1F;">
            <h1 style="margin-bottom:8px;">Daily Performance</h1>
            <p style="color:#94A3B8;">${params.performanceSummary ?? "Your engine produced strong compounding signals today."}</p>
            <p style="margin-top:16px; color:#94A3B8;">Need deeper analysis? Reply and our intelligence team will respond with a packet later.</p>
          </div>
        </body>
      </html>
    `,
  },
  LIVE_TRADE_ALERT: {
    subject: (params) => `Live trade alert · ${params.tradeSymbol ?? "HVPE Asset"} executed`,
    body: (params) => `
      <html>
        <body style="font-family: Inter, system-ui, sans-serif; background:#05070A; color:#F9FAFB; margin:0; padding:24px;">
          <div style="max-width:600px; margin:0 auto; padding:24px; background:#0F1117; border-radius:18px; border:1px solid #1F1F1F;">
            <h1 style="margin-bottom:8px;">Live Trade Alert</h1>
            <p style="color:#94A3B8;">
              HVPE just executed ${params.tradeSymbol ?? "a position"} at ${params.tradePrice ?? "market"}.
            </p>
            <p style="margin-top:16px; color:#94A3B8;">
              Monitor the trade room for updates or open the portal for more context.
            </p>
          </div>
        </body>
      </html>
    `,
  },
};

export function renderEmailTemplate(templateId: TemplateId, params: TemplateParams) {
  const template = TEMPLATE_REGISTRY[templateId];

  if (!template) {
    throw new Error(`Missing render configuration for template "${templateId}"`);
  }

  return {
    subject: template.subject(params),
    html: template.body(params),
  };
}
