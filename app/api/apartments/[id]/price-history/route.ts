import { getApartmentPriceHistory } from "@/lib/server/repository";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apartmentId = Number(id);

  const history = await getApartmentPriceHistory(apartmentId);

  return NextResponse.json({
    apartment_id: apartmentId,
    history,
  });
}
