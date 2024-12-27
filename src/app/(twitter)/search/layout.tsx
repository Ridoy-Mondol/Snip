import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - Snip",
  description: "Explore Snip's content with our powerful search. Find articles, blogs, posts, and users that match your interests.",
  openGraph: {
    type: "website",
    title: "Search - Snip",
    description: "Explore Snip's content with our powerful search. Find articles, blogs, posts, and users that match your interests.",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/search`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Search on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Search - Snip",
    description: "Explore Snip's content with our powerful search. Find articles, blogs, posts, and users that match your interests.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Search Banner",
      },
    ],
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
