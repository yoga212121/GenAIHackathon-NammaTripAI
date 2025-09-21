'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests destinations based on user preferences.
 *
 * - suggestDestinationsBasedOnPreferences - A function that takes user preferences (budget, duration, interests) and returns a list of suggested destinations.
 * - SuggestDestinationsInput - The input type for the suggestDestinationsBasedOnPreferences function.
 * - SuggestDestinationsOutput - The return type for the suggestDestinationsBasedOnPreferences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPlaceImageUrl, searchPlaces } from './placesService';

const SuggestDestinationsInputSchema = z.object({
  destinations: z.string().describe('The destination(s) the user is interested in.'),
  budgetMin: z.number().describe('The minimum budget for the trip.'),
  budgetMax: z.number().describe('The maximum budget for the trip.'),
  duration: z.number().describe('The duration of the trip in days.'),
  interests: z
    .array(z.string())
    .describe('A list of the user’s interests and preferences.'),
  currency: z.string().optional().describe('The currency of the budget (e.g., USD, EUR, INR).'),
});

export type SuggestDestinationsInput = z.infer<
  typeof SuggestDestinationsInputSchema
>;

const SuggestDestinationsOutputSchema = z.array(z.object({
  destination: z.string().describe('The name of the suggested destination.'),
  description: z.string().describe('A short description of the destination.'),
  imageUrl: z.string().describe('URL of an image of the destination. This will be populated by a separate service.'),
  imageHint: z.string().describe('One or two keywords for a relevant image search, e.g., "Eiffel Tower" or "Bali riceterrace".'),
  estimatedPrice: z.number().describe('Estimated total price for the trip to this destination.'),
  estimatedDuration: z.number().describe('Estimated duration of stay in days.'),
  currency: z.string().optional().describe('The currency of the estimated price.'),
  rating: z.union([z.number(), z.string()]).describe('The rating of the destination, from 1 to 5, or N/A if not available.'),
}));

export type SuggestDestinationsOutput = z.infer<
  typeof SuggestDestinationsOutputSchema
>;

export async function suggestDestinationsBasedOnPreferences(
  input: SuggestDestinationsInput
): Promise<SuggestDestinationsOutput> {
  return suggestDestinationsBasedOnPreferencesFlow(input);
}

// Define a tool for the AI to find real-world destinations
const findDestinationsTool = ai.defineTool(
  {
    name: 'findRealWorldDestinations',
    description: "Finds real-world travel destinations, cities, or points of interest that match a user's interests. Use this to discover popular, highly-rated places to suggest.",
    inputSchema: z.object({
      query: z.string().describe("The search query, combining user interests and desired locations. For example: 'popular art museums in Italy' or 'best hiking trails in the Alps' or 'highly rated beaches in the Caribbean'."),
    }),
    outputSchema: z.string().describe('A stringified JSON array of up to 5 places, each with a name, place_id, and rating. Returns an empty array string if no places are found.'),
  },
  async (input) => {
    const places = await searchPlaces(input.query);
    if (!places || places.length === 0) {
      return '[]';
    }
    // Return a JSON string for the AI to process.
    return JSON.stringify(places);
  }
);


const prompt = ai.definePrompt({
  name: 'suggestDestinationsPrompt',
  input: { schema: SuggestDestinationsInputSchema },
  output: { schema: SuggestDestinationsOutputSchema },
  tools: [findDestinationsTool],
  prompt: `You are a travel expert who suggests a diverse range of iconic and famous destinations. Your goal is to suggest three popular and highly-rated travel destinations based on the user's preferences.

IMPORTANT: You MUST use the 'findRealWorldDestinations' tool to find real places. Do not rely on your general knowledge.

Instructions:
1.  **Diversify Your Search**: For a given interest, create varied and specific search queries. Do not use the same type of query repeatedly. For example, if the interest is 'food', search for different categories like 'highly-rated restaurants', 'famous local cafes', AND 'historic food markets'.
2.  **Use Keywords**: Add keywords like "popular", "famous", "iconic", or "highly rated" to your queries to find well-known places.
3.  **Call the Tool**: Use the 'findRealWorldDestinations' tool with these diverse queries.
4.  **Suggest from Results**: Use the list of places returned by the tool as the basis for your suggestions.
5.  **Provide Details**: For each suggestion, provide a short description, an estimated price within the user's budget, duration, rating, and a relevant imageHint.

User Preferences:
Destination Focus: {{{destinations}}}
Budget: {{{budgetMin}}} - {{{budgetMax}}} {{{currency}}}
Duration: {{{duration}}} days
Interests: {{{interests}}}

Output requirements:
- The imageUrl field can be an empty string, as it will be populated later.
- The imageHint should be one or two keywords that accurately describe the destination, for example: "Eiffel Tower" or "MTR Restaurant".
- The estimated price for each suggestion MUST be in the requested currency: {{{currency}}} and fall within the user's budget range.
- For each destination object in the output array, you MUST include a "currency" field with the value "{{{currency}}}" and a "rating" field from the tool.
- Format the output as a valid JSON array of objects matching the output schema.
`,
});

const suggestDestinationsBasedOnPreferencesFlow = ai.defineFlow(
  {
    name: 'suggestDestinationsBasedOnPreferencesFlow',
    inputSchema: SuggestDestinationsInputSchema,
    outputSchema: SuggestDestinationsOutputSchema,
  },
  async (input) => {
    const {output: suggestions} = await prompt(input);

    if (!suggestions) {
      throw new Error('AI did not return a valid output.');
    }

    // Enrich each suggestion with a real image URL from the Google Places API
    const enrichedSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        // Use the imageHint provided by the LLM to search for a real image
        const imageUrl = await getPlaceImageUrl(suggestion.imageHint);
        // Return the suggestion with the new, real image URL
        return { ...suggestion, imageUrl: imageUrl || suggestion.imageUrl };
      })
    );

    return enrichedSuggestions;
  }
);
