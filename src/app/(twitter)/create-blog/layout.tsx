import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Blog - Snip",
  description: "Start crafting your insightful articles and share your knowledge with the world on Snip. Create your blog post today!",
  openGraph: {
    type: "website",
    title: "Create Blog - Snip",
    description: "Start crafting your insightful articles and share your knowledge with the world on Snip. Create your blog post today!",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/create-blog`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Create Blog on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Blog - Snip",
    description: "Start crafting your insightful articles and share your knowledge with the world on Snip. Create your blog post today!",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Create Blog on Snip",
      },
    ],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
