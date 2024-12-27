import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const { username } = params;

  return {
    title: `${username} - Edit Profile - Snip`,
    description: `Edit your profile on Snip, customize your username, bio, and other information.`,
    openGraph: {
      type: "website",
      title: `${username} - Edit Profile - Snip`,
      description: `Edit your profile on Snip, customize your username, bio, and other information.`,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/${username}/edit/`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: `Edit Profile - ${username}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username} - Edit Profile - Snip`,
      description: `Edit your profile on Snip, customize your username, bio, and other information.`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_HOST_URL}/assets/og-img.png`,
          alt: `Edit Profile - ${username}`,
        },
      ],
    },
  };
}

export default function EditLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
