import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - Snip",
  description: "Stay connected with your friends and colleagues through direct messages. Send and receive messages in real-time on Snip.",
  openGraph: {
    type: "website",
    title: "Messages - Snip",
    description: "Stay connected with your friends and colleagues through direct messages. Send and receive messages in real-time on Snip.",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/messages`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Messages on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Messages - Snip",
    description: "Stay connected with your friends and colleagues through direct messages. Send and receive messages in real-time on Snip.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Messages Banner",
      },
    ],
  },
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
