# SURI CNPJ API (Fastify + MySQL)

Small API for table `CLIENTESSEMSUPORTE` with fields `NOME` and `CNPJ`.

## Setup

1) Copy `.env.example` to `.env` and fill values.
2) Install dependencies:

```bash
npm install
```

3) Start:

```bash
npm start
```

## Endpoints

- `GET /health`
- `GET /clients`
- `POST /clients` body `{ "name": "...", "cnpj": "..." }`
- `PUT /clients/:cnpj` body `{ "name": "...", "cnpj": "..." }`
- `DELETE /clients/:cnpj`

Auth header:

`Authorization: Bearer <API_TOKEN>`

## Table

```sql
CREATE TABLE CLIENTESSEMSUPORTE (
  NOME VARCHAR(255) NOT NULL,
  CNPJ VARCHAR(20) NOT NULL,
  UNIQUE KEY CNPJ_UNIQUE (CNPJ)
);
```

## Render deploy (summary)

- Create a new Web Service.
- Set build command: `npm install`
- Set start command: `npm start`
- Add env vars from `.env`.
