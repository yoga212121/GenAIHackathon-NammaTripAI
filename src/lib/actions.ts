"use server";

import {
  personalizedDestinationQuiz,
  type PersonalizedDestinationQuizInput,
  type PersonalizedDestinationQuizOutput,
} from "@/ai/flows/personalized-destination-quiz";
import {
  suggestDestinationsBasedOnPreferences,
  type SuggestDestinationsInput,
  type SuggestDestinationsOutput,
} from "@/ai/flows/suggest-destinations-based-on-preferences";
import {
  generateItinerary,
  type GenerateItineraryInput,
  type GenerateItineraryOutput,
} from "@/ai/flows/dynamic-itinerary-generation";
import {
  adjustItineraryForBudget,
  type AdjustItineraryForBudgetInput,
  type AdjustItineraryForBudgetOutput,
} from "@/ai/flows/budget-aware-itinerary-adjustments";
import { getPlaceImageUrls } from "@/ai/flows/placesService";

// Wrapper type to combine quiz answers with destination preferences for the action
type QuizAndPrefs = SuggestDestinationsInput & {
  quizAnswers: PersonalizedDestinationQuizInput;
};

export async function runQuiz(
  quizAnswers: PersonalizedDestinationQuizInput,
  destinationPrefs: Omit<SuggestDestinationsInput, 'destinations' | 'interests'>
): Promise<SuggestDestinationsOutput> {
  try {
    // 1. Get destination suggestions based on quiz answers
    const quizResult = await personalizedDestinationQuiz(quizAnswers);
    if (!quizResult || !Array.isArray(quizResult) || quizResult.length === 0) {
      throw new Error("AI returned an invalid or empty response for the quiz.");
    }
    
    // 2. Use the top suggestion from the quiz to get more detailed suggestions
    const topDestination = quizResult[0];

    const suggestInput: SuggestDestinationsInput = {
      destinations: topDestination.destination, // Use the destination from the quiz
      interests: [quizAnswers.question3 || ''], // Use interests from the quiz
      ...destinationPrefs
    };

    const suggestions = await suggestDestinationsBasedOnPreferences(suggestInput);
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error("AI could not find any suggestions for the destination.");
    }

    return suggestions;
  } catch (error) {
    console.error("Error in runQuiz action:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get quiz results from AI. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching quiz results from the AI.");
  }
}

export async function getDestinations(
  input: SuggestDestinationsInput
): Promise<SuggestDestinationsOutput> {
  try {
    const result = await suggestDestinationsBasedOnPreferences(input);
    return result;
  } catch (error) {
    console.error("Error in getDestinations:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get destination suggestions from AI. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching destination suggestions.");
  }
}

export async function getItinerary(
  input: GenerateItineraryInput
): Promise<GenerateItineraryOutput> {
  try {
    const result = await generateItinerary(input);
    if (!result || !result.itinerary || !result.places || result.places.length === 0) {
        throw new Error("AI returned an empty or invalid itinerary.");
    }

    // Fetch images for all places in parallel
    const placeNames = result.places.map(p => p.name);
    const imageUrls = await getPlaceImageUrls(placeNames);

    // Add the fetched image URLs to the places array
    result.places = result.places.map((place, index) => ({
      ...place,
      imageUrl: imageUrls[index] || `https://picsum.photos/seed/${place.name.replace(/\s/g, '')}/600/400`,
    }));

    return result;
  } catch (error) {
    console.error("Error in getItinerary:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate itinerary from AI. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the itinerary.");
  }
}

export async function getAdjustedItinerary(
  input: AdjustItineraryForBudgetInput
): Promise<AdjustItineraryForBudgetOutput> {
  try {
    const result = await adjustItineraryForBudget(input);
    return result;
  } catch (error)
 {
    console.error("Error in getAdjustedItinerary:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to adjust itinerary from AI. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while adjusting the itinerary.");
  }
}
