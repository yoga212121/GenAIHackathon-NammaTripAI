'use server';

/**
 * @fileOverview This file defines a Genkit flow for a personalized destination quiz.
 *
 * The quiz uses visually appealing questions about travel preferences to suggest destinations that match the user's interests and personality.
 *
 * @interface PersonalizedDestinationQuizInput - Defines the input schema for the personalized destination quiz flow.
 * @interface PersonalizedDestinationQuizOutput - Defines the output schema for the personalized destination quiz flow.
 * @function personalizedDestinationQuiz - The main function to run the personalized destination quiz flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedDestinationQuizInputSchema = z.object({
  question1: z
    .string()
    .describe(
      'What type of scenery appeals to you most? (Mountains, Beach, City, Countryside)'
    ),
  question2: z
    .string()    .describe(
      'What is your preferred travel pace? (Relaxed, Moderate, Fast-paced)'
    ),
  question3: z
    .string()
    .describe(
      'What kind of activities do you enjoy on vacation? (Adventure, Culture, Relaxation, Food)'
    ),
  question4: z
    .string()
    .describe(
      'What is your ideal travel companion? (Alone, Partner, Family, Friends)'
    ),
  question5: z
    .string()
    .describe(
      'What is your desired travel scope? (Local, Domestic, International)'
    ),
  userLocation: z.string().optional().describe("The user's location (country, region, or city) to help with local/domestic suggestions.")
});

export type PersonalizedDestinationQuizInput = z.infer<
  typeof PersonalizedDestinationQuizInputSchema
>;

const PersonalizedDestinationQuizOutputSchema = z.object({
  suggestedDestination: z
    .string()
    .describe(
      "A destination that matches the user's interests and personality based on their quiz answers."
    ),
  reasoning: z
    .string()
    .describe(
      "Explanation of why the destination matches the user's quiz answers."
    ),
});

export type PersonalizedDestinationQuizOutput = z.infer<
  typeof PersonalizedDestinationQuizOutputSchema
>;

export async function personalizedDestinationQuiz(
  input: PersonalizedDestinationQuizInput
): Promise<PersonalizedDestinationQuizOutput> {
  return personalizedDestinationQuizFlow(input);
}

const prompt = ai.definePrompt(
  {
    name: 'personalizedDestinationQuizPrompt',
    input: { schema: PersonalizedDestinationQuizInputSchema },
    output: { schema: PersonalizedDestinationQuizOutputSchema },
    prompt: `Based on the user's answers to the following questions, suggest a travel destination that matches their interests and personality.

Questions:
1. What type of scenery appeals to you most? {{{question1}}}
2. What is your preferred travel pace? {{{question2}}}
3. What kind of activities do you enjoy on vacation? {{{question3}}}
4. What is your ideal travel companion? {{{question4}}}
5. What is your desired travel scope? {{{question5}}}
{{#if userLocation}}
The user's location is: {{{userLocation}}}
{{/if}}

Consider these preferences and suggest ONE destination. Explain your reasoning in detail, connecting the user's answers to the suggested destination.

IMPORTANT LOCALIZATION RULES:
- If the travel scope is "Local" and the user provides a city name (e.g., "Bengaluru"), you MUST suggest a neighborhood, park, museum, or point of interest WITHIN that city. Do not suggest another city.
- If the travel scope is "Local" and the user provides a state or region (e.g., "Karnataka"), you may suggest a city or destination within that state/region.
- If the travel scope is "Domestic" and a user location is provided, you MUST suggest a destination within the same country as the user's location.
- If the user selects "Domestic" or "Local" and has NOT provided a location, you MUST frame your suggestion as an example and state that you can provide a more tailored recommendation if they provide their location. For example: "For a domestic trip, a great city to explore is [City, Country]. If you provide your location, I can suggest a destination closer to you."

Return a valid JSON object matching the output schema.
`,
  },
);

const personalizedDestinationQuizFlow = ai.defineFlow(
  {
    name: 'personalizedDestinationQuizFlow',
    inputSchema: PersonalizedDestinationQuizInputSchema,
    outputSchema: PersonalizedDestinationQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('AI did not return a valid output.');
    }
    return output;
  }
);
