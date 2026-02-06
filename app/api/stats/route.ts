import { getStats } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats);
}
