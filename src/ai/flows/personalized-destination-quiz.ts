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
import { getPlaceImageUrl, searchPlaces } from './placesService';
import type { PersonalizedDestinationQuizInput, PersonalizedDestinationQuizOutput } from '@/lib/types';
import { PersonalizedDestinationQuizInputSchema, PersonalizedDestinationQuizOutputSchema } from '@/lib/types';



export async function personalizedDestinationQuiz(
  input: PersonalizedDestinationQuizInput
): Promise<PersonalizedDestinationQuizOutput> {
  return personalizedDestinationQuizFlow(input);
}


// Define a tool for the AI to search for places
const findPlacesTool = ai.defineTool(
  {
    name: 'findPlacesForQuiz',
    description:
      'Finds relevant places, attractions, or restaurants for a user based on their quiz answers. Use this to discover points of interest that match the user\'s preferences.',
    inputSchema: z.object({
      query: z.string().describe("The search query. Construct this from the user's quiz answers. For example: 'parks in Bengaluru for families' or 'romantic restaurants in Paris'."),
    }),
    outputSchema: z.string().describe('A stringified JSON array of up to 5 places, each with a name, place_id, and rating. Returns an empty array string if no places are found.'),
  },
  async (input) => {
    const places = await searchPlaces(input.query);
    if (!places || places.length === 0) {
      return '[]';
    }
    // Return a JSON string for the AI to process.
    return JSON.stringify(places);
  }
);


const prompt = ai.definePrompt(
  {
    name: 'personalizedDestinationQuizPrompt',
    input: { schema: PersonalizedDestinationQuizInputSchema },
    output: { schema: PersonalizedDestinationQuizOutputSchema },
    tools: [findPlacesTool],
    prompt: `You are a travel expert who suggests a diverse range of iconic, famous, and locally-loved places. Your goal is to suggest three travel destinations based on the user's quiz answers.

IMPORTANT: You MUST use the 'findPlacesForQuiz' tool to find real places to suggest. Do not rely on your general knowledge.

Instructions:
1. Synthesize the user's answers to create a descriptive, insightful search query for the 'findPlacesForQuiz' tool. Think like a local expert to find varied and interesting places.
2. Call the 'findPlacesForQuiz' tool with this query.
3. Use the list of places returned by the tool as the basis for your suggestions. If the tool returns fewer than three, suggest what you can.
4. For each suggestion, provide a concise reasoning, a rating from the tool, and a relevant imageHint.

Quiz Answers:
1. Scenery: {{{question1}}}
2. Pace: {{{question2}}}
3. Activities: {{{question3}}}
4. Companion: {{{question4}}}
5. Scope: {{{question5}}}
{{#if userLocation}}
6. User's location: {{{userLocation}}}
{{/if}}


IMPORTANT LOCALIZATION RULES:
- If the travel scope is "Local" and the user provides a city name (e.g., "Bengaluru"), you MUST search for and suggest places (neighborhoods, parks, museums) WITHIN that city. Your tool query should be like 'iconic historical monuments in Bengaluru'.
- If the travel scope is "Domestic" and a user location is provided, you MUST suggest a destination within the same country. Your tool query should be like 'famous beaches in [userCountry]'.
- If the user selects "Domestic" or "Local" and has NOT provided a location, you MUST frame your suggestion as an example and state that you can provide a more tailored recommendation if they provide their location. For example: "For a domestic trip, a great city to explore is [City, Country]. If you provide your location, I can suggest a destination closer to you."

The imageUrl field for each object in the array can be an empty string, as it will be populated later.
Format the output as a valid JSON array of objects matching the output schema.
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
    const {output: suggestions} = await prompt(input);

    if (!suggestions || suggestions.length === 0) {
      throw new Error('AI did not return a valid output.');
    }
    
    // Enrich each suggestion with a real image URL
    const enrichedSuggestions = await Promise.all(
        suggestions.map(async (suggestion) => {
            const imageUrl = await getPlaceImageUrl(suggestion.imageHint);
            return { ...suggestion, imageUrl: imageUrl || suggestion.imageUrl };
        })
    );

    return enrichedSuggestions;
  }
);
