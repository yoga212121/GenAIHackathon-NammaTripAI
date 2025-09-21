// This is a server-side file.
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

const UpdateItineraryInputSchema = z.object({
  selectedPlaces: z
    .array(z.string())
    .describe('List of place names selected by the user.'),
  budget: z.number().describe('The user specified budget for the trip.'),
  availableTime: z
    .string()
    .describe('The time the user has available in days.'),
});
export type UpdateItineraryInput = z.infer<typeof UpdateItineraryInputSchema>;

const UpdateItineraryOutputSchema = z.object({
  updatedItinerary: z.string().describe('A string containing the updated itinerary details, factoring in user selections, budget, and time constraints.'),
  totalPrice: z.number().describe('The total estimated price of the updated itinerary.'),
  totalTime: z.string().describe('Total time to complete the itinerary.'),
});
export type UpdateItineraryOutput = z.infer<typeof UpdateItineraryOutputSchema>;

export async function updateItinerary(input: UpdateItineraryInput): Promise<UpdateItineraryOutput> {
  return updateItineraryFlow(input);
}

const updateItineraryPrompt = ai.definePrompt({
  name: 'updateItineraryPrompt',
  input: {schema: UpdateItineraryInputSchema},
  output: {schema: UpdateItineraryOutputSchema},
  prompt: `You are a trip planning expert.

Based on the user's selected places, budget, and available time, generate an optimized itinerary.

Selected Places: {{{selectedPlaces}}}
Budget: {{{budget}}}
Available Time: {{{availableTime}}} days

Provide an updated itinerary, the total estimated price, and total time to complete the itinerary.
Be concise.
`,
});

const updateItineraryFlow = ai.defineFlow(
  {
    name: 'updateItineraryFlow',
    inputSchema: UpdateItineraryInputSchema,
    outputSchema: UpdateItineraryOutputSchema,
  },
  async input => {
    const {output} = await updateItineraryPrompt(input);
    return output!;
  }
);
