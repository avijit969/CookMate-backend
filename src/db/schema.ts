import { relations } from "drizzle-orm";
import { boolean, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  verificationCode: text("verification_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const logged_in_device = pgTable("logged_in_device",{
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id")
  .references(()=>user.id)
  .notNull(),
  deviceName: text("device_name").notNull(),
  expo_push_token: text("expo_push_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
export const recipe = pgTable("recipe", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  instructions: text("instructions").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingredient = pgTable("ingredient", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  recipeId: uuid("recipe_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  quantity: text("quantity").notNull(),
  unit: text("unit").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ✅ Relations
export const recipeRelations = relations(recipe, ({ many }) => ({
  ingredients: many(ingredient),
}));

export const userRelations = relations(user, ({ many }) => ({
  recipes: many(recipe),
}));

export const recipeRelations2 = relations(recipe, ({ one }) => ({
  createdBy: one(user, {
    fields: [recipe.userId],
    references: [user.id],
  }),
}));

export const ingredientRelations = relations(ingredient, ({ one }) => ({
  recipe: one(recipe, {
    fields: [ingredient.recipeId],
    references: [recipe.id],
  }),
}));

export const logged_in_deviceRelations = relations(logged_in_device,({one,many})=>({
  user:one(user,{
    fields:[logged_in_device.userId],
    references:[user.id]
  }),
  devices:many(user)
}))