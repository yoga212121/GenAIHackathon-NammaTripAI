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

export async function runQuiz(
  input: PersonalizedDestinationQuizInput
): Promise<PersonalizedDestinationQuizOutput> {
  try {
    const result = await personalizedDestinationQuiz(input);
    if (!result || !result.suggestedDestination) {
      throw new Error("AI returned an invalid or empty response for the quiz.");
    }
    return result;
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
    if (!result || !result.itinerary) {
        throw new Error("AI returned an empty or invalid itinerary.");
    }
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
  } catch (error) {
    console.error("Error in getAdjustedItinerary:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to adjust itinerary from AI. Details: ${error.message}`);
    }
    throw new Error("An unknown error occurred while adjusting the itinerary.");
  }
}
