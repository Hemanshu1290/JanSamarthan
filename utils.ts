import { betterAuth } from "better-auth";
import exifr from "exifr";

// Better Auth Central Configuration
export const auth = betterAuth({
  emailAndPassword: { enabled: true },
});

// Cosine Similarity Engine for Vector Matchmaking
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

// Server Action: Extract GPS Metadata for Fraud Guard
export async function extractAndVerifyEXIF(
  fileBuffer: Buffer,
  targetLat: number,
  targetLng: number,
) {
  try {
    const exif = await exifr.gps(fileBuffer);
    if (!exif || !exif.latitude || !exif.longitude) {
      return {
        isValidGeo: false,
        error: "No embedded GPS EXIF data found in image.",
      };
    }

    const latDiff = Math.abs(exif.latitude - targetLat);
    const lngDiff = Math.abs(exif.longitude - targetLng);
    const isNearby = latDiff < 0.2 && lngDiff < 0.2; // ~20km Geofence

    return {
      lat: exif.latitude,
      lng: exif.longitude,
      isValidGeo: isNearby,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return { isValidGeo: false, error: "Failed to process photo metadata." };
  }
}
