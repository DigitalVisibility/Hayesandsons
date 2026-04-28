import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.object({
      name: z.string(),
      image: z.string().optional(),
      bio: z.string().optional(),
      url: z.string().optional(),
    }).optional(),
    category: z.string().default('General'),
    tags: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    primaryKeyword: z.string().optional(),
    heroImage: z.object({
      url: z.string(),
      alt: z.string().optional(),
    }).optional(),
    readTime: z.string().optional(),
    wordCount: z.number().optional(),
    canonical: z.string().optional(),
    og: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
    twitterCard: z.string().optional(),
    twitterSite: z.string().optional(),
    inLanguage: z.string().default('en-GB'),
    contentLocation: z.string().default('UK'),
    areaServed: z.array(z.string()).default([]),
    schema: z.string().optional(),
    enableTOC: z.boolean().default(true),
    enableSharing: z.boolean().default(true),
    shareButtons: z.object({
      twitter: z.boolean().default(true),
      facebook: z.boolean().default(true),
      linkedin: z.boolean().default(true),
    }).default({}),
    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string().optional(),
      company: z.string().optional(),
      rating: z.number().default(5),
    }).optional(),
    cta: z.object({
      enable: z.boolean().default(false),
      title: z.string().optional(),
      description: z.string().optional(),
      buttonText: z.string().optional(),
      buttonUrl: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog };
