import { ApartmentCard } from "@/components/apartments/ApartmentCard";
import { Apartment, ImageAsset } from "@/lib/types";

interface Props {
  apartments: Apartment[];
  images: ImageAsset[];
}

export function ApartmentGrid({ apartments, images }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {apartments.map((apartment) => (
        <ApartmentCard
          key={apartment.id}
          apartment={apartment}
          image={images.find((img) => img.apartment_id === apartment.id)}
        />
      ))}
    </div>
  );
}
