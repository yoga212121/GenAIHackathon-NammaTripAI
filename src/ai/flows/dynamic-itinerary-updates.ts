'use server';

/**
 * @fileOverview This file defines a Genkit flow for dynamically updating a trip itinerary based on user selections, budget, and time constraints.
 *
 * - `updateItinerary`: A function that takes user selections and updates the itinerary accordingly.
 * - `UpdateItineraryInput`: The input type for the `updateItinerary` function, including selected places, budget, and time.
 * - `UpdateItineraryOutput`: The return type for the `updateItinerary` function, providing the updated itinerary details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UpdateItineraryInput, UpdateItineraryOutput } from '@/lib/types';
import { UpdateItineraryInputSchema, UpdateItineraryOutputSchema } from '@/lib/types';


export async function updateItinerary(input: UpdateItineraryInput): Promise<UpdateItineraryOutput> {
  return updateItineraryFlow(input);
}

const updateItineraryFlow = ai.defineFlow(
  {
    name: 'updateItineraryFlow',
    inputSchema: UpdateItineraryInputSchema,
    outputSchema: UpdateItineraryOutputSchema,
  },
  async (input) => {
    const prompt = `You are a trip planning expert.

Based on the user's selected places, budget, and available time, generate an optimized itinerary.

Selected Places: ${input.selectedPlaces.join(', ')}
Budget: ${input.budget}
Available Time: ${input.availableTime} days

Provide an updated itinerary, the total estimated price, and total time to complete the itinerary.
Be concise.
`;
    const {output} = await ai.generate({
      prompt: prompt,
      output: {
        schema: UpdateItineraryOutputSchema,
      },
    });

    if (!output) {
      throw new Error('AI did not return a valid output.');
    }
    return output;
  }
);
