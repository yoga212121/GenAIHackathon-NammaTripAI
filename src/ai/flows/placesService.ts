'use server';

import axios from 'axios';

// It's crucial to use environment variables for API keys for security.
const API_KEY = process.env.GEMINI_API_KEY;

const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';


/**
 * Searches for places using the Google Places Text Search API.
 * @param query The search query (e.g., "restaurants in New York").
 * @returns A promise that resolves to an array of place results including name, id, and rating.
 */
export async function searchPlaces(query: string): Promise<{ name: string; place_id: string; rating: number | string; }[]> {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    console.error('Google Places API key is not configured. Set the GEMINI_API_KEY environment variable.');
    // Return empty array to prevent breaking the flow. The AI can handle this.
    return [];
  }

  try {
    const response = await axios.get(TEXT_SEARCH_URL, {
      params: {
        query: query,
        key: API_KEY,
      },
    });
    
    if (response.data.status !== 'OK' || !response.data.results) {
      console.warn(`Text search for query "${query}" returned status: ${response.data.status}. No results found.`);
      return [];
    }
    
    // Return a simplified list of places for the AI to use.
    return response.data.results.slice(0, 5).map((place: any) => ({
      name: place.name,
      place_id: place.place_id,
      rating: place.rating || 'N/A',
    }));

  } catch (error) {
    console.error(`Failed to search places for query "${query}":`, error);
    return [];
  }
}


/**
 * Gets an image URL for a given place query. It first finds the place to get a photo reference
 * and then constructs the photo URL.
 * @param placeQuery The search query for the place (e.g., "Eiffel Tower").
 * @returns A promise that resolves to the image URL or a fallback picsum URL.
 */
export async function getPlaceImageUrl(placeQuery: string): Promise<string> {
    const fallbackImageUrl = `https://picsum.photos/seed/${placeQuery.replace(/\s/g, '')}/600/400`;

    if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
        console.warn('Google Places API key is not configured. Using fallback image.');
        return fallbackImageUrl;
    }

    try {
        const textSearchResponse = await axios.get(TEXT_SEARCH_URL, {
            params: {
                query: placeQuery,
                key: API_KEY,
                fields: 'photos'
            }
        });

        const photoReference = textSearchResponse.data?.results?.[0]?.photos?.[0]?.photo_reference;

        if (photoReference) {
            return `${PHOTO_URL}?maxwidth=600&photoreference=${photoReference}&key=${API_KEY}`;
        } else {
            console.warn(`No photo reference found for query: "${placeQuery}". Using fallback image.`);
            return fallbackImageUrl;
        }
    } catch (error) {
        console.error(`Error fetching image URL for "${placeQuery}":`, error);
        return fallbackImageUrl;
    }
}


/**
 * Takes an array of place names and returns an array of corresponding image URLs.
 * @param placeNames An array of strings, where each string is the name of a place.
 * @returns A promise that resolves to an array of image URL strings.
 */
export async function getPlaceImageUrls(placeNames: string[]): Promise<string[]> {
    // Use Promise.all to fetch all images concurrently
    const imageUrls = await Promise.all(
        placeNames.map(name => getPlaceImageUrl(name))
    );
    return imageUrls;
}
