import { listSavedApartments, saveApartment } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const saved = await listSavedApartments();
  return NextResponse.json({ saved });
}

export async function POST(request: Request) {
  const body = await request.json();
  const apartmentId = Number(body.apartment_id);

  if (!apartmentId) {
    return NextResponse.json({ error: "apartment_id is required" }, { status: 400 });
  }

  const result = await saveApartment(apartmentId, body.notes);

  if (!result) {
    return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
  }

  return NextResponse.json({ saved: result }, { status: 201 });
}
