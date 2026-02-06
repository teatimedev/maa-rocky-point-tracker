import { deleteSavedApartment, updateSavedApartment } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ apartment_id: string }> }
) {
  const { apartment_id } = await params;
  const removed = await deleteSavedApartment(Number(apartment_id));
  if (!removed) {
    return NextResponse.json({ error: "Saved apartment not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ apartment_id: string }> }
) {
  const { apartment_id } = await params;
  const body = await request.json();
  const updated = await updateSavedApartment(Number(apartment_id), {
    user_notes: body.notes,
    notify_on_price_change: body.notify_on_price_change,
  });

  if (!updated) {
    return NextResponse.json({ error: "Saved apartment not found" }, { status: 404 });
  }

  return NextResponse.json({ saved: updated });
}
