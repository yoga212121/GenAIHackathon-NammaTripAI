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
import { ArrowLeft, Star } from "lucide-react";
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
    onPlanTrip(destination.destination, plannerInput);
  };
  
  const results = quizResult || plannerResults;
  const isQuizResult = !!quizResult;

  if (results && results.length > 0) {
    return (
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <h2 className="font-headline text-3xl font-bold">{isQuizResult ? 'Here are some personalized suggestions' : 'Here are some suggestions for you'}</h2>
        </div>
        <Carousel className="w-full">
          <CarouselContent>
            {results.map((dest, index) => {
              const imageSeed = dest.imageHint.replace(/\s/g, "");
              const destinationName = isQuizResult ? dest.destination : (dest as any).destination;
              const description = isQuizResult ? dest.reasoning : dest.description;

              return (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="flex flex-col h-full overflow-hidden">
                    <CardHeader className="p-0">
                      <Image
                        src={dest.imageUrl || `https://picsum.photos/seed/${imageSeed}/600/400`}
                        alt={destinationName}
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover"
                        data-ai-hint={dest.imageHint}
                      />
                    </CardHeader>
                    <div className="p-4 flex flex-col flex-grow">
                        <CardTitle className="font-headline text-xl mb-2">{destinationName}</CardTitle>
                        <CardDescription className="flex-grow">{description}</CardDescription>
                    </div>
                    <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
                        <div className="text-sm text-muted-foreground w-full">
                           {!isQuizResult && (
                             <>
                                <div className="flex justify-between"><span>Est. Price:</span> <span className="font-semibold text-foreground">{new Intl.NumberFormat(undefined, { style: 'currency', currency: (dest as any).currency || 'USD', minimumFractionDigits: 0 }).format((dest as any).estimatedPrice)}</span></div>
                                <div className="flex justify-between"><span>Est. Duration:</span> <span className="font-semibold text-foreground">{(dest as any).estimatedDuration} days</span></div>
                             </>
                           )}
                           {dest.rating && (
                             <div className="flex justify-between items-center w-full mt-2">
                               <span>Rating:</span>
                               <span className="font-semibold text-foreground flex items-center gap-1">
                                 <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                 {dest.rating}
                               </span>
                             </div>
                           )}
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
