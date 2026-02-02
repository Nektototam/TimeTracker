import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
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

export async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      app.log.error(error, "JWT verification failed");
      reply.code(401).send({ error: "Unauthorized" });
    }
  });
}
