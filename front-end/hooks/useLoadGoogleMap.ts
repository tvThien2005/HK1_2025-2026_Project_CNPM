"use client";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries = ["places"] as const;

export const useLoadGoogleMap = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: [...libraries],
  });

  return { isLoaded, loadError };
};
