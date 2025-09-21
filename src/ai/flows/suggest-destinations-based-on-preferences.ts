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

const SuggestDestinationsInputSchema = z.object({
  budget: z.number().describe('The user\u2019s budget for the trip in USD.'),
  duration: z.number().describe('The duration of the trip in days.'),
  interests: z
    .array(z.string())
    .describe('A list of the user\u2019s interests and preferences.'),
});

export type SuggestDestinationsInput = z.infer<
  typeof SuggestDestinationsInputSchema
>;

const SuggestDestinationsOutputSchema = z.array(z.object({
  destination: z.string().describe('The name of the suggested destination.'),
  description: z.string().describe('A short description of the destination.'),
  imageUrl: z.string().describe('URL of an image of the destination.'),
  estimatedPrice: z.number().describe('Estimated total price for the trip to this destination.'),
  estimatedDuration: z.number().describe('Estimated duration of stay in days.'),
}));

export type SuggestDestinationsOutput = z.infer<
  typeof SuggestDestinationsOutputSchema
>;

export async function suggestDestinationsBasedOnPreferences(
  input: SuggestDestinationsInput
): Promise<SuggestDestinationsOutput> {
  return suggestDestinationsBasedOnPreferencesFlow(input);
}

const suggestDestinationsPrompt = ai.definePrompt({
  name: 'suggestDestinationsPrompt',
  input: {schema: SuggestDestinationsInputSchema},
  output: {schema: SuggestDestinationsOutputSchema},
  prompt: `Suggest destinations based on the user's preferences.

  Budget: {{{budget}}}
  Duration: {{{duration}}} days
  Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Provide a list of destinations with a short description, image URL, estimated price, and estimated duration for each.
  Format the output as a JSON array of objects matching the schema. Be concise and provide the best options.
  `,
});

const suggestDestinationsBasedOnPreferencesFlow = ai.defineFlow(
  {
    name: 'suggestDestinationsBasedOnPreferencesFlow',
    inputSchema: SuggestDestinationsInputSchema,
    outputSchema: SuggestDestinationsOutputSchema,
  },
  async input => {
    const {output} = await suggestDestinationsPrompt(input);
    return output!;
  }
);
