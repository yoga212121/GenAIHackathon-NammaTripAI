"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  budget: z.coerce.number().min(1, "Budget must be greater than 0."),
  duration: z.coerce.number().min(1, "Duration must be at least 1 day."),
  currency: z.string().min(3).max(3),
});

type RefineTripProps = {
  destination: string;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onBack: () => void;
};

export function RefineTrip({ destination, onSubmit, onBack }: RefineTripProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: 2000,
      duration: 7,
      currency: "USD",
    },
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">
          Plan Your Trip to {destination}
        </CardTitle>
        <CardDescription>
          Just a few more details to create your perfect itinerary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormItem>
                <FormLabel>Your Budget</FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2000" {...field} />
                      </FormControl>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-[120px]">
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
                <FormMessage>{form.formState.errors.budget?.message}</FormMessage>
              </FormItem>
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
            <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                ✨ Generate Itinerary
                </Button>
                <Button variant="ghost" onClick={onBack} className="w-full">
                   <ArrowLeft className="mr-2 h-4 w-4" /> Back to Suggestions
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
