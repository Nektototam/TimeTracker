import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      sub: string;
      email: string;
    };
  }
}

async function authPluginImpl(app: FastifyInstance) {
  app.log.info("Auth plugin registered");

  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      app.log.error({ error, message: (error as Error).message }, "JWT verification failed");
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });
}

export const authPlugin = fp(authPluginImpl, {
  name: "auth-plugin",
  dependencies: ["@fastify/jwt"]
});
