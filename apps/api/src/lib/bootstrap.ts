import bcrypt from "bcrypt";
import { prisma } from "./prisma";

interface LoggerLike {
  info?: (msg: string) => void;
  warn?: (msg: string) => void;
  error?: (msg: string) => void;
}

export async function ensureBootstrapUser(logger?: LoggerLike) {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  if (password.length < 8) {
    logger?.warn?.("BOOTSTRAP_ADMIN_PASSWORD must be at least 8 chars.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    logger?.info?.("Bootstrap user already exists.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash }
  });

  logger?.info?.("Bootstrap user created.");
}
