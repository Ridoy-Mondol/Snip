import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explore - Snip",
    description: "Discover trending posts and explore new content on Snip.",
    openGraph: {
      title: "Explore - Snip",
      description: "Discover trending posts and explore new content on Snip.",
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/explore`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: "Explore Snip OpenGraph Image",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Explore - Snip",
      description: "Discover the latest tweets in the Explore section.",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
          alt: "Explore Snip Twitter Image",
        },
      ],
    },
  };
  
  export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        {children}
      </div>
    );
  }
  