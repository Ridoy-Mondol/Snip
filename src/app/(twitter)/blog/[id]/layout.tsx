import { Metadata } from "next";
import { getFullURL } from "@/utilities/misc/getFullURL";

function stripHTMLTags(input: string): string {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.body.textContent || "";
}

interface BlogLayoutParams {
  id: string;
}

export async function generateMetadata({
  params,
}: {
  params: BlogLayoutParams;
}): Promise<Metadata> {
  const { id } = params;
  const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

  try {
    const response = await fetch(`${HOST_URL}/api/blogs/${id}`, {
      method: "GET",
    });

    const data = await response.json();

    if (data.success && data.blog) {
      const blog = data.blog;
      const cleanContent = stripHTMLTags(blog.content);

      return {
        title: blog.title,
        description: cleanContent.slice(0, 150),
        openGraph: {
          type: "article",
          title: blog.title,
          description: cleanContent.slice(0, 150),
          url: `${HOST_URL}/blog/${id}`,
          images: [
            {
              url: getFullURL(blog.imageUrl || `${HOST_URL}/assets/default-blog.jpg`),
              alt: blog.title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: blog.title,
          description: cleanContent.slice(0, 150),
          images: [getFullURL(blog.imageUrl || `${HOST_URL}/assets/default-blog.jpg`)],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching blog for metadata:", error);
  }

  return {
    title: "Blog",
    description: "Read our latest blogs and updates.",
  };
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
