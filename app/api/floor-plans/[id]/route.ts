import { getFloorPlanById, listApartments } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const floorPlanId = Number(id);

  const floorPlan = await getFloorPlanById(floorPlanId);
  if (!floorPlan) {
    return NextResponse.json({ error: "Floor plan not found" }, { status: 404 });
  }

  const apartments = await listApartments({});

  return NextResponse.json({
    floor_plan: floorPlan,
    apartments: apartments.filter((apt) => apt.floor_plan_id === floorPlanId),
  });
}
