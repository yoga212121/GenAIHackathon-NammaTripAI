"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getDestinations } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { SuggestDestinationsOutput } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  budget: z.coerce.number().min(100, "Budget must be at least $100."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day."),
  interests: z.string().min(3, "Please list at least one interest."),
});

type TripPlannerProps = {
  onPlannerSubmit: (results: SuggestDestinationsOutput) => void;
};

export function TripPlanner({ onPlannerSubmit }: TripPlannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: 1000,
      duration: 7,
      interests: "beaches, hiking, food",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const results = await getDestinations({
        ...values,
        interests: values.interests.split(",").map((i) => i.trim()),
      });
      onPlannerSubmit(results);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: (error as Error).message,
      });
      setIsLoading(false);
    }
  }
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl p-6 md:p-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="font-headline text-2xl font-semibold">
          Searching for destinations...
        </h2>
        <p className="text-muted-foreground mt-2">
          Our AI is curating a list of places just for you.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Plan Your Perfect Trip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Budget (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Duration (days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 7" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., hiking, museums, beaches"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate interests with commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Find Destinations"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
