'use server';

/**
 * @fileOverview Generates a personalized trip itinerary based on user preferences, budget, and timeline.
 * It uses a tool to search for places on Google Maps to create a more accurate and relevant itinerary.
 *
 * - generateItinerary - A function that generates the personalized itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {searchPlaces} from './placesService';

const GenerateItineraryInputSchema = z.object({
  destinations: z
    .string()
    .describe('The destination the user wants to visit (e.g., city, region).'),
  budget: z.number().describe('The user specified budget for the trip.'),
  timeline: z
    .string()
    .optional()
    .describe('The preferred trip duration, e.g., 3 days, 1 week.'),
  interests: z
    .string()
    .describe(
      'The interests of the user for this trip, e.g., hiking, museums, food.'
    ),
  selections: z
    .string()
    .optional()
    .describe('A list of user selected places.'),
  currency: z
    .string()
    .optional()
    .describe('The currency of the budget (e.g., USD, EUR).'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated travel itinerary.'),
  totalPrice: z.number().describe('The estimated total price of the itinerary.'),
  totalTime: z.string().describe('The estimated total time of the itinerary.'),
});
export type GenerateItineraryOutput = z.infer<
  typeof GenerateItineraryOutputSchema
>;

export async function generateItinerary(
  input: GenerateItineraryInput
): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

// Define a tool for the AI to search for places
const findPlacesTool = ai.defineTool(
  {
    name: 'findPlacesForItinerary',
    description:
      'Finds relevant places, attractions, or restaurants for a travel itinerary based on a query and location. Use this to discover points of interest that match the user\'s interests.',
    inputSchema: z.object({
      query: z.string().describe("The search query. Should combine user interests with the destination. For example: 'museums in Paris' or 'best dosa in Bengaluru'."),
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
  name: 'generateItineraryPrompt',
  input: {schema: GenerateItineraryInputSchema},
  output: {schema: GenerateItineraryOutputSchema},
  tools: [findPlacesTool],
  prompt: `You are a travel planning expert with deep local knowledge. Your primary task is to create a personalized travel itinerary that feels authentic and includes iconic landmarks.

IMPORTANT: You MUST use the 'findPlacesForItinerary' tool to discover real-world places. Do not rely on your general knowledge alone.

User Preferences:
Destinations: {{{destinations}}}
Budget: {{{budget}}} {{{currency}}}
Timeline: {{{timeline}}}
Interests: {{{interests}}}
{{#if selections}}
User's pre-selected places: {{{selections}}}
{{/if}}

Instructions:
1.  Analyze the user's interests (e.g., 'hiking, museums, food').
2.  For each interest, think like a local expert. Create a specific, insightful search query for the 'findPlacesForItinerary' tool.
    - Instead of a generic query like 'food in Bangalore', use a more specific and iconic query like 'famous food streets in Bangalore' or 'legendary biryani restaurants in Bangalore'.
    - Instead of 'parks in Paris', try 'famous royal gardens in Paris'.
3.  Make several tool calls to find a variety of iconic places (e.g., one for landmarks, one for legendary food spots, one for famous parks).
4.  Use the iconic places returned by the tool to construct a detailed day-by-day itinerary.
5.  The itinerary should include estimated prices and times for each activity. Ensure the total price is within the user's budget.
6.  All prices in the generated itinerary MUST be in the user's specified currency: {{{currency}}}.
7.  Return the final itinerary, the calculated total price, and the total time.

The response must be a valid JSON object matching the output schema.`,
});

const generateItineraryFlow = ai.defineFlow(
  {
    name: 'generateItineraryFlow',
    inputSchema: GenerateItineraryInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('AI did not return a valid itinerary output.');
    }
    return output;
  }
);
