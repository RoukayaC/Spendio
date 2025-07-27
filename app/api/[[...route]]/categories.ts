import { z } from "zod"
import { Hono } from "hono"
import { clerkMiddleware, getAuth } from "@hono/clerk-auth"
import { zValidator } from "@hono/zod-validator"
import { db } from "@/db/drizzle"
import { categories, categoryInsertSchema, categoryUpdateSchema } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c)
    if (!auth?.userId) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    try {
      const data = await db.select().from(categories).where(eq(categories.userId, auth.userId)).orderBy(categories.name)

      return c.json({ data })
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw new HTTPException(500, { message: "Failed to fetch categories" })
    }
  })
  .get("/:id", clerkMiddleware(), zValidator("param", z.object({ id: z.string().cuid2() })), async (c) => {
    const auth = getAuth(c)
    if (!auth?.userId) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    const { id } = c.req.valid("param")

    try {
      const [data] = await db
        .select()
        .from(categories)
        .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))

      if (!data) {
        throw new HTTPException(404, { message: "Category not found" })
      }

      return c.json({ data })
    } catch (error) {
      console.error("Error fetching category:", error)
      if (error instanceof HTTPException) throw error
      throw new HTTPException(500, { message: "Failed to fetch category" })
    }
  })
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      categoryInsertSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }),
    ),
    async (c) => {
      const auth = getAuth(c)
      if (!auth?.userId) {
        throw new HTTPException(401, { message: "Unauthorized" })
      }

      const values = c.req.valid("json")

      try {
        const [data] = await db
          .insert(categories)
          .values({
            userId: auth.userId,
            ...values,
          })
          .returning()

        return c.json({ data }, 201)
      } catch (error) {
        console.error("Error creating category:", error)
        throw new HTTPException(500, { message: "Failed to create category" })
      }
    },
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().cuid2() })),
    zValidator(
      "json",
      categoryUpdateSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      }),
    ),
    async (c) => {
      const auth = getAuth(c)
      if (!auth?.userId) {
        throw new HTTPException(401, { message: "Unauthorized" })
      }

      const { id } = c.req.valid("param")
      const values = c.req.valid("json")

      try {
        const [data] = await db
          .update(categories)
          .set({
            ...values,
            updatedAt: new Date(),
          })
          .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
          .returning()

        if (!data) {
          throw new HTTPException(404, {
            message: "Category not found or unauthorized",
          })
        }

        return c.json({ data })
      } catch (error) {
        console.error("Error updating category:", error)
        if (error instanceof HTTPException) throw error
        throw new HTTPException(500, { message: "Failed to update category" })
      }
    },
  )
  .delete("/:id", clerkMiddleware(), zValidator("param", z.object({ id: z.string().cuid2() })), async (c) => {
    const auth = getAuth(c)
    if (!auth?.userId) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    const { id } = c.req.valid("param")

    try {
      const [data] = await db
        .delete(categories)
        .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
        .returning()

      if (!data) {
        throw new HTTPException(404, {
          message: "Category not found or unauthorized",
        })
      }

      return c.json({ data })
    } catch (error) {
      console.error("Error deleting category:", error)
      if (error instanceof HTTPException) throw error
      throw new HTTPException(500, { message: "Failed to delete category" })
    }
  })

export default app
