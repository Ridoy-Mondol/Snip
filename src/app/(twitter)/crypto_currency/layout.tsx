import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cryptocurrency Details - Snip",
  description: "Explore the latest cryptocurrency data including prices, market trends, and details for various cryptocurrencies on Snip.",
  openGraph: {
    type: "website",
    title: "Cryptocurrency Details - Snip",
    description: "Explore the latest cryptocurrency data including prices, market trends, and details for various cryptocurrencies on Snip.",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/crypto_currency`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Cryptocurrency Details on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cryptocurrency Details - Snip",
    description: "Explore the latest cryptocurrency data including prices, market trends, and details for various cryptocurrencies on Snip.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Cryptocurrency Details Banner",
      },
    ],
  },
};

export default function CryptoCurrencyLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
