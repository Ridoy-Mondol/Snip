import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Settings - Snip",
  description: "Manage your developer settings, including API keys and access to API documentation for integrating external apps with Snip.",
  openGraph: {
    type: "website",
    title: "Developer Settings - Snip",
    description: "Manage your developer settings, including API keys and access to API documentation for integrating external apps with Snip.",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/developer_settings`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Developer Settings on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Settings - Snip",
    description: "Manage your developer settings, including API keys and access to API documentation for integrating external apps with Snip.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Developer Settings Banner",
      },
    ],
  },
};

export default function DeveloperSettingsLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
