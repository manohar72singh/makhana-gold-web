import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://makhanagold.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Makhana Gold | Nature's Purest Crunch • Artisanal Slow-Roasted Fox Nuts",
    template: "%s | Makhana Gold",
  },
  description:
    "Discover the purest slow-roasted Makhana (Fox Nuts) sourced directly from certified wetlands of Bihar. 100% natural, high plant protein, zero palm oil, gluten-free luxury snacking.",
  keywords: [
    "Makhana",
    "Fox Nuts",
    "Roasted Makhana",
    "Phool Makhana",
    "Makhana Gold",
    "Healthy Snacks India",
    "Bihar Wetland Makhana",
    "Gluten Free Snacks",
    "High Protein Snack",
    "Himalayan Pink Salt Makhana",
    "Peri Peri Makhana",
    "Truffle Makhana",
    "Artisanal Superfood",
  ],
  authors: [{ name: "Makhana Gold", url: siteUrl }],
  creator: "Mithilanchal Makhana Audyogikaran Pvt. Ltd.",
  publisher: "Makhana Gold",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Makhana Gold | Nature's Purest Crunch • Artisanal Slow-Roasted Fox Nuts",
    description:
      "100% organic wetland-harvested makhana slow dry-roasted to perfection. Pure mineral balance, zero palm oil, gluten-free & vegan.",
    url: siteUrl,
    siteName: "Makhana Gold",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/vibrant/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Makhana Gold Artisanal Roasted Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Makhana Gold | Nature's Purest Crunch",
    description:
      "Discover artisanal slow-roasted lotus seeds from certified wetlands of Bihar. 100% natural superfood.",
    images: ["/images/vibrant/hero.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo/logo-icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Makhana Gold",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo/logo.png`,
      },
      sameAs: [
        "https://www.instagram.com/makhanagold",
        "https://www.amazon.in/s?k=Makhana+Gold",
        "https://www.flipkart.com/search?q=Makhana+Gold",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+916001684216",
        contactType: "customer service",
        email: "mmakhanaltd@gmail.com",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Connaught Place",
        addressLocality: "New Delhi",
        postalCode: "110001",
        addressCountry: "IN",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Makhana Gold",
      description: "Artisanal slow-roasted wetland fox nuts & clean superfoods.",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

import { AnalyticsTracker } from "@/components/storefront/AnalyticsTracker";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfairDisplay.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-surface text-on-surface font-body-md"
        suppressHydrationWarning
      >
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
