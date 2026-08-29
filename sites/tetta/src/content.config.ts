import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  blogSchema,
  caseStudySchema,
  categorySchema,
  policySchema,
  productSchema,
} from "@config/schema";

const md = (dir: string) =>
  glob({ pattern: "**/*.{md,mdx}", base: `./src/content/${dir}` });

export const collections = {
  products: defineCollection({ loader: md("products"), schema: productSchema }),
  categories: defineCollection({ loader: md("categories"), schema: categorySchema }),
  caseStudies: defineCollection({ loader: md("case-studies"), schema: caseStudySchema }),
  blog: defineCollection({ loader: md("blog"), schema: blogSchema }),
  policies: defineCollection({ loader: md("policies"), schema: policySchema }),
};
