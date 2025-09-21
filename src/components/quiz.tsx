"use client";

import { useState } from "react";
import Image from "next/image";
import { runQuiz } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type {
  PersonalizedDestinationQuizInput,
  PersonalizedDestinationQuizOutput,
  QuizQuestion,
} from "@/lib/types";

import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const quizQuestions: QuizQuestion[] = [
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
      { value: "Moderate", label: "Moderate", imageId: "quiz-activity-culture" },
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
        { value: "Alone", label: "Alone", imageId: "quiz-scenery-mountains" },
        { value: "Partner", label: "Partner", imageId: "quiz-scenery-beach" },
        { value: "Family", label: "Family", imageId: "quiz-scenery-countryside" },
        { value: "Friends", label: "Friends", imageId: "quiz-scenery-city" },
    ],
  },
];

type QuizProps = {
  onQuizComplete: (result: PersonalizedDestinationQuizOutput) => void;
};

export function Quiz({ onQuizComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<PersonalizedDestinationQuizInput>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (questionId: keyof PersonalizedDestinationQuizInput, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers: Partial<PersonalizedDestinationQuizInput>) => {
    if (Object.keys(finalAnswers).length !== quizQuestions.length) {
      toast({
        variant: "destructive",
        title: "Incomplete Quiz",
        description: "Please answer all questions.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await runQuiz(finalAnswers as PersonalizedDestinationQuizInput);
      onQuizComplete(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: (error as Error).message,
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl p-6 md:p-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="font-headline text-2xl font-semibold">
          Finding your perfect destination...
        </h2>
        <p className="text-muted-foreground mt-2">
          Our AI is analyzing your preferences. This won't take long!
        </p>
      </Card>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <Card className="w-full max-w-3xl p-6 md:p-8">
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
              onClick={() => handleAnswer(currentQuestion.id, option.value)}
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
      {currentQuestionIndex > 0 && (
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          >
            Back
          </Button>
        </div>
      )}
    </Card>
  );
}
