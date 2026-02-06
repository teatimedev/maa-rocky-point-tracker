import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import {
  getApartmentById,
  getApartmentPriceHistory,
  getApartmentImages,
} from "@/lib/server/repository";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apartmentId = Number(id);

  const [apartment, history, images] = await Promise.all([
    getApartmentById(apartmentId),
    getApartmentPriceHistory(apartmentId),
    getApartmentImages(apartmentId),
  ]);

  if (!apartment) notFound();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#04162d]/70 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/70">Unit {apartment.unit_number}</p>
        <h2 className="mt-2 text-3xl font-semibold">{formatCurrency(apartment.current_price)}/month</h2>
        <p className="mt-2 text-cyan-100/80">
          {apartment.beds} bed • {apartment.baths} bath • {apartment.sq_ft.toLocaleString()} sq ft
        </p>
        <p className="mt-2 text-cyan-100/70">{apartment.move_in_special}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#04162d]/70 p-5">
          <h3 className="text-lg font-medium">Features</h3>
          <div className="flex flex-wrap gap-2">
            {apartment.feature_tags.map((tag) => (
              <span key={tag} className="rounded-full border border-cyan-300/30 px-2 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#04162d]/70 p-5">
          <h3 className="text-lg font-medium">Gallery</h3>
          <div className="grid grid-cols-2 gap-2">
            {images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={img.public_url}
                alt={img.alt_text ?? "Apartment image"}
                className="h-32 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#04162d]/70 p-5">
        <h3 className="mb-3 text-lg font-medium">Price history</h3>
        <PriceHistoryChart data={history.map((item) => ({ date: item.date, price: item.price }))} />
      </div>
    </section>
  );
}
