import { Hono } from "hono";
import { handle } from "hono/vercel";

import accounts from "./accounts";
import transactions from "./transactions";
import users from "./users";

const app = new Hono().basePath("/api");

const routes = app
  .route("/transactions", transactions)
  .route("/accounts", accounts)
  .route("/users", users);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
