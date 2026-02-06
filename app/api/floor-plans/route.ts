import { listFloorPlans } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const floorPlans = await listFloorPlans();
  return NextResponse.json({ floor_plans: floorPlans });
}
