/**
 * Environment access. Values are read lazily so that a missing variable fails
 * on the request that needs it, rather than breaking the whole build.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

/** Base URL used to build links inside outgoing emails. */
export function appUrl(): string {
  return optionalEnv("APP_URL", "http://localhost:3000").replace(/\/+$/, "");
}
