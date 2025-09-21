import {z} from 'genkit';


// Personalized Destination Quiz
export const PersonalizedDestinationQuizInputSchema = z.object({
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
export const PersonalizedDestinationQuizOutputSchema = z.array(SingleDestinationSchema);
export type PersonalizedDestinationQuizOutput = z.infer<
  typeof PersonalizedDestinationQuizOutputSchema
>;


// Suggest Destinations Based on Preferences
export const SuggestDestinationsInputSchema = z.object({
  destinations: z.string().describe('The destination(s) the user is interested in.'),
  budgetMin: z.number().describe('The minimum budget for the trip.'),
  budgetMax: z.number().describe('The maximum budget for the trip.'),
  duration: z.number().describe('The duration of the trip in days.'),
  interests: z
    .array(z.string())
    .describe('A list of the user’s interests and preferences.'),
  currency: z.string().optional().describe('The currency of the budget (e.g., USD, EUR, INR).'),
});
export type SuggestDestinationsInput = z.infer<
  typeof SuggestDestinationsInputSchema
>;

export const SuggestDestinationsOutputSchema = z.array(z.object({
  destination: z.string().describe('The name of the suggested destination.'),
  description: z.string().describe('A short description of the destination.'),
  imageUrl: z.string().describe('URL of an image of the destination. This will be populated by a separate service.'),
  imageHint: z.string().describe('One or two keywords for a relevant image search, e.g., "Eiffel Tower" or "Bali riceterrace".'),
  estimatedPrice: z.number().describe('Estimated total price for the trip to this destination.'),
  estimatedDuration: z.number().describe('Estimated duration of stay in days.'),
  currency: z.string().optional().describe('The currency of the estimated price.'),
  rating: z.union([z.number(), z.string()]).describe('The rating of the destination, from 1 to 5, or N/A if not available.'),
}));
export type SuggestDestinationsOutput = z.infer<
  typeof SuggestDestinationsOutputSchema
>;


// Dynamic Itinerary Generation
export const GenerateItineraryInputSchema = z.object({
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

export const ItineraryPlaceSchema = z.object({
  name: z.string().describe('The name of the place or attraction.'),
  description: z.string().describe('A short, one-sentence description of the place and the activity there.'),
  imageUrl: z.string().optional().describe('URL for an image of the place. To be populated later.'),
});

export const GenerateItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated travel itinerary as a detailed, day-by-day plan. Important: Place names MUST be wrapped in double asterisks, like **Place Name**.'),
  totalPrice: z.number().describe('The estimated total price of the itinerary.'),
  totalTime: z.string().describe('The estimated total time of the itinerary.'),
  places: z.array(ItineraryPlaceSchema).describe('An array of key places included in the itinerary. This should correspond to the places wrapped in asterisks in the itinerary text.'),
});
export type GenerateItineraryOutput = z.infer<
  typeof GenerateItineraryOutputSchema
>;

// Budget Aware Itinerary Adjustments
export const AdjustItineraryForBudgetInputSchema = z.object({
  itinerary: z.string().describe('The current itinerary details including places, activities, and estimated costs.'),
  budget: z.number().describe('The user specified budget for the trip.'),
  currentCost: z.number().describe('The current total cost of the itinerary.'),
  destination: z.string().describe('The original destination, e.g., "Koramangala, Bangalore".'),
  interests: z.string().describe('The original interests, e.g., "food, parks".'),
  currency: z.string().optional().describe('The currency of the budget (e.g., USD, EUR).'),
});
export type AdjustItineraryForBudgetInput = z.infer<typeof AdjustItineraryForBudgetInputSchema>;
export type AdjustItineraryForBudgetOutput = GenerateItineraryOutput;

// Dynamic Itinerary Updates
export const UpdateItineraryInputSchema = z.object({
  selectedPlaces: z
    .array(z.string())
    .describe('List of place names selected by the user.'),
  budget: z.number().describe('The user specified budget for the trip.'),
  availableTime: z
    .string()
    .describe('The time the user has available in days.'),
});
export type UpdateItineraryInput = z.infer<typeof UpdateItineraryInputSchema>;

export const UpdateItineraryOutputSchema = z.object({
  updatedItinerary: z.string().describe('A string containing the updated itinerary details, factoring in user selections, budget, and time constraints.'),
  totalPrice: z.number().describe('The total estimated price of the updated itinerary.'),
  totalTime: z.string().describe('Total time to complete the itinerary.'),
});
export type UpdateItineraryOutput = z.infer<typeof UpdateItineraryOutputSchema>;


// Frontend-specific types
export type QuizQuestion = {
  id: string;
  title: string;
  options: QuizOption[];
  askForLocation?: boolean;
};

export type QuizOption = {
  value: string;
  label: string;
  imageId: string;
};
