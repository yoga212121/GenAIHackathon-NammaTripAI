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
  budget: z.number().describe('The user’s budget for the trip.'),
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
    description: "Finds real-world travel destinations, cities, or points of interest that match a user's interests. Use this to discover potential places to suggest.",
    inputSchema: z.object({
      query: z.string().describe("The search query, combining user interests and desired locations. For example: 'art museums in Italy' or 'best hiking trails in the Alps' or 'beaches in the Caribbean'."),
    }),
    outputSchema: z.string().describe('A comma-separated list of up to 5 place names that match the query, or a message indicating that no places were found.'),
  },
  async (input) => {
    const places = await searchPlaces(input.query);
    if (!places || places.length === 0) {
      return 'No places found matching the query.';
    }
    // Return a simple string list for the AI to process.
    return places.map(p => p.name).join(', ');
  }
);


const prompt = ai.definePrompt({
  name: 'suggestDestinationsPrompt',
  input: { schema: SuggestDestinationsInputSchema },
  output: { schema: SuggestDestinationsOutputSchema },
  tools: [findDestinationsTool],
  prompt: `You are a travel expert. Your goal is to suggest three travel destinations based on the user's preferences.

IMPORTANT: You MUST use the 'findRealWorldDestinations' tool to find real places to suggest. Do not rely on your general knowledge.
1. Create a search query for the tool by combining the user's interests (e.g., {{{interests}}}) and their desired destination (e.g., {{{destinations}}}).
2. Call the 'findRealWorldDestinations' tool with this query.
3. Use the list of places returned by the tool as the basis for your suggestions.
4. For each suggestion, provide a short description, an estimated price, duration, and a relevant imageHint.

User Preferences:
Destination Focus: {{{destinations}}}
Budget: {{{budget}}} {{{currency}}}
Duration: {{{duration}}} days
Interests: {{{interests}}}

Instructions:
- The imageUrl field can be an empty string, as it will be populated later.
- The imageHint should be one or two keywords that accurately describe the destination, for example: "Eiffel Tower" or "Bali riceterrace".
- The estimated price for each suggestion MUST be in the requested currency: {{{currency}}}.
- For each destination object in the output array, you MUST include a "currency" field with the value "{{{currency}}}".
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
