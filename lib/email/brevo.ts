import { optionalEnv } from "@/lib/env";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export type SendEmailInput = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
};

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

/**
 * Sends one transactional email through Brevo's REST API.
 *
 * Called directly rather than through the Brevo SDK: this is a single JSON
 * POST, and plain fetch keeps the dependency surface small and works in every
 * Next.js runtime.
 *
 * Without BREVO_API_KEY the message is printed to the server console instead,
 * so local development and tests never depend on a live account.
 */
export async function sendEmail({
  to,
  toName,
  subject,
  html,
  text,
}: SendEmailInput): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new EmailDeliveryError("BREVO_API_KEY is not configured.");
    }
    console.warn(
      `\n[brevo:dev] BREVO_API_KEY is not set — email not sent.\n  to: ${to}\n  subject: ${subject}\n\n${text}\n`,
    );
    return;
  }

  let response: Response;
  try {
    response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: optionalEnv("BREVO_SENDER_EMAIL", "no-reply@example.com"),
          name: optionalEnv("BREVO_SENDER_NAME", "AI Cover Letter Generator"),
        },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      cache: "no-store",
    });
  } catch (cause) {
    throw new EmailDeliveryError(`Could not reach Brevo: ${(cause as Error).message}`);
  }

  if (!response.ok) {
    // Brevo returns { code, message }; keep it in the server log only, since it
    // can echo the recipient address back.
    const detail = await response.text().catch(() => "");
    console.error(`[brevo] ${response.status} ${response.statusText} ${detail}`);
    throw new EmailDeliveryError(
      `Brevo rejected the message (${response.status}).`,
      response.status,
    );
  }
}
