// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//   adapter: process.env.DATABASE_URL,
// });

// export default prisma;

// import "dotenv/config";

// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "./generated/prisma/client";

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// const prisma = new PrismaClient({ adapter });

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
