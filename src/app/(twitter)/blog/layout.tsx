import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog - Snip",
    description: "Discover, read, and write insightful articles on Snip's Blog. Share your thoughts and stay updated with the latest content.",
    openGraph: {
        type: "article",
        title: "Blog - Snip",
        description: "Discover, read, and write insightful articles on Snip's Blog. Share your thoughts and stay updated with the latest content.",
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/blog`,
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/default-blog.jpg`,
                type: "image/jpeg",
                width: 1200,
                height: 630,
                alt: "Snip Blog OpenGraph Image",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog - Snip",
        description: "Discover, read, and write insightful articles on Snip's Blog. Share your thoughts and stay updated with the latest content.",
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/default-blog.jpg`,
                alt: "Snip Blog Twitter Image",
            },
        ],
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {children}
        </div>
    );
}
