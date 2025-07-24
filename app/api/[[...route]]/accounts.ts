import { z } from "zod";
import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/drizzle";
import {
  accounts,
  accountInsertSchema,
  accountUpdateSchema,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { HTTPException } from "hono/http-exception";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    try {
      const data = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, auth.userId));

      return c.json({ data });
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw new HTTPException(500, { message: "Failed to fetch accounts" });
    }
  })
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
          .from(accounts)
          .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)));
        if (!data) {
          throw new HTTPException(404, { message: "Account not found" });
        }
        return c.json({ data });
      } catch (error) {
        console.error("Error fetching account:", error);
        throw new HTTPException(500, { message: "Failed to fetch account" });
      }
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      accountInsertSchema.omit({
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
          .insert(accounts)
          .values({
            userId: auth.userId,
            ...values,
          })
          .returning();
        return c.json({ data }, 201);
      } catch (error) {
        console.error("Error creating account:", error);
        throw new HTTPException(500, { message: "Failed to create account" });
      }
    }
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid2() })),
    zValidator(
      "json",
      accountUpdateSchema.pick({
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
          .update(accounts)
          .set(values)
          .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
          .returning();
        if (!data) {
          throw new HTTPException(404, {
            message: "Account not found or unauthorized",
          });
        }
        return c.json({ data });
      } catch (error) {
        console.error("Error updating account:", error);
        throw new HTTPException(500, { message: "Failed to update account" });
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
          .delete(accounts)
          .where(and(eq(accounts.userId, auth.userId), eq(accounts.id, id)))
          .returning();
        if (!data) {
          throw new HTTPException(404, {
            message: "Account not found or unauthorized",
          });
        }
        return c.json({ data });
      } catch (error) {
        console.error("Error deleting account:", error);
        throw new HTTPException(500, { message: "Failed to delete account" });
      }
    }
  );

export default app;
