import {
  pgTable,
  varchar,
  timestamp,
  numeric,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

//enums
export const accountTypeEnum = pgEnum("account_type", [
  "Checking",
  "Savings",
  "Credit",
  "Card",
]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "Income",
  "Expense",
  "Transfer",
]);
export const categoryTypeEnum = pgEnum("category_type", ["Income", "Expense"]);
export const recurringTypeEnum = pgEnum("recurring_type", [
  "Weekly",
  "Monthly",
  "Yearly",
]);

//tables
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: categoryTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => categories.id, {}),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

// zod schemas
export const accountTypeSchema = z.enum([
  "Checking",
  "Savings",
  "Credit",
  "Card",
]);
export const transactionTypeSchema = z.enum(["Income", "Expense", "Transfer"]);
export const categoryTypeSchema = z.enum(["Income", "Expense"]);
export const recurringTypeSchema = z.enum(["Weekly", "Monthly", "Yearly"]);

// user schemas
export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);
export const userUpdateSchema = createUpdateSchema(users);

// Account schemas
export const accountSelectSchema = createSelectSchema(accounts);
export const accountInsertSchema = createInsertSchema(accounts);
export const accountUpdateSchema = createUpdateSchema(accounts);

// Category schemas
export const categorySelectSchema = createSelectSchema(categories);
export const categoryInsertSchema = createInsertSchema(categories);
export const categoryUpdateSchema = createUpdateSchema(categories);

// Transaction schemas
export const transactionSelectSchema = createSelectSchema(transactions);
export const transactionInsertSchema = createInsertSchema(transactions);
export const transactionUpdateSchema = createUpdateSchema(transactions);

// types
export type User = z.infer<typeof userSelectSchema>;
export type CreateUser = z.infer<typeof userInsertSchema>;
export type UpdateUser = z.infer<typeof userUpdateSchema>;

export type Account = z.infer<typeof accountSelectSchema>;
export type CreateAccount = z.infer<typeof accountInsertSchema>;
export type UpdateAccount = z.infer<typeof accountUpdateSchema>;

export type Category = z.infer<typeof categorySelectSchema>;
export type CreateCategory = z.infer<typeof categoryInsertSchema>;
export type UpdateCategory = z.infer<typeof categoryUpdateSchema>;

export type Transaction = z.infer<typeof transactionSelectSchema>;
export type CreateTransaction = z.infer<typeof transactionInsertSchema>;
export type UpdateTransaction = z.infer<typeof transactionUpdateSchema>;

// enum types
export type AccountType = z.infer<typeof accountTypeSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type RecurringType = z.infer<typeof recurringTypeSchema>;
