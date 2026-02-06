import { listScrapeLogs } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const logs = await listScrapeLogs();
  return NextResponse.json({ logs });
}
