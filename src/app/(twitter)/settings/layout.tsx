import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Snip",
  description: "Customize your Snip experience by managing your settings. Update your profile, preferences, and account settings.",
  openGraph: {
    type: "website",
    title: "Settings - Snip",
    description: "Customize your Snip experience by managing your settings. Update your profile, preferences, and account settings.",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/settings`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Settings on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings - Snip",
    description: "Customize your Snip experience by managing your settings. Update your profile, preferences, and account settings.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Settings Banner",
      },
    ],
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
