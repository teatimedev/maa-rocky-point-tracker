import { getPriceTrends } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const trends = await getPriceTrends();
  return NextResponse.json(trends);
}
