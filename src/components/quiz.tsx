"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { runQuiz } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type {
  PersonalizedDestinationQuizInput,
  GenerateItineraryInput
} from "@/lib/types";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const quizQuestions: {
  id: keyof PersonalizedDestinationQuizInput;
  title: string;
  options: { value: string; label: string; imageId: string }[];
  askForLocation?: boolean;
}[] = [
  {
    id: "question1",
    title: "What type of scenery appeals to you most?",
    options: [
      {
        value: "Mountains",
        label: "Mountains",
        imageId: "quiz-scenery-mountains",
      },
      {
        value: "Beach",
        label: "Beach",
        imageId: "quiz-scenery-beach",
      },
      { value: "City", label: "City", imageId: "quiz-scenery-city" },
      {
        value: "Countryside",
        label: "Countryside",
        imageId: "quiz-scenery-countryside",
      },
    ],
  },
  {
    id: "question2",
    title: "What is your preferred travel pace?",
    options: [
      { value: "Relaxed", label: "Relaxed", imageId: "quiz-activity-relaxation" },
      { value: "Moderate", label: "Moderate", imageId: "quiz-pace-moderate" },
      { value: "Fast-paced", label: "Fast-paced", imageId: "quiz-activity-adventure" },
    ],
  },
  {
    id: "question3",
    title: "What kind of activities do you enjoy on vacation?",
    options: [
      {
        value: "Adventure",
        label: "Adventure",
        imageId: "quiz-activity-adventure",
      },
      { value: "Culture", label: "Culture", imageId: "quiz-activity-culture" },
      {
        value: "Relaxation",
        label: "Relaxation",
        imageId: "quiz-activity-relaxation",
      },
      { value: "Food", label: "Food", imageId: "quiz-activity-food" },
    ],
  },
  {
    id: "question4",
    title: "What is your ideal travel companion?",
    options: [
        { value: "Alone", label: "Alone", imageId: "quiz-companion-alone" },
        { value: "Partner", label: "Partner", imageId: "quiz-companion-partner" },
        { value: "Family", label: "Family", imageId: "quiz-companion-family" },
        { value: "Friends", label: "Friends", imageId: "quiz-companion-friends" },
    ],
  },
  {
    id: "question5",
    title: "What's your desired travel scope?",
    options: [
        { value: "Local", label: "Local (City/State)", imageId: "quiz-scope-local" },
        { value: "Domestic", label: "Domestic (Country)", imageId: "quiz-scope-domestic" },
        { value: "International", label: "International", imageId: "quiz-scope-international" },
    ],
    askForLocation: true,
  },
];

type PlannerInput = Omit<GenerateItineraryInput, "destinations"> & {
  destinations?: string;
};

type QuizProps = {
  onQuizComplete: (plannerInput: PlannerInput, destination: string) => void;
};

type QuizState = 'questions' | 'location' | 'budget';

export function Quiz({ onQuizComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<PersonalizedDestinationQuizInput>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('questions');
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState([500, 2000]);
  const [currency, setCurrency] = useState("USD");
  const [duration, setDuration] = useState(7);
  const { toast } = useToast();
  const locationInputRef = useRef<HTMLInputElement>(null);


  const handleAnswer = (questionId: keyof PersonalizedDestinationQuizInput, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (currentQuestion.askForLocation && (answer === 'Local' || answer === 'Domestic')) {
        setQuizState('location');
        // Focus the input field when it appears
        setTimeout(() => locationInputRef.current?.focus(), 0);
    } else {
        advanceQuiz(newAnswers);
    }
  };

  const handleLocationSubmit = () => {
    const newAnswers = { ...answers, userLocation: location };
    setAnswers(newAnswers);
    advanceQuiz(newAnswers);
  };
  
  const advanceQuiz = (currentAnswers: Partial<PersonalizedDestinationQuizInput>) => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuizState('questions');
    } else {
      setQuizState('budget');
    }
  }

  const handleBudgetSubmit = async () => {
    const finalAnswers = { ...answers };
    if (Object.keys(finalAnswers).filter(k => k.startsWith('question')).length !== quizQuestions.length) {
      toast({
        variant: "destructive",
        title: "Incomplete Quiz",
        description: "Please answer all questions.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const results = await runQuiz(finalAnswers as PersonalizedDestinationQuizInput, {
          budgetMin: budget[0],
          budgetMax: budget[1],
          currency,
          duration: duration,
          interests: [answers.question3 || 'general'],
      });

      if (!results || results.length === 0) {
        toast({
            variant: "destructive",
            title: "No Suggestions Found",
            description: "The AI could not find any destinations for your query. Please try different criteria.",
        });
        setIsLoading(false);
        return;
      }
      
      const topDestination = results[0];

      const plannerInput: PlannerInput = {
        budget: budget[1],
        timeline: `${duration} days`,
        interests: answers.question3 || 'general',
        currency: currency,
      };

      onQuizComplete(plannerInput, topDestination.destination);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: (error as Error).message,
      });
      setIsLoading(false);
    }
  };

  const goBack = () => {
      if (quizState === 'budget') {
          setQuizState('questions');
      } else if (quizState === 'location') {
          setQuizState('questions');
      } else if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
  }


  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl p-6 md:p-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="font-headline text-2xl font-semibold">
          Finding your destination...
        </h2>
        <p className="text-muted-foreground mt-2">
          Our AI is analyzing your preferences and planning your trip.
        </p>
      </Card>
    );
  }

  const renderContent = () => {
    switch (quizState) {
        case 'location':
            return (
                <div className="space-y-4 animate-in fade-in-20 text-center">
                    <Label htmlFor="location" className="text-lg">Please provide your Country or Region</Label>
                    <Input 
                        id="location" 
                        ref={locationInputRef}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., USA, Europe"
                        className="max-w-xs mx-auto"
                    />
                    <Button onClick={handleLocationSubmit} size="lg">
                        Continue <ArrowRight className="ml-2" />
                    </Button>
                </div>
            )
        case 'budget':
            return (
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">
                         Set your trip details
                        </CardTitle>
                        <CardDescription>
                            Finally, let us know your budget and trip duration.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Trip Duration (days)</Label>
                                <Input 
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                                    className="w-24"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Your Budget Range</Label>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary text-sm">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(budget[0])} - {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(budget[1])}
                                    </span>
                                    <Select onValueChange={setCurrency} defaultValue={currency}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="JPY">JPY</SelectItem>
                                            <SelectItem value="CAD">CAD</SelectItem>
                                            <SelectItem value="AUD">AUD</SelectItem>
                                            <SelectItem value="INR">INR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Slider
                                min={0}
                                max={10000}
                                step={100}
                                value={budget}
                                onValueChange={setBudget}
                                className="py-2"
                            />
                        </div>
                        <Button onClick={handleBudgetSubmit} className="w-full" size="lg">
                            ✨ Generate Itinerary
                        </Button>
                    </CardContent>
                </Card>
            )
        case 'questions':
        default:
            const currentQuestion = quizQuestions[currentQuestionIndex];
            const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
            return (
                <>
                 <Progress value={progress} className="mb-6" />
                <h2 className="font-headline text-2xl font-semibold text-center mb-6">
                    {currentQuestion.title}
                </h2>
                <div className={`grid grid-cols-2 ${currentQuestion.options.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
                    {currentQuestion.options.map((option) => {
                    const imageData = PlaceHolderImages.find(p => p.id === option.imageId);
                    return (
                        <Card
                        key={option.value}
                        className="overflow-hidden cursor-pointer group transition-all hover:shadow-lg hover:scale-105"
                        onClick={() => handleAnswer(currentQuestion.id as keyof PersonalizedDestinationQuizInput, option.value)}
                        >
                        <CardContent className="p-0">
                            <div className="relative aspect-w-1 aspect-h-1">
                            {imageData && (
                                <Image
                                src={imageData.imageUrl}
                                alt={option.label}
                                width={400}
                                height={400}
                                className="object-cover w-full h-full"
                                data-ai-hint={imageData.imageHint}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <p className="absolute bottom-2 left-2 right-2 text-primary-foreground font-semibold text-center text-sm md:text-base p-1 bg-black/30 rounded-md">
                                {option.label}
                            </p>
                            </div>
                        </CardContent>
                        </Card>
                    );
                    })}
                </div>
                </>
            )
    }
  }


  return (
    <Card className="w-full max-w-3xl p-6 md:p-8">
      {renderContent()}

      {(currentQuestionIndex > 0 || quizState !== 'questions') && (
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      )}
    </Card>
  );
}

    