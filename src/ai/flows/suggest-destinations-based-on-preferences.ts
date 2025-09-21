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

import { ai } from '@/ai/genkit';
import { defineFlow, definePrompt } from 'genkit/next';
import { z } from 'genkit/zod';
import { getPlaceImageUrl } from './placesService';
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
  imageUrl: z.string().describe('URL of an image of the destination. Use a placeholder from picsum.photos.'),
  imageHint: z.string().describe('One or two keywords for a relevant placeholder image, e.g., "botanical garden".'),
  imageUrl: z
    .string(),
  imageHint: z
    .string()
    .describe(
      'One or two keywords for a relevant image search, e.g., "Eiffel Tower" or "Bali riceterrace".'
    ),
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

const prompt = ai.definePrompt({
const prompt = definePrompt({
  name: 'suggestDestinationsPrompt',
  input: {schema: SuggestDestinationsInputSchema},
  output: {schema: SuggestDestinationsOutputSchema},
  input: { schema: SuggestDestinationsInputSchema },
  output: { schema: SuggestDestinationsOutputSchema },
  prompt: `Suggest three travel destinations based on the user's preferences.

Destinations: {{{destinations}}}
Budget: {{{budget}}} {{{currency}}}
Duration: {{{duration}}} days
Interests: {{{interests}}}

Provide a list of destinations with a short description, an image URL for each, an estimated price and duration, and a relevant imageHint for each destination.
The image URL should be a placeholder from picsum.photos, in the format https://picsum.photos/seed/your-seed/600/400.
Provide a list of destinations with a short description, an estimated price and duration, and a relevant imageHint for each destination.
The imageUrl field can be an empty string, as it will be populated by a different service.
The imageHint should be one or two keywords that accurately describe the destination, for example: "Eiffel Tower" or "Bali riceterrace".
The estimated price should be in the requested currency: {{{currency}}}.
Important: For each destination object in the output array, you MUST include a "currency" field with the value "{{{currency}}}".
Format the output as a valid JSON array of objects matching the output schema.
`,
});

const suggestDestinationsBasedOnPreferencesFlow = ai.defineFlow(
const suggestDestinationsBasedOnPreferencesFlow = defineFlow(
  {
    name: 'suggestDestinationsBasedOnPreferencesFlow',
    inputSchema: SuggestDestinationsInputSchema,
    outputSchema: SuggestDestinationsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
    const llmResponse = await prompt(input);
    const suggestions = llmResponse.output;

    if (!suggestions) {
      throw new Error('AI did not return a valid output.');
    }
    return output;

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
