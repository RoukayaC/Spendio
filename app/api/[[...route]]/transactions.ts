import { z } from "zod";
import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/drizzle";
import {
  transactions,
  transactionInsertSchema,
  transactionUpdateSchema,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

const app = new Hono()
  .use(clerkMiddleware())
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        accountId: z.string().cuid2().optional(),
        categoryId: z.string().cuid2().optional(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const { accountId, categoryId } = c.req.valid("query");
      try {
        const data = await db
          .select()
          .from(transactions)
          .where(
            and(
              eq(transactions.userId, auth.userId),
              accountId ? eq(transactions.accountId, accountId) : undefined,
              categoryId ? eq(transactions.categoryId, categoryId) : undefined
            )
          );
        return c.json({ data });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new HTTPException(500, {
          message: "Failed to fetch transactions",
        });
      }
    }
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid2() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const { id } = c.req.valid("param");
      try {
        const [data] = await db
          .select()
          .from(transactions)
          .where(
            and(eq(transactions.userId, auth.userId), eq(transactions.id, id))
          );
        if (!data) {
          throw new HTTPException(404, { message: "Transaction not found" });
        }
        return c.json({ data });
      } catch (error) {
        console.error("Error fetching transaction:", error);
        throw new HTTPException(500, {
          message: "Failed to fetch transaction",
        });
      }
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      transactionInsertSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const values = c.req.valid("json");
      try {
        const [data] = await db
          .insert(transactions)
          .values({
            userId: auth.userId,
            ...values,
          })
          .returning();
        return c.json({ data }, 201);
      } catch (error) {
        console.error("Error creating transaction:", error);
        throw new HTTPException(500, {
          message: "Failed to create transaction",
        });
      }
    }
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid2() })),
    zValidator(
      "json",
      transactionUpdateSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");
      try {
        const [data] = await db
          .update(transactions)
          .set(values)
          .where(
            and(eq(transactions.userId, auth.userId), eq(transactions.id, id))
          )
          .returning();
        if (!data) {
          throw new HTTPException(404, {
            message: "Transaction not found or unauthorized",
          });
        }
        return c.json({ data });
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw new HTTPException(500, {
          message: "Failed to update transaction",
        });
      }
    }
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid2() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }
      const { id } = c.req.valid("param");
      try {
        const [data] = await db
          .delete(transactions)
          .where(
            and(eq(transactions.userId, auth.userId), eq(transactions.id, id))
          )
          .returning();
        if (!data) {
          throw new HTTPException(404, {
            message: "Transaction not found or unauthorized",
          });
        }
        return c.json({ data });
      } catch (error) {
        console.error("Error deleting transaction:", error);
        throw new HTTPException(500, {
          message: "Failed to delete transaction",
        });
      }
    }
  );

export default app;
