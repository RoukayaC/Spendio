import { z } from "zod";
import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { HTTPException } from "hono/http-exception";

const app = new Hono().get("/me", clerkMiddleware(), async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    throw new HTTPException(401, {
      message: "Unauthorized",
    });
  }

  try {
    const database = db;
    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId))
      .limit(1);

    if (!user) {
      // Create new user
      const [newUser] = await database
        .insert(users)
        .values({
          clerkId: auth.userId,
        })
        .returning();

      return c.json(newUser, 201);
    }

    return c.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new HTTPException(500, {
      message: "Failed to fetch user",
    });
  }
});

export default app;
