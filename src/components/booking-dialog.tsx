"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingForm } from "@/components/booking-form";

type BookingDialogProps = {
  trigger: React.ReactNode;
  placeName: string;
};

export function BookingDialog({ trigger, placeName }: BookingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Your Visit to {placeName}</DialogTitle>
        </DialogHeader>
        <BookingForm placeName={placeName} />
      </DialogContent>
    </Dialog>
  );
}
