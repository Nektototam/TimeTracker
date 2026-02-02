import "dotenv/config";
import { buildServer } from "./server";

const port = Number(process.env.PORT || 4000);

const start = async () => {
  const app = await buildServer();
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API listening on :${port}`);
};

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
