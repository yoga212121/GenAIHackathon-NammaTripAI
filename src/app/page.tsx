"use client";

import { useState } from "react";
import type {
  PersonalizedDestinationQuizOutput,
  SuggestDestinationsOutput,
  GenerateItineraryInput,
} from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Quiz } from "@/components/quiz";
import { TripPlanner } from "@/components/trip-planner";
import { DestinationSuggestions } from "@/components/destination-suggestions";
import ItineraryDisplay from "@/components/itinerary-display";
import { RefineTrip } from "@/components/refine-trip";

type View =
  | "start"
  | "quiz"
  | "planner"
  | "results"
  | "refine-trip"
  | "itinerary";

export default function Home() {
  const [view, setView] = useState<View>("start");
  const [quizResult, setQuizResult] =
    useState<PersonalizedDestinationQuizOutput | null>(null);
  const [plannerResults, setPlannerResults] =
    useState<SuggestDestinationsOutput | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(
    null
  );
  const [initialInterests, setInitialInterests] = useState<string>("as per suggestion");
  const [itineraryParams, setItineraryParams] =
    useState<GenerateItineraryInput | null>(null);

  const handleQuizComplete = (result: PersonalizedDestinationQuizOutput) => {
    setQuizResult(result);
    setPlannerResults(null);
    setView("results");
  };

  const handlePlannerSubmit = (results: SuggestDestinationsOutput) => {
    setPlannerResults(results);
    setQuizResult(null);
    setView("results");
  };

  const handleSelectDestination = (
    destination: string,
    plannerInput: Omit<GenerateItineraryInput, "destinations">
  ) => {
    setSelectedDestination(destination);
    setInitialInterests(plannerInput.interests);
    setView("refine-trip");
  };

  const handleRefineTrip = (details: {
    budget: number;
    duration: number;
  }) => {
    if (!selectedDestination) return;
    const params: GenerateItineraryInput = {
      destinations: selectedDestination,
      budget: details.budget,
      timeline: `${details.duration} days`,
      interests: initialInterests,
    };
    setItineraryParams(params);
    setView("itinerary");
  };


  const handleReset = () => {
    setView("start");
    setQuizResult(null);
    setPlannerResults(null);
    setSelectedDestination(null);
    setItineraryParams(null);
  };

  const renderContent = () => {
    switch (view) {
      case "itinerary":
        if (itineraryParams) {
          return (
            <ItineraryDisplay
              params={itineraryParams}
              onBack={handleReset}
            />
          );
        }
        return null;
      case "refine-trip":
        return (
          <RefineTrip
            destination={selectedDestination!}
            onSubmit={handleRefineTrip}
            onBack={() => setView("results")}
          />
        );
      case "results":
        return (
          <DestinationSuggestions
            quizResult={quizResult}
            plannerResults={plannerResults}
            onPlanTrip={handleSelectDestination}
            onBack={handleReset}
          />
        );
      case "start":
      default:
        return (
          <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary">
                Find Your Next Adventure
              </h1>
              <p className="mt-4 text-lg text-foreground/80">
                Let our AI guide you to the perfect destination, or plan the
                trip of your dreams.
              </p>
            </div>
            <Tabs defaultValue="quiz" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quiz">
                  ✨ Find a Destination
                </TabsTrigger>
                <TabsTrigger value="planner">✈️ Plan My Trip</TabsTrigger>
              </TabsList>
              <TabsContent value="quiz">
                <Quiz onQuizComplete={handleQuizComplete} />
              </TabsContent>
              <TabsContent value="planner">
                <TripPlanner onPlannerSubmit={handlePlannerSubmit} />
              </TabsContent>
            </Tabs>
          </div>
        );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background/80">
      <Header />
      <div className="container mx-auto flex-grow p-4 md:p-8 flex items-center justify-center">
        {renderContent()}
      </div>
      <footer className="w-full p-4 text-center text-muted-foreground text-sm">
        <p>Powered by WanderWise AI</p>
      </footer>
    </main>
  );
}
