'use server';

/**
 * @fileOverview Generates a personalized trip itinerary based on user preferences, budget, and timeline.
 *
 * - generateItinerary - A function that generates the personalized itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItineraryInputSchema = z.object({
  destinations: z
    .string()
    .describe('A list of destinations the user wants to visit.'),
  budget: z.number().describe('The user specified budget for the trip.'),
  timeline: z
    .string()
    .optional()
    .describe('The preferred trip duration, e.g., 3 days, 1 week.'),
  interests: z
    .string()
    .describe('The interests of the user for this trip, e.g., hiking, museums, food.'),
  selections: z
    .string()
    .optional()
    .describe('A list of user selected places.'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated travel itinerary.'),
  totalPrice: z.number().describe('The estimated total price of the itinerary.'),
  totalTime: z.string().describe('The estimated total time of the itinerary.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const generateItineraryFlow = ai.defineFlow(
  {
    name: 'generateItineraryFlow',
    inputSchema: GenerateItineraryInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      prompt: `You are a travel planning expert. Given the following information, create a personalized travel itinerary.

Destinations: ${input.destinations}
Budget: ${input.budget}
Timeline: ${input.timeline}
Interests: ${input.interests}
${input.selections ? `Selections: ${input.selections}` : ''}

Create a detailed itinerary, including estimated prices and times for each activity. Return the itinerary, total price, and total time.
The response should be in a valid JSON format.
`,
      output: {
        schema: GenerateItineraryOutputSchema,
      },
    });

    if (!output) {
      throw new Error('AI did not return a valid itinerary output.');
    }
    return output;
  }
);
