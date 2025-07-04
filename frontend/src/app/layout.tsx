import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BotShield - One-Click Bot Protection",
  description: "Deploy enterprise-grade bot protection in 30 seconds. Save hundreds monthly on bandwidth costs. Protect your Webflow, Netlify, Vercel, and Shopify sites from expensive bot traffic.",
  keywords: ["bot protection", "cloudflare", "webflow", "netlify", "vercel", "shopify", "bandwidth", "security", "one-click"],
  openGraph: {
    title: "BotShield - One-Click Bot Protection",
    description: "Deploy enterprise-grade bot protection in 30 seconds. Save hundreds monthly on bandwidth costs.",
    type: "website",
    url: "https://botshield.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BotShield - One-Click Bot Protection"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "BotShield - One-Click Bot Protection",
    description: "Deploy enterprise-grade bot protection in 30 seconds. Save hundreds monthly on bandwidth costs.",
    images: ["/og-image.jpg"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
