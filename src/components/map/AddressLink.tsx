import { Link } from "wouter";
import { cn } from "@/lib/utils";

type AddressLinkProps = {
  address: string;
  lat?: number;
  lng?: number;
  className?: string;
};

export default function AddressLink({ address, lat, lng, className }: AddressLinkProps) {
  // If latitude and longitude are provided, use them in the map link
  // Otherwise, use the address as a search text
  const mapUrl = lat && lng 
    ? `/map?lat=${lat}&lng=${lng}&address=${encodeURIComponent(address)}`
    : `/map?address=${encodeURIComponent(address)}`;

  return (
    <Link href={mapUrl}>
      <span
        className={cn(
          "inline-flex items-center text-primary hover:underline",
          className
        )}
      >
        {address}
      </span>
    </Link>
  );
}