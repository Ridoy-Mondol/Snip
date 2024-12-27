import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessions - Snip",
  description: "Manage your sessions and stay on top of your activity on Snip. View your recent sessions and keep track of your usage.",
  openGraph: {
    type: "website",
    title: "Sessions - Snip",
    description: "Manage your sessions and stay on top of your activity on Snip. View your recent sessions and keep track of your usage.",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/sessions`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Sessions on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sessions - Snip",
    description: "Manage your sessions and stay on top of your activity on Snip. View your recent sessions and keep track of your usage.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Sessions Banner",
      },
    ],
  },
};

export default function SessionsLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
