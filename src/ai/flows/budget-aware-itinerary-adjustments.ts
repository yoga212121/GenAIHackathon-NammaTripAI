'use server';
/**
 * @fileOverview Adjusts the itinerary to fit within the user's budget by suggesting cheaper alternatives.
 * It uses a tool to search for places on Google Maps to create a more accurate and relevant itinerary.
 *
 * - adjustItineraryForBudget - A function that adjusts the itinerary based on the budget.
 * - AdjustItineraryForBudgetInput - The input type for the adjustItineraryForBudget function.
 * - GenerateItineraryOutput - The return type for the function, which is the same as the main itinerary generator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {searchPlaces} from './placesService';
import type { AdjustItineraryForBudgetInput, GenerateItineraryOutput } from '@/lib/types';
import { ItineraryPlaceSchema, AdjustItineraryForBudgetInputSchema, GenerateItineraryOutputSchema } from '@/lib/types';


export async function adjustItineraryForBudget(
  input: AdjustItineraryForBudgetInput
): Promise<GenerateItineraryOutput> {
  return adjustItineraryForBudgetFlow(input);
}

// Define a tool for the AI to search for cheaper places
const findPlacesTool = ai.defineTool(
  {
    name: 'findPlacesForItinerary',
    description:
      "Finds relevant places, attractions, or restaurants for a travel itinerary based on a query and location. Use this to discover points of interest that match the user's interests.",
    inputSchema: z.object({
      query: z.string().describe("The search query. To find cheaper options, add keywords like 'affordable', 'budget-friendly', or 'cheap' to the search. For example: 'affordable restaurants in Koramangala'."),
    }),
    outputSchema: z.string().describe('A comma-separated list of up to 5 place names that match the query, or a message indicating that no places were found.'),
  },
  async (input) => {
    const places = await searchPlaces(input.query);
    if (!places || places.length === 0) {
      return 'No places found matching the query.';
    }
    return places.map((p) => p.name).join(', ');
  }
);

const prompt = ai.definePrompt({
  name: 'adjustItineraryForBudgetPrompt',
  input: {schema: AdjustItineraryForBudgetInputSchema},
  output: {
    schema: GenerateItineraryOutputSchema,
  },
  tools: [findPlacesTool],
  prompt: `You are a travel planning expert who excels at finding budget-friendly options.

A user's itinerary has exceeded their budget. Your task is to analyze the existing itinerary, find cheaper alternatives for the most expensive activities or places, and generate a completely new, revised itinerary that fits within the budget.

User's Budget: {{{budget}}} {{{currency}}}
Destination: {{{destination}}}
Interests: {{{interests}}}

Over-Budget Itinerary (Current Cost: {{{currentCost}}} {{{currency}}}):
---
{{{itinerary}}}
---

Instructions:
1.  **Analyze the Itinerary**: Identify the most expensive places or activities in the provided itinerary.
2.  **Find Cheaper Alternatives**: Use the 'findPlacesForItinerary' tool to find more affordable options. Construct queries using keywords like "cheap", "affordable", "budget-friendly", or "low-cost". For example, search for "affordable restaurants in {{{destination}}}" instead of just "restaurants".
3.  **Rebuild the Itinerary**: Create a new, day-by-day itinerary using the cheaper places you found. The new plan should still be logical and enjoyable.
4.  **Recalculate Everything**: Estimate new costs for each activity and calculate a new 'totalPrice' that is WITHIN the user's budget. All prices MUST be in {{{currency}}}.
5.  **Format Correctly**:
    *   In the 'itinerary' text, wrap all place names in double asterisks (e.g., **New Budget Cafe**).
    *   In the 'places' array, create a corresponding list of objects for each new place, including its name and a one-sentence description.
6.  **Return the Full Output**: Return the complete, revised plan as a valid JSON object with the new 'itinerary', 'totalPrice', 'totalTime', and 'places' array.
`,
});

const adjustItineraryForBudgetFlow = ai.defineFlow(
  {
    name: 'adjustItineraryForBudgetFlow',
    inputSchema: AdjustItineraryForBudgetInputSchema,
    outputSchema: GenerateItineraryOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('AI did not return a valid adjusted itinerary.');
    }
    return output;
  }
);
