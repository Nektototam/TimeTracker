import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = registerSchema;

const refreshCookieName = "refreshToken";
const accessTokenTtl = "15m";
const refreshTokenDays = 30;

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: refreshTokenDays * 24 * 60 * 60
  };
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const { email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: { email, passwordHash }
      });

      const accessToken = app.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: accessTokenTtl });
      const refreshToken = randomUUID();
      const expiresAt = new Date(Date.now() + refreshTokenDays * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent: request.headers["user-agent"],
          ipAddress: request.ip,
          expiresAt
        }
      });

      reply.setCookie(refreshCookieName, refreshToken, buildCookieOptions());
      return reply.code(201).send({ accessToken, user: { id: user.id, email: user.email } });
    } catch (error: any) {
      if (error?.code === "P2002") {
        return reply.code(409).send({ error: "Email already exists" });
      }
      request.log.error(error);
      return reply.code(500).send({ error: "Registration failed" });
    }
  });

  app.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload" });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const accessToken = app.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: accessTokenTtl });
    const refreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + refreshTokenDays * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: request.headers["user-agent"],
        ipAddress: request.ip,
        expiresAt
      }
    });

    reply.setCookie(refreshCookieName, refreshToken, buildCookieOptions());
    return reply.send({ accessToken, user: { id: user.id, email: user.email } });
  });

  app.post("/logout", async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies[refreshCookieName];
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { refreshToken } });
    }

    reply.clearCookie(refreshCookieName, { path: "/" });
    return reply.send({ ok: true });
  });

  app.post("/refresh", async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies[refreshCookieName];
    if (!refreshToken) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const session = await prisma.session.findUnique({ where: { refreshToken } });
    if (!session || session.expiresAt < new Date()) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const newRefreshToken = randomUUID();
    const expiresAt = new Date(Date.now() + refreshTokenDays * 24 * 60 * 60 * 1000);

    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt }
    });

    reply.setCookie(refreshCookieName, newRefreshToken, buildCookieOptions());
    const accessToken = app.jwt.sign({ sub: user.id, email: user.email }, { expiresIn: accessTokenTtl });
    return reply.send({ accessToken });
  });

  app.get("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as { sub: string; email: string } | undefined;
      
      request.log.info({ 
        payload,
        hasPayload: !!payload,
        payloadKeys: payload ? Object.keys(payload) : []
      }, "JWT verified in /auth/me");
      
      if (!payload?.sub) {
        request.log.warn("No userId in JWT payload");
        return { user: null };
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true }
      });

      return { user };
    } catch (error) {
      request.log.error(error, "JWT verification failed in /auth/me");
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });
}
