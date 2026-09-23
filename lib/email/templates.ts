import { appUrl } from "@/lib/env";

const BRAND = "AI Cover Letter Generator";

const ACCENT = "#6D5DFB";
const TEXT = "#18181B";
const TEXT_SECONDARY = "#52525B";
const TEXT_MUTED = "#71717A";
const BORDER = "#E4E4E7";
const BACKGROUND = "#FAFAFA";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type LayoutInput = {
  heading: string;
  intro: string;
  buttonLabel: string;
  buttonUrl: string;
  footnote: string;
};

function layout({ heading, intro, buttonLabel, buttonUrl, footnote }: LayoutInput): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${BACKGROUND};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;color:${TEXT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BACKGROUND};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid ${BORDER};border-radius:12px;">
            <tr>
              <td style="padding:28px 32px 0;">
                <p style="margin:0;font-size:14px;font-weight:600;color:${TEXT};">${BRAND}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0;">
                <h1 style="margin:0;font-size:22px;line-height:28px;font-weight:700;color:${TEXT};">${heading}</h1>
                <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:${TEXT_SECONDARY};">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;">
                <a href="${buttonUrl}" style="display:inline-block;background:${ACCENT};color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:11px 20px;border-radius:8px;">${buttonLabel}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;">
                <p style="margin:0;font-size:13px;line-height:20px;color:${TEXT_MUTED};">If the button does not work, copy this link into your browser:</p>
                <p style="margin:6px 0 0;font-size:13px;line-height:20px;word-break:break-all;"><a href="${buttonUrl}" style="color:${ACCENT};">${buttonUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 28px;">
                <p style="margin:0;padding-top:20px;border-top:1px solid ${BORDER};font-size:13px;line-height:20px;color:${TEXT_MUTED};">${footnote}</p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-size:12px;color:${TEXT_MUTED};">${BRAND}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export type EmailContent = { subject: string; html: string; text: string };

export function verificationEmail(name: string, rawToken: string): EmailContent {
  const url = `${appUrl()}/verify-email?token=${encodeURIComponent(rawToken)}`;
  const safeName = escapeHtml(name);

  return {
    subject: "Confirm your email address",
    html: layout({
      heading: "Confirm your email address",
      intro: `Hi ${safeName}, thanks for creating an account. Confirm your address to activate your two free credits and start generating cover letters.`,
      buttonLabel: "Confirm email address",
      buttonUrl: url,
      footnote:
        "This link expires in 24 hours. If you did not create this account, you can ignore this email.",
    }),
    text: [
      `Hi ${name},`,
      "",
      "Confirm your email address to activate your account:",
      url,
      "",
      "This link expires in 24 hours.",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
  };
}

export function passwordResetEmail(name: string, rawToken: string): EmailContent {
  const url = `${appUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const safeName = escapeHtml(name);

  return {
    subject: "Reset your password",
    html: layout({
      heading: "Reset your password",
      intro: `Hi ${safeName}, we received a request to reset the password for your account. Choose a new password using the button below.`,
      buttonLabel: "Reset password",
      buttonUrl: url,
      footnote:
        "This link expires in 1 hour and can only be used once. If you did not request a reset, your password is unchanged and no action is needed.",
    }),
    text: [
      `Hi ${name},`,
      "",
      "Use this link to choose a new password:",
      url,
      "",
      "This link expires in 1 hour and can only be used once.",
      "If you did not request a reset, your password is unchanged.",
    ].join("\n"),
  };
}

export function passwordChangedEmail(name: string): EmailContent {
  const url = `${appUrl()}/forgot-password`;
  const safeName = escapeHtml(name);

  return {
    subject: "Your password was changed",
    html: layout({
      heading: "Your password was changed",
      intro: `Hi ${safeName}, the password for your account was just changed. You have been signed out on every device and will need to log in again.`,
      buttonLabel: "Secure your account",
      buttonUrl: url,
      footnote:
        "If you made this change, no action is needed. If you did not, reset your password immediately using the button above.",
    }),
    text: [
      `Hi ${name},`,
      "",
      "The password for your account was just changed, and you have been signed out on every device.",
      "",
      "If you did not make this change, reset your password immediately:",
      url,
    ].join("\n"),
  };
}
