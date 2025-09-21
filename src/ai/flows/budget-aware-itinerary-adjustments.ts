'use server';
/**
 * @fileOverview Adjusts the itinerary to fit within the user's budget by suggesting cheaper alternatives.
 *
 * - adjustItineraryForBudget - A function that adjusts the itinerary based on the budget.
 * - AdjustItineraryForBudgetInput - The input type for the adjustItineraryForBudget function.
 * - AdjustItineraryForBudgetOutput - The return type for the adjustItineraryForBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustItineraryForBudgetInputSchema = z.object({
  itinerary: z.string().describe('The current itinerary details including places, activities, and estimated costs.'),
  budget: z.number().describe('The user specified budget for the trip.'),
  currentCost: z.number().describe('The current total cost of the itinerary.'),
});
export type AdjustItineraryForBudgetInput = z.infer<typeof AdjustItineraryForBudgetInputSchema>;

const AdjustItineraryForBudgetOutputSchema = z.object({
  adjustedItinerary: z.string().describe('The adjusted itinerary with cheaper alternatives, if necessary.'),
  revisedCost: z.number().describe('The revised total cost of the adjusted itinerary.'),
  message: z.string().describe('A message indicating whether adjustments were made and why.'),
});
export type AdjustItineraryForBudgetOutput = z.infer<typeof AdjustItineraryForBudgetOutputSchema>;

export async function adjustItineraryForBudget(input: AdjustItineraryForBudgetInput): Promise<AdjustItineraryForBudgetOutput> {
  return adjustItineraryForBudgetFlow(input);
}

const adjustItineraryForBudgetFlow = ai.defineFlow(
  {
    name: 'adjustItineraryForBudgetFlow',
    inputSchema: AdjustItineraryForBudgetInputSchema,
    outputSchema: AdjustItineraryForBudgetOutputSchema,
  },
  async (input) => {
    const prompt = `You are a trip planning expert helping users stay within their budget.

You are given the current itinerary, the user's budget, and the current total cost.

If the current cost exceeds the budget, suggest alternative, cheaper options for activities, accommodations, or destinations.

Itinerary: ${input.itinerary}
Budget: ${input.budget}
Current Cost: ${input.currentCost}

Output an adjusted itinerary with revised costs that fit within the budget.
Explain what changes were made and why.
Ensure the revisedCost is properly calculated and accurately reflects the adjustedItinerary. Return a message summarizing changes made.
`;
    const {output} = await ai.generate({
      prompt: prompt,
      output: {
        schema: AdjustItineraryForBudgetOutputSchema,
      },
    });

    if (!output) {
      throw new Error('AI did not return a valid output.');
    }
    return output;
  }
);
