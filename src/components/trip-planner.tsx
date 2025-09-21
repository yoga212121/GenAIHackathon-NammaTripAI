"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getDestinations } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { GenerateItineraryInput } from "@/lib/types";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  destinations: z.string().min(3, "Please enter at least one destination."),
  budget: z.array(z.number()).length(2, "Budget range is required."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day."),
  interests: z.string().min(3, "Please list at least one interest."),
  currency: z.string().min(3).max(3),
});

type TripPlannerProps = {
  onPlannerSubmit: (
    plannerInput: Omit<GenerateItineraryInput, "destinations">,
    destination: string
  ) => void;
};

export function TripPlanner({ onPlannerSubmit }: TripPlannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destinations: "New York",
      budget: [500, 2000],
      duration: 7,
      interests: "museums, parks, food",
      currency: "USD",
    },
  });

  const budgetValue = form.watch("budget");
  const currencyValue = form.watch("currency");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // The getDestinations action suggests multiple places.
      // In this streamlined flow, we'll take the top suggestion and proceed.
      const results = await getDestinations({
        destinations: values.destinations,
        budgetMin: values.budget[0],
        budgetMax: values.budget[1],
        duration: values.duration,
        interests: values.interests.split(",").map((i) => i.trim()),
        currency: values.currency,
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
      
      const plannerInput: Omit<GenerateItineraryInput, "destinations"> = {
        budget: values.budget[1], // Use max budget for the itinerary plan
        timeline: `${values.duration} days`,
        interests: values.interests,
        currency: values.currency,
      };

      onPlannerSubmit(plannerInput, topDestination.destination);

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
          Building your itinerary...
        </h2>
        <p className="text-muted-foreground mt-2">
          Our AI is planning your trip. This may take a moment.
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <FormField
              control={form.control}
              name="destinations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination(s)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paris, Tokyo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Your Budget Range</FormLabel>
                     <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary text-sm">
                           {new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyValue, minimumFractionDigits: 0 }).format(budgetValue[0])} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyValue, minimumFractionDigits: 0 }).format(budgetValue[1])}
                        </span>
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                </FormControl>
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
                            )}
                        />
                     </div>
                  </div>
                  <FormControl>
                     <Slider
                        min={0}
                        max={10000}
                        step={100}
                        value={field.value}
                        onValueChange={field.onChange}
                        className="py-2"
                     />
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
                  Generating Itinerary...
                </>
              ) : (
                "✨ Generate Itinerary"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
