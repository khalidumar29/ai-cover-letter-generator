import { requireEnv } from "@/lib/env";

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

const REQUEST_TIMEOUT_MS = 60_000;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompletionOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
};

export class AiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AiError";
  }
}

export async function complete({
  messages,
  temperature = 0.7,
  maxTokens = 1600,
  json = false,
}: CompletionOptions): Promise<string> {
  const apiKey = requireEnv("DEEPSEEK_API_KEY");

  let response: Response;
  try {
    response = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (cause) {
    const timedOut = (cause as Error).name === "TimeoutError";
    throw new AiError(
      timedOut
        ? "The AI service took too long to respond."
        : `Could not reach the AI service: ${(cause as Error).message}`,
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[deepseek] ${response.status} ${response.statusText} ${detail}`);
    throw new AiError(
      response.status === 429
        ? "The AI service is busy. Please try again in a moment."
        : `The AI service returned an error (${response.status}).`,
      response.status,
    );
  }

  const payload = (await response.json().catch(() => null)) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
  } | null;

  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AiError("The AI service returned an empty response.");

  return content;
}
