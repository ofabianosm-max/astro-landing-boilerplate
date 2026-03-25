// JSON-LD TypeScript types (no Zod validation)

export interface LocalBusinessJsonLd {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  image: string;
  url: string;
  telephone: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }[];
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

export interface MedicalBusinessJsonLd {
  '@context': 'https://schema.org';
  '@type': 'MedicalBusiness' | 'Dentist' | 'Physician';
  name: string;
  image: string;
  url: string;
  telephone: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  priceRange?: string;
  medicalSpecialty?: string;
  openingHoursSpecification?: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }[];
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

export interface FAQPageJsonLd {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

export interface PersonJsonLd {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  image?: string;
  email?: string;
  telephone?: string;
  url?: string;
  sameAs?: string[];
  knowsAbout?: string[];
  alumniOf?: string | {
    '@type': 'CollegeOrUniversity';
    name: string;
  };
}
