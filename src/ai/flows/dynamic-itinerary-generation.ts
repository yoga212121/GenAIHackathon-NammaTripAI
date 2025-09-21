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

const ItineraryPlaceSchema = z.object({
  name: z.string().describe('The name of the place or attraction.'),
  description: z.string().describe('A short, one-sentence description of the place and the activity there.'),
  imageUrl: z.string().optional().describe('URL for an image of the place. To be populated later.'),
});

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated travel itinerary as a detailed, day-by-day plan. Important: Place names MUST be wrapped in double asterisks, like **Place Name**.'),
  totalPrice: z.number().describe('The estimated total price of the itinerary.'),
  totalTime: z.string().describe('The estimated total time of the itinerary.'),
  places: z.array(ItineraryPlaceSchema).describe('An array of key places included in the itinerary. This should correspond to the places wrapped in asterisks in the itinerary text.'),
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
  prompt: `You are a travel planning expert with deep local knowledge. Your primary task is to create a personalized travel itinerary that feels authentic and includes iconic landmarks and local gems.

IMPORTANT: If the user provides specific places in 'selections', you MUST build the itinerary around them. Otherwise, use the 'findPlacesForItinerary' tool to discover real-world places.

User Preferences:
Destinations: {{{destinations}}}
Budget: {{{budget}}} {{{currency}}}
Timeline: {{{timeline}}}
Interests: {{{interests}}}
{{#if selections}}
User's pre-selected places: {{{selections}}}
{{/if}}

Instructions:
1.  **Prioritize User Selections**: If the user has provided 'selections', use these places as the core of the itinerary. Build the rest of the plan around them.
2.  **Discover Places (if no selections)**: If no selections are provided, analyze the user's interests (e.g., 'hiking, museums, food'). For each interest, create a specific, insightful search query for the 'findPlacesForItinerary' tool. Make several tool calls to find a variety of iconic places.
3.  **Find Restaurants**: For meals (e.g., lunch, dinner), you MUST use the 'findPlacesForItinerary' tool to suggest specific, highly-rated local restaurants. Do not use generic placeholders like 'a local restaurant.'
4.  **Construct Itinerary**: Use the user's selections or the diverse list of iconic places returned by the tool to construct a detailed day-by-day itinerary.
5.  **Format Itinerary**: In the text-based 'itinerary', you MUST wrap the full name of every place, park, restaurant, or attraction in double asterisks. For example: "Start your day at **Dodda Basavana Gudi (The Bull Temple)**." or "Enjoy lunch at **Vidyarthi Bhavan**.".
6.  **Extract Places**: Create a corresponding list of these places for the 'places' array in the output. Each item in the array should have the place's name and a brief description.
7.  **Add Details**: The itinerary should include estimated prices and times for each activity. Ensure the total price is within the user's budget. All prices in the generated itinerary MUST be in the user's specified currency: {{{currency}}}.
8.  **Return Output**: Return the final itinerary text, the calculated total price, total time, and the structured array of places.

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
