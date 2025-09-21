'use server';

import axios from 'axios';

// It's crucial to use environment variables for API keys for security.
const API_KEY = process.env.GEMINI_API_KEY;

const FIND_PLACE_URL = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';
const PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';


/**
 * Searches for places using the Google Places Text Search API.
 * @param query The search query (e.g., "restaurants in New York").
 * @returns A promise that resolves to an array of place results.
 */
export async function searchPlaces(query: string): Promise<{ name: string; place_id: string }[]> {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    console.error('Google Places API key is not configured. Set the GEMINI_API_KEY environment variable.');
    return [];
  }

  try {
    const response = await axios.get(TEXT_SEARCH_URL, {
      params: {
        query: query,
        key: API_KEY,
      },
    });

    if (response.data.status !== 'OK') {
      console.warn(`Text search for query "${query}" failed with status: ${response.data.status}`);
      return [];
    }
    
    // Return a simplified list of places for the AI to use.
    return response.data.results.slice(0, 5).map((place: any) => ({
      name: place.name,
      place_id: place.place_id,
    }));

  } catch (error) {
    console.error(`Failed to search places for query "${query}":`, error);
    return [];
  }
}

/**
 * Finds a place using the Google Places API and returns a public URL for its primary photo.
 *
 * @param placeQuery A search query for the place (e.g., "Eiffel Tower" or "Lalbagh, Bengaluru").
 * @param maxWidth The desired maximum width of the image in pixels.
 * @returns A promise that resolves to the image URL, or a placeholder if not found or an error occurs.
 */
export async function getPlaceImageUrl(placeQuery: string, maxWidth: number = 600): Promise<string> {
  // Fallback image URL generator
  const fallbackImageUrl = `https://picsum.photos/seed/${placeQuery.replace(/\s/g, '')}/600/400`;

  if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    console.error('Google Places API key is not configured. Set the GEMINI_API_KEY environment variable. Using fallback image.');
    return fallbackImageUrl;
  }

  try {
    // Step 1: Find the place to get a photo reference
    const findPlaceParams = {
      input: placeQuery,
      inputtype: 'textquery',
      fields: 'photos', // We only need the photos
      key: API_KEY,
    };

    const findPlaceResponse = await axios.get(FIND_PLACE_URL, { params: findPlaceParams });
    const findPlaceData = findPlaceResponse.data;

    if (findPlaceData.status !== 'OK' || !findPlaceData.candidates?.[0]?.photos?.[0]?.photo_reference) {
      console.warn(`No photo reference found for query: "${placeQuery}". Using fallback image.`);
      return fallbackImageUrl;
    }

    const photoReference = findPlaceData.candidates[0].photos[0].photo_reference;

    // Step 2: Construct the final image URL
    const photoParams = new URLSearchParams({ maxwidth: maxWidth.toString(), photoreference: photoReference, key: API_KEY });
    return `${PHOTO_URL}?${photoParams.toString()}`;
  } catch (error) {
    console.error(`Failed to fetch image from Google Places API for query "${placeQuery}":`, error);
    return fallbackImageUrl; // Return a fallback image in case of an API error
  }
}
