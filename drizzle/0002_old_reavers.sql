ALTER TABLE "recipe" DROP CONSTRAINT "recipe_ingredients_ingredient_id_fk";
--> statement-breakpoint
ALTER TABLE "ingredient" ADD COLUMN "recipe_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe" DROP COLUMN "ingredients";