import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;
  const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    const data = await response.json();

    if (data && data.name && data.image) {
      const { name, image, description } = data;

      return {
        title: `${name} Details - Snip`,
        description: description.en || `${name} is a popular cryptocurrency.`,
        openGraph: {
          type: "website",
          title: `${name} Details - Snip`,
          description: description.en || `${name} is a popular cryptocurrency.`,
          url: `${HOST_URL}/crypto_currency/${id}`,
          images: [
            {
              url: image.large,
              type: "image/jpeg",
              width: 1200,
              height: 630,
              alt: `${name} Cryptocurrency`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: `${name} Details - Snip`,
          description: description.en || `${name} is a popular cryptocurrency.`,
          images: [
            {
              url: image.large,
              alt: `${name} Cryptocurrency`,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching coin details for metadata:", error);
  }

  // Fallback metadata in case of errors
  return {
    title: "Cryptocurrency Details - Snip",
    description: "Explore the latest cryptocurrency data including prices, market trends, and details for various cryptocurrencies on Snip.",
    openGraph: {
      type: "website",
      title: "Cryptocurrency Details - Snip",
      description: "Explore the latest cryptocurrency data including prices, market trends, and details for various cryptocurrencies on Snip.",
      url: `${HOST_URL}/crypto_currency/${id}`,
      images: [
        {
          url: `${HOST_URL}/assets/og-img.png`,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: "Snip Cryptocurrency Details",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cryptocurrency Details - Snip",
      description: "Explore the latest cryptocurrency data including prices, market trends, and details for various cryptocurrencies on Snip.",
      images: [
        {
          url: `${HOST_URL}/assets/og-img.png`,
          alt: "Snip Cryptocurrency Details",
        },
      ],
    },
  };
}
