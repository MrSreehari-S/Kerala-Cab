"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "./image-upload";
import { Loader2, Plus, X } from "lucide-react";
import type { Car, CarCategory } from "@/data/cars";

interface CarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car?: Car | null;
  onSave: (data: Partial<Car>) => Promise<void>;
}

interface FormValues {
  name: string;
  slug: string;
  category: CarCategory;
  tagline: string;
  pricePerDay: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  seats: number;
  isChauffeurOnly: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function CarFormDialog({
  open,
  onOpenChange,
  car,
  onSave,
}: CarFormDialogProps) {
  const isEditing = !!car;
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      slug: "",
      category: "sedan",
      tagline: "",
      pricePerDay: 3000,
      transmission: "Automatic",
      fuelType: "Petrol",
      seats: 5,
      isChauffeurOnly: false,
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, isEditing, setValue]);

  // Pre-fill form when editing
  useEffect(() => {
    if (car) {
      reset({
        name: car.name,
        slug: car.slug,
        category: car.category,
        tagline: car.tagline,
        pricePerDay: car.pricePerDay,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        isChauffeurOnly: car.isChauffeurOnly || false,
      });
      setImages(car.images || []);
      setFeatures(car.features || []);
    } else {
      reset();
      setImages([]);
      setFeatures([]);
    }
  }, [car, reset]);

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      await onSave({
        ...data,
        images,
        features,
      });
      onOpenChange(false);
    } catch {
      // Error handling is done in parent via toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEditing ? "Edit Car" : "Add New Car"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the vehicle details below."
              : "Fill in the details to add a new vehicle to the fleet."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Basic Info ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Car Name *
              </label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Mercedes-Benz S-Class"
                className="font-sans"
              />
              {errors.name && (
                <p className="font-sans text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Slug
              </label>
              <Input
                {...register("slug", { required: "Slug is required" })}
                placeholder="mercedes-s-class"
                className="font-sans text-muted-foreground"
              />
              {errors.slug && (
                <p className="font-sans text-xs text-destructive">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tagline *
            </label>
            <Textarea
              {...register("tagline", { required: "Tagline is required" })}
              placeholder="The pinnacle of automotive luxury"
              className="font-sans resize-none"
              rows={2}
            />
            {errors.tagline && (
              <p className="font-sans text-xs text-destructive">
                {errors.tagline.message}
              </p>
            )}
          </div>

          {/* ── Specs Grid ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category *
              </label>
              <Select
                value={watch("category")}
                onValueChange={(val) =>
                  setValue("category", val as CarCategory)
                }
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transmission */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Transmission
              </label>
              <Select
                value={watch("transmission")}
                onValueChange={(val) =>
                  setValue("transmission", val as "Automatic" | "Manual")
                }
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fuel Type */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Fuel Type
              </label>
              <Select
                value={watch("fuelType")}
                onValueChange={(val) =>
                  setValue(
                    "fuelType",
                    val as "Petrol" | "Diesel" | "Hybrid" | "Electric"
                  )
                }
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Price */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Price / Day (₹) *
              </label>
              <Input
                type="number"
                {...register("pricePerDay", {
                  required: "Price is required",
                  min: { value: 500, message: "Minimum ₹500" },
                })}
                className="font-sans"
              />
              {errors.pricePerDay && (
                <p className="font-sans text-xs text-destructive">
                  {errors.pricePerDay.message}
                </p>
              )}
            </div>

            {/* Seats */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Seats *
              </label>
              <Input
                type="number"
                {...register("seats", {
                  required: "Seats required",
                  min: { value: 2, message: "Min 2" },
                  max: { value: 12, message: "Max 12" },
                })}
                className="font-sans"
              />
              {errors.seats && (
                <p className="font-sans text-xs text-destructive">
                  {errors.seats.message}
                </p>
              )}
            </div>

            {/* Chauffeur Only */}
            <div className="space-y-1.5">
              <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Chauffeur Only
              </label>
              <div className="flex h-9 items-center">
                <label className="relative inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("isChauffeurOnly")}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-9 rounded-full bg-border transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-foreground after:transition-transform peer-checked:bg-accent peer-checked:after:translate-x-full" />
                  <span className="font-sans text-sm text-foreground">
                    {watch("isChauffeurOnly") ? "Yes" : "No"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* ── Features ── */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Features
            </label>
            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) =>
                  setFeatureInput((e.target as HTMLInputElement).value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Add a feature and press Enter"
                className="font-sans"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                <AnimatePresence>
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge
                        className="cursor-pointer gap-1 font-sans text-xs"
                        onClick={() => removeFeature(index)}
                      >
                        {feature}
                        <X className="h-3 w-3" />
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Image Upload ── */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Photos
            </label>
            <ImageUpload images={images} onImagesChange={setImages} />
          </div>

          {/* ── Footer ── */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-sans"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-accent font-sans font-semibold text-accent-foreground hover:bg-accent/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving…" : "Adding…"}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Car"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
