"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type {
  PersonalizedDestinationQuizOutput,
  SuggestDestinationsOutput,
  GenerateItineraryInput,
} from "@/lib/types";

type DestinationSuggestionsProps = {
  quizResult: PersonalizedDestinationQuizOutput | null;
  plannerResults: SuggestDestinationsOutput | null;
  onPlanTrip: (
    destination: string,
    plannerInput: Omit<GenerateItineraryInput, "destinations">
  ) => void;
  onBack: () => void;
};

export function DestinationSuggestions({
  quizResult,
  plannerResults,
  onPlanTrip,
  onBack,
}: DestinationSuggestionsProps) {
  const handlePlanTripClick = (destination: any) => {
    // This is a simplification. In a real app, you'd have the original form inputs.
    const plannerInput = {
      budget: destination.estimatedPrice || 2000,
      timeline: `${destination.estimatedDuration || 7} days`,
      interests: "as per suggestion",
      currency: "USD", // Default currency, will be refined in next step.
    };
    onPlanTrip(destination.destination || destination.suggestedDestination, plannerInput);
  };

  if (quizResult) {
    const imageSeed = quizResult.imageHint.replace(/\s/g, "");
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">
            Your Personalized Suggestion!
          </CardTitle>
          <CardDescription>
            Based on your quiz answers, we think you'll love:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <h3 className="font-headline text-4xl font-bold mb-2">
            {quizResult.suggestedDestination}
          </h3>
          <Image
            src={quizResult.imageUrl || `https://picsum.photos/seed/${imageSeed}/800/400`}
            alt={quizResult.suggestedDestination}
            width={800}
            height={400}
            className="rounded-lg object-cover w-full aspect-video my-4"
            data-ai-hint={quizResult.imageHint}
          />
          <p className="text-lg text-foreground/90 mt-4">{quizResult.reasoning}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => handlePlanTripClick(quizResult)}
          >
            Let's Plan This Trip!
          </Button>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Start Over
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (plannerResults && plannerResults.length > 0) {
    return (
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <h2 className="font-headline text-3xl font-bold">Here are some suggestions for you</h2>
        </div>
        <Carousel className="w-full">
          <CarouselContent>
            {plannerResults.map((dest, index) => {
              const imageSeed = dest.imageHint.replace(/\s/g, "");
              return (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="flex flex-col h-full overflow-hidden">
                    <CardHeader className="p-0">
                      <Image
                        src={dest.imageUrl || `https://picsum.photos/seed/${imageSeed}/600/400`}
                        alt={dest.destination}
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover"
                        data-ai-hint={dest.imageHint}
                      />
                    </CardHeader>
                    <div className="p-4 flex flex-col flex-grow">
                        <CardTitle className="font-headline text-xl mb-2">{dest.destination}</CardTitle>
                        <CardDescription className="flex-grow">{dest.description}</CardDescription>
                    </div>
                    <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
                        <div className="text-sm text-muted-foreground w-full">
                            <div className="flex justify-between"><span>Est. Price:</span> <span className="font-semibold text-foreground">{new Intl.NumberFormat(undefined, { style: 'currency', currency: dest.currency || 'USD', minimumFractionDigits: 0 }).format(dest.estimatedPrice)}</span></div>
                            <div className="flex justify-between"><span>Est. Duration:</span> <span className="font-semibold text-foreground">{dest.estimatedDuration} days</span></div>
                        </div>
                        <Button className="w-full" onClick={() => handlePlanTripClick(dest)}>Plan this trip</Button>
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            )})}
          </CarouselContent>
          <CarouselPrevious className="ml-12" />
          <CarouselNext className="mr-12"/>
        </Carousel>
         <div className="text-center mt-8">
            <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to planner
            </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg p-8 text-center">
        <CardTitle className="font-headline">No Results Found</CardTitle>
        <CardDescription className="mt-2">The AI couldn't find any suggestions for your query. Try being more specific or changing your criteria.</CardDescription>
        <Button onClick={onBack} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Try Again</Button>
    </Card>
  );
}
