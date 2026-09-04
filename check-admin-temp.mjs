import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "./src/generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

let url = (process.env.DATABASE_URL || "mysql://root:123456@127.0.0.1:3306/makhana_gold").trim();
if (!url.includes("allowPublicKeyRetrieval")) {
  url += (url.includes("?") ? "&" : "?") + "allowPublicKeyRetrieval=true";
}
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

const role = await prisma.adminRole.findFirst();
const hash = await bcrypt.hash("QaTest@12345", 10);
const qaAdmin = await prisma.adminUser.upsert({
  where: { email: "qa-test-admin@local.test" },
  update: { passwordHash: hash, isActive: true },
  create: { email: "qa-test-admin@local.test", passwordHash: hash, name: "QA Test Admin", roleId: role.id },
});
console.log("QA admin ready:", qaAdmin.id, qaAdmin.email);
await prisma.$disconnect();
