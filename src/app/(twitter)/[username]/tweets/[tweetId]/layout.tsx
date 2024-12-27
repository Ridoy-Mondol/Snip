import { Metadata } from "next";
import { getFullURL } from "@/utilities/misc/getFullURL";

function getImageUrl(photoUrl: string): string {
    const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
        return photoUrl;
      }
    
      return getFullURL(photoUrl) || `${HOST_URL}/assets/og-img.png`; 
  }

export async function generateMetadata({
  params,
}: {
  params: { username: string; tweetId: string };
}): Promise<Metadata> {
  const { tweetId, username } = params;
  const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

  try {
    const response = await fetch(`${HOST_URL}/api/tweets/${username}/${tweetId}`);
    const data = await response.json();

    if (data && data.tweet) {
      const { text, author, photoUrl } = data.tweet;

      const imageUrl = getImageUrl(photoUrl || "/assets/og-img.png");

      return {
        title: `${author.username}'s Tweet - Snip`,
        description: text || `${author.username} shared something interesting.`,
        openGraph: {
          type: "website",
          title: `${author.username}'s Tweet - Snip`,
          description: text || `${author.username} shared something interesting.`,
          url: `${HOST_URL}/${username}/tweets/${tweetId}`,
          images: [
            {
              url: imageUrl,
              type: "image/jpeg",
              width: 1200,
              height: 630,
              alt: `${author.username}'s Tweet`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: `${author.username}'s Tweet - Snip`,
          description: text || `${author.username} shared something interesting.`,
          images: [
            {
              url: imageUrl,
              alt: `${author.username}'s Tweet`,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching tweet details for metadata:", error);
  }

  return {
    title: "Tweet - Snip",
    description: "View tweet details on Snip.",
    openGraph: {
      type: "website",
      title: "Tweet - Snip",
      description: "View tweet details on Snip.",
      url: `${HOST_URL}/${username}/tweets/${tweetId}`,
      images: [
        {
          url: `${HOST_URL}/assets/og-img.png`,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: "Snip Tweet",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tweet - Snip",
      description: "View tweet details on Snip.",
      images: [
        {
          url: `${HOST_URL}/assets/og-img.png`,
          alt: "Snip Tweet",
        },
      ],
    },
  };
}

export default function SingleTweetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
