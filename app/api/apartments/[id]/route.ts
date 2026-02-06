import { getApartmentById } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apartment = await getApartmentById(Number(id));

  if (!apartment) {
    return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
  }

  return NextResponse.json({ apartment });
}
