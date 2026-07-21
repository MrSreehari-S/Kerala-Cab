"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { DayPicker, type DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Car } from "@/data/cars";
import "react-day-picker/style.css";

/* ── Form Types ── */
interface BookingFormValues {
  fullName: string;
  email: string;
  phone: string;
  rentalType: "self-drive" | "chauffeur-driven" | "wedding";
}

interface BookingModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ car, isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    trigger,
  } = useForm<BookingFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      rentalType: car?.isChauffeurOnly ? "chauffeur-driven" : "self-drive",
    },
  });

  const handleNext = async () => {
    const isValid = await trigger(["fullName", "email", "phone"]);
    if (isValid) setStep(2);
  };

  // Reset form with appropriate defaults whenever the modal opens or car changes
  useEffect(() => {
    if (isOpen && car) {
      reset({
        fullName: "",
        email: "",
        phone: "",
        rentalType: car.isChauffeurOnly ? "chauffeur-driven" : "self-drive",
      });
      setStep(1);
      setDateRange(undefined);
    }
  }, [isOpen, car, reset]);

  const onSubmit = (data: BookingFormValues) => {
    const dateStr = dateRange?.from
      ? `${dateRange.from.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}${
          dateRange.to
            ? " to " + dateRange.to.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : ""
        }`
      : "Not selected";

    // Format a clean, premium WhatsApp booking request
    const message = `Hello KeralaCabs, I would like to make an enquiry:

*Vehicle:* ${car?.name}
*Category:* ${car?.category ? car.category.charAt(0).toUpperCase() + car.category.slice(1) : ""}
*Rate:* ₹${car?.pricePerDay ? car.pricePerDay.toLocaleString("en-IN") : ""}/day

*Rental Preferences:*
• Type: ${data.rentalType.charAt(0).toUpperCase() + data.rentalType.slice(1)}
• Dates: ${dateStr}

*Client Details:*
• Name: ${data.fullName}
• Phone: ${data.phone}
• Email: ${data.email}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/917012436857?text=${encodedMessage}`;

    // Open WhatsApp secure chat
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    toast.success("Redirecting to WhatsApp...", {
      description: `Opening chat to complete reservation for ${car?.name ?? "vehicle"}.`,
      duration: 5000,
    });

    setStep(1);
    setDateRange(undefined);
    reset();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1);
      setDateRange(undefined);
      reset();
      onClose();
    }
  };

  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl p-0 overflow-hidden">
        {/* ── Modal Header with branded bar ── */}
        <div className="relative h-32 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-5">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-bold text-primary-foreground tracking-wide">
                Reserve: {car.name}
              </DialogTitle>
              <DialogDescription className="font-sans text-xs text-primary-foreground/70">
                Step {step} of 2 —{" "}
                {step === 1 ? "Your Details" : "Trip Preferences"}
              </DialogDescription>
            </DialogHeader>
          </div>
          {/* Step indicator */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1">
            <div className="flex-1 bg-accent" />
            <div
              className={`flex-1 transition-colors duration-300 ${
                step === 2 ? "bg-accent" : "bg-primary-foreground/20"
              }`}
            />
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    {...register("fullName", {
                      required: "Name is required",
                      minLength: {
                        value: 3,
                        message: "Name must be at least 3 characters",
                      },
                    })}
                    placeholder="e.g., Arjun Nair"
                    className="h-10 rounded-lg font-sans"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </label>
                  <Input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email",
                      },
                    })}
                    type="email"
                    placeholder="you@example.com"
                    className="h-10 rounded-lg font-sans"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </label>
                  <Input
                    {...register("phone", {
                      required: "Phone number is required",
                      minLength: {
                        value: 10,
                        message: "Phone number must be at least 10 digits",
                      },
                      maxLength: {
                        value: 15,
                        message: "Phone number is too long",
                      },
                    })}
                    placeholder="+91 98765 43210"
                    className="h-10 rounded-lg font-sans"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="mt-2 w-full rounded-full bg-primary font-sans text-sm font-semibold text-primary-foreground transition-all hover:bg-accent hover:text-accent-foreground h-10"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Rental Type */}
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rental Type
                  </label>
                  <Controller
                    name="rentalType"
                    control={control}
                    rules={{ required: "Please select a rental type" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 w-full rounded-lg font-sans">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="self-drive"
                            disabled={car.isChauffeurOnly}
                          >
                            Self Drive
                          </SelectItem>
                          <SelectItem value="chauffeur-driven">
                            Chauffeur Driven
                          </SelectItem>
                          <SelectItem value="wedding">
                            Wedding Rental
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Date Picker */}
                <div>
                  <label className="mb-1.5 block font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rental Dates
                  </label>
                  <div className="rounded-xl border border-border bg-muted/20 p-2 flex justify-center">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={{ before: new Date() }}
                      className="font-sans text-sm"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-1/2 rounded-full font-sans text-sm h-10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-1/2 rounded-full bg-accent font-sans text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90 h-10"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </DialogContent>
    </Dialog>
  );
}
