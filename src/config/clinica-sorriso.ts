import { SiteConfigSchema } from '@/schemas/site.schema';

const config = SiteConfigSchema.parse({
  slug: 'clinica-sorriso',
  niche: 'clinica',
  site: {
    name: 'Clínica Sorriso & CIA',
    url: 'https://clinicasorriso.com.br',
    title: 'Clínica Sorriso & CIA - Odontologia de Excelência',
    description: 'Odontologia humanizada com tecnologia de ponta. Implantes, clareamento, aparelho ortodôntico e mais. Agende sua avaliação gratuita!',
    ogImage: '/clinica-sorriso/og-image.jpg',
    locale: 'pt_BR',
  },
  nap: {
    businessName: 'Clínica Sorriso & CIA Ltda',
    phone: '+5551999990000',
    whatsapp: '5551999990000',
    email: 'contato@clinicasorriso.com.br',
    address: {
      street: 'Av. Ipiranga',
      number: '1500',
      neighborhood: 'Partenon',
      city: 'Porto Alegre',
      state: 'RS',
      zip: '90610-000',
      country: 'BR',
    },
    geo: {
      lat: -30.0519,
      lng: -51.2137,
    },
    openingHours: ['Mo-Fr 08:00-19:00', 'Sa 08:00-12:00'],
  },
  brand: {
    primaryColor: '#0D9488',
    secondaryColor: '#14B8A6',
    logoLight: '/clinica-sorriso/logo-light.svg',
    logoDark: '/clinica-sorriso/logo-dark.svg',
    fontFamily: 'Inter',
  },
  social: {
    instagram: 'https://instagram.com/clinicasorriso',
    facebook: 'https://facebook.com/clinicasorriso',
    google: 'https://maps.google.com/?place=clinica-sorriso',
    linkedin: 'https://linkedin.com/company/clinicasorriso',
  },
  integrations: {
    whatsappCta: true,
    googleAnalytics: 'G-SORRISO001',
    googleTagManager: 'GTM-SORRISO01',
    facebookPixel: '9876543210',
  },
  sections: ['hero', 'services', 'benefits', 'testimonials', 'faq', 'cta', 'about', 'contact', 'footer'],
  nav: {
    ctaLabel: 'Agendar Avaliação',
    ctaUrl: 'https://wa.me/5551999990000?text=Ola!%20Gostaria%20de%20agendar%20uma%20avaliacao',
    navLinks: [
      { label: 'Serviços', anchor: '#services' },
      { label: 'Sobre', anchor: '#about' },
      { label: 'Depoimentos', anchor: '#testimonials' },
      { label: 'FAQ', anchor: '#faq' },
      { label: 'Contato', anchor: '#contact' },
    ],
  },
});

export default config;
