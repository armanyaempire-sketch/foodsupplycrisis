import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/data/articles"
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(80).max(180),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default("Food Supply Crisis Report Editorial Desk"),
    category: z.enum([
      "Global Food Crisis",
      "Food Prices",
      "Food Supply",
      "Food Shortages",
      "Food Security",
      "Climate & Agriculture",
      "Water & Food",
      "Fertilizer",
      "Supply Chains",
      "Food Storage",
      "Solutions",
      "Countries"
    ]),
    keywords: z.array(z.string()).min(3).max(15),
    heroImage: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(false),
    type: z.enum(["analysis", "explainer", "news"]).default("analysis"),
    sources: z.array(z.object({
      name: z.string(),
      url: z.string().url()
    })).min(1),
    related: z.array(z.string()).default([])
  })
});

export const collections = { articles };
