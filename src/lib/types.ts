import type {
  PersonalizedDestinationQuizInput as AIQuizInput,
  PersonalizedDestinationQuizOutput as AIQuizOutput,
} from "@/ai/flows/personalized-destination-quiz";
import type {
  SuggestDestinationsInput as AISuggestInput,
  SuggestDestinationsOutput as AISuggestOutput,
} from "@/ai/flows/suggest-destinations-based-on-preferences";
import type {
  GenerateItineraryInput as AIGenerateItineraryInput,
  GenerateItineraryOutput as AIGenerateItineraryOutput,
} from "@/ai/flows/dynamic-itinerary-generation";
import type {
  AdjustItineraryForBudgetInput as AIAdjustItineraryInput,
  AdjustItineraryForBudgetOutput as AIAdjustItineraryOutput,
} from "@/ai/flows/budget-aware-itinerary-adjustments";

export type PersonalizedDestinationQuizInput = AIQuizInput;
export type PersonalizedDestinationQuizOutput = AIQuizOutput;
export type SuggestDestinationsInput = AISuggestInput;
export type SuggestDestinationsOutput = AISuggestOutput;
export type GenerateItineraryInput = AIGenerateItineraryInput;
export type GenerateItineraryOutput = AIGenerateItineraryOutput;
export type AdjustItineraryForBudgetInput = AIAdjustItineraryInput;
export type AdjustItineraryForBudgetOutput = AIAdjustItineraryOutput;

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
