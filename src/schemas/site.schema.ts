import { z } from 'zod';

export const SiteConfigSchema = z.object({
  slug: z.string(),
  niche: z.enum(['clinica', 'advocacia', 'estetica', 'restaurante',
                  'educacao', 'saas', 'imoveis', 'servicos']),
  site: z.object({
    name: z.string(),
    url: z.string().url(),
    title: z.string().max(60),
    description: z.string().max(160),
    ogImage: z.string(),
    locale: z.string().default('pt_BR'),
  }),
  nap: z.object({
    businessName: z.string(),
    phone: z.string(),
    whatsapp: z.string(),
    email: z.string().email().optional(),
    address: z.object({
      street: z.string(),
      number: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      country: z.string().default('BR'),
    }),
    geo: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    openingHours: z.array(z.string()),
  }),
  brand: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string().optional(),
    logoLight: z.string(),
    logoDark: z.string().optional(),
    fontFamily: z.string().default('Inter'),
  }),
  social: z.object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    google: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }),
  integrations: z.object({
    whatsappCta: z.boolean().default(true),
    googleAnalytics: z.string().optional(),
    googleTagManager: z.string().optional(),
    facebookPixel: z.string().optional(),
  }),
  sections: z.array(z.enum([
    'hero', 'services', 'benefits', 'testimonials',
    'faq', 'cta', 'about', 'contact', 'footer'
  ])),
  nav: z.object({
    ctaLabel: z.string(),
    ctaUrl: z.string(),
    navLinks: z.array(z.object({
      label: z.string(),
      anchor: z.string(),
    })),
  }),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
