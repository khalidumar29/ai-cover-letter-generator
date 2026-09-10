import "dotenv/config";

import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 reads connection details from here rather than from schema.prisma.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
