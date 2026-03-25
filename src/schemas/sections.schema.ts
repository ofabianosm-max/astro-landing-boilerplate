import { z } from 'zod';

// Hero
export const HeroSchema = z.object({
  variant: z.enum(['centered', 'split', 'video']).optional().default('centered'),
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  primaryCta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  secondaryCta: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
  image: z.string().optional(),
});

export type Hero = z.infer<typeof HeroSchema>;

// Services
export const ServiceItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export const ServicesSchema = z.object({
  variant: z.enum(['cards', 'list', 'grid']).optional().default('cards'),
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  services: z.array(ServiceItemSchema),
});

export type Services = z.infer<typeof ServicesSchema>;

// Benefits
export const BenefitItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export const BenefitsSchema = z.object({
  variant: z.enum(['icons', 'cards', 'numbered']).optional().default('icons'),
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  benefits: z.array(BenefitItemSchema),
});

export type Benefits = z.infer<typeof BenefitsSchema>;

// Testimonials
export const TestimonialItemSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  avatar: z.string().optional(),
  text: z.string(),
  rating: z.number().min(1).max(5).optional(),
});

export const TestimonialsSchema = z.object({
  variant: z.enum(['carousel', 'grid', 'single-featured', 'masonry']).optional().default('grid'),
  badge: z.string().optional(),
  sectionTitle: z.string(),
  subtitle: z.string().optional(),
  aggregateRating: z.object({
    ratingValue: z.number(),
    reviewCount: z.number(),
  }).optional(),
  items: z.array(TestimonialItemSchema),
});

export type Testimonials = z.infer<typeof TestimonialsSchema>;

// FAQ
export const FAQItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const FAQSchema = z.object({
  variant: z.enum(['accordion', 'two-column', 'card-grid']).optional().default('accordion'),
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(FAQItemSchema),
});

export type FAQ = z.infer<typeof FAQSchema>;

// CTA
export const CTASchema = z.object({
  variant: z.enum(['simple', 'gradient', 'image']).optional().default('simple'),
  badge: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  primaryCta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  secondaryCta: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
});

export type CTA = z.infer<typeof CTASchema>;

// About
export const AboutSchema = z.object({
  variant: z.enum(['professional', 'location']),
  badge: z.string().optional(),
  title: z.string(),
  description: z.string(),
  image: z.string().optional(),
  stats: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  features: z.array(z.string()).optional(),
});

export type About = z.infer<typeof AboutSchema>;

// Footer
export const FooterSchema = z.object({
  variant: z.enum(['minimal', 'full', 'centered']).optional().default('full'),
  logo: z.string().optional(),
  description: z.string().optional(),
  links: z.array(z.object({
    label: z.string(),
    href: z.string(),
  })).optional(),
  social: z.boolean().default(true),
  copyright: z.string().optional(),
});

export type Footer = z.infer<typeof FooterSchema>;

// Navigation
export const NavSchema = z.object({
  ctaLabel: z.string(),
  ctaUrl: z.string(),
  navLinks: z.array(z.object({
    label: z.string(),
    anchor: z.string(),
  })),
});

export type Nav = z.infer<typeof NavSchema>;

// Contact
export const ContactSchema = z.object({
  sectionTitle: z.string(),
  sectionSubtitle: z.string().optional(),
  whatsapp: z.string(),
  email: z.string().email(),
  emailSubject: z.string().optional(),
  background: z.enum(['white', 'gray']).default('white'),
});

export type ContactProps = z.infer<typeof ContactSchema>;
