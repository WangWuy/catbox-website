import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  blogSchema,
  caseStudySchema,
  industrySchema,
  policySchema,
  productSchema,
} from "@config/schema";

const md = (dir: string) =>
  glob({ pattern: "**/*.{md,mdx}", base: `./src/content/${dir}` });

export const collections = {
  products: defineCollection({ loader: md("products"), schema: productSchema }),
  // Catbox dùng Industry thay cho Category F&B/Quà tặng
  industry: defineCollection({ loader: md("industry"), schema: industrySchema }),
  caseStudies: defineCollection({ loader: md("case-studies"), schema: caseStudySchema }),
  blog: defineCollection({ loader: md("blog"), schema: blogSchema }),
  policies: defineCollection({ loader: md("policies"), schema: policySchema }),
};
