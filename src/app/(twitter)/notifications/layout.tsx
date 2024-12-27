import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications - Snip",
  description: "Never miss an update. Stay informed about the latest activity on your account with real-time notifications on Snip.",
  openGraph: {
    type: "website",
    title: "Notifications - Snip",
    description: "Never miss an update. Stay informed about the latest activity on your account with real-time notifications on Snip.",
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/notifications`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "Notifications on Snip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notifications - Snip",
    description: "Never miss an update. Stay informed about the latest activity on your account with real-time notifications on Snip.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
        alt: "Snip Notifications Banner",
      },
    ],
  },
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
