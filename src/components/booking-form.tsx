"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";

type BookingFormProps = {
    placeName: string;
}

export function BookingForm({ placeName }: BookingFormProps) {
  return (
    <Card className="w-full border-0 shadow-none">
        <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
                <Ticket className="h-6 w-6 text-primary" />
                Booking Details
            </CardTitle>
            <CardDescription>
                This feature is under construction.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-6 bg-muted rounded-lg text-center">
                <p className="font-semibold">Booking for: {placeName}</p>
                <p className="text-sm text-muted-foreground mt-2">(To Be Implemented)</p>
            </div>
        </CardContent>
        <CardFooter>
             <Button className="w-full" disabled>Confirm Booking</Button>
        </CardFooter>
    </Card>
  )
}
