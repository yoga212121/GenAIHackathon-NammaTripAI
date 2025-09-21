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

const SingleDestinationSchema = z.object({
  destination: z.string().describe("A destination that matches the user's interests and personality based on their quiz answers."),
  reasoning: z.string().describe("Explanation of why the destination matches the user's quiz answers."),
  imageHint: z.string().describe('One or two keywords for a relevant placeholder image, e.g., "Lalbagh Garden" or "Eiffel Tower".'),
  imageUrl: z.string().describe('URL of an image of the destination. This will be populated by a separate service.'),
  rating: z.union([z.number(), z.string()]).describe('The rating of the destination, from 1 to 5, or N/A if not available.'),
});

const PersonalizedDestinationQuizOutputSchema = z.array(SingleDestinationSchema);


export type PersonalizedDestinationQuizOutput = z.infer<
  typeof PersonalizedDestinationQuizOutputSchema
>;

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
    prompt: `You are a travel expert. Your goal is to suggest three travel destinations based on the user's quiz answers.

IMPORTANT: You MUST use the 'findPlacesForQuiz' tool to find real places to suggest. Do not rely on your general knowledge.
1. Synthesize the user's answers to create a descriptive search query. For example, if the user likes 'Culture' and 'City' and is traveling with a 'Partner', the query could be "historical sites in [userLocation]" or "romantic museums in [userLocation]".
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
- If the travel scope is "Local" and the user provides a city name (e.g., "Bengaluru"), you MUST search for and suggest places (neighborhoods, parks, museums) WITHIN that city. Your tool query should be like 'historical monuments in Bengaluru'.
- If the travel scope is "Domestic" and a user location is provided, you MUST suggest a destination within the same country. Your tool query should be like 'best beaches in [userCountry]'.
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
