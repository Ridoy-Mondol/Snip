import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const coin = searchParams.get("coin") || "bitcoin";
    const days = searchParams.get("days") || "7";

    const apikey = process.env.COINGECKO_API_KEY;

    if (!apikey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 400 });
    }

    try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`, {
            headers: {
              "x-cg-api-key": apikey || ""
            }
          });
    
        if (!response.ok) {
           const data = await response.text();
           console.log(data);
            return NextResponse.json({ error: "Failed to fetch from CoinGecko" }, { status: response.status });
        }
    
        const data = await response.json();
    
        return NextResponse.json(data);
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
}