require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const db = require("./db");

const API_TOKEN = process.env.API_TOKEN;

function normalizeCnpj(value) {
  return String(value || "").replace(/\D/g, "");
}

function ensureAuth(request, reply, done) {
  if (request.routerPath === "/health") {
    done();
    return;
  }

  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : header;
  const fallbackToken = request.headers["x-api-token"];
  const finalToken = token || fallbackToken;

  if (!API_TOKEN || finalToken !== API_TOKEN) {
    reply.code(401).send({ message: "Unauthorized" });
    return;
  }
  done();
}

fastify.addHook("preHandler", ensureAuth);

fastify.get("/health", async () => {
  return { ok: true };
});

fastify.get("/clients", async () => {
  const rows = await db.query(
    "SELECT NOME AS name, CNPJ AS cnpj FROM CLIENTESSEMSUPORTE ORDER BY NOME"
  );
  return rows;
});

fastify.post("/clients", async (request, reply) => {
  const name = String(request.body?.name || "").trim();
  const cnpj = normalizeCnpj(request.body?.cnpj);

  if (!name || !cnpj) {
    reply.code(400).send({ message: "Name and CNPJ are required." });
    return;
  }

  const existing = await db.query(
    "SELECT CNPJ FROM CLIENTESSEMSUPORTE WHERE CNPJ = ? LIMIT 1",
    [cnpj]
  );
  if (existing.length) {
    reply.code(409).send({ message: "CNPJ already exists." });
    return;
  }

  await db.query(
    "INSERT INTO CLIENTESSEMSUPORTE (NOME, CNPJ) VALUES (?, ?)",
    [name, cnpj]
  );
  reply.code(201).send({ ok: true });
});

fastify.put("/clients/:cnpj", async (request, reply) => {
  const previousCnpj = normalizeCnpj(request.params.cnpj);
  const name = String(request.body?.name || "").trim();
  const cnpj = normalizeCnpj(request.body?.cnpj || previousCnpj);

  if (!previousCnpj || !name || !cnpj) {
    reply.code(400).send({ message: "Name and CNPJ are required." });
    return;
  }

  await db.query(
    "UPDATE CLIENTESSEMSUPORTE SET NOME = ?, CNPJ = ? WHERE CNPJ = ?",
    [name, cnpj, previousCnpj]
  );
  reply.code(200).send({ ok: true });
});

fastify.delete("/clients/:cnpj", async (request, reply) => {
  const cnpj = normalizeCnpj(request.params.cnpj);
  if (!cnpj) {
    reply.code(400).send({ message: "CNPJ is required." });
    return;
  }

  await db.query("DELETE FROM CLIENTESSEMSUPORTE WHERE CNPJ = ?", [cnpj]);
  reply.code(204).send();
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

fastify.listen({ port, host }).catch((error) => {
  fastify.log.error(error);
  process.exit(1);
});
