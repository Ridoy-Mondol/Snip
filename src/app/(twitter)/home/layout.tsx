import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Snip",
  description: "Welcome to Snip, your go-to platform for sharing and discovering the latest articles, blogs, and ideas. Stay connected and inspired!",
  openGraph: {
    type: "website",
    title: "Home - Snip",
    description: "Welcome to Snip, your go-to platform for sharing and discovering the latest articles, blogs, and ideas. Stay connected and inspired!",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/home`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Welcome to Snip Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home - Snip",
    description: "Welcome to Snip, your go-to platform for sharing and discovering the latest articles, blogs, and ideas. Stay connected and inspired!",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Home Banner",
      },
    ],
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
