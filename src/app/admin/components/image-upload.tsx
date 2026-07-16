"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedImage {
  url: string;
  publicId?: string;
}

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

interface UploadProgress {
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const uploadToCloudinary = async (file: File): Promise<UploadedImage> => {
    // 1. Get a signed upload signature from our API
    const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
    if (!signRes.ok) throw new Error("Failed to get upload signature");
    const { signature, timestamp, cloudName, apiKey, folder } =
      await signRes.json();

    // 2. Upload to Cloudinary using the signed params
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!uploadRes.ok) throw new Error("Upload failed");
    const data = await uploadRes.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remainingSlots = maxImages - images.length;
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);

      if (filesToUpload.length === 0) return;

      // Create upload progress entries with previews
      const newUploads: UploadProgress[] = filesToUpload.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "uploading" as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Upload each file
      const uploadPromises = filesToUpload.map(async (file, index) => {
        try {
          // Simulate progress stages
          const progressInterval = setInterval(() => {
            setUploads((prev) =>
              prev.map((u) =>
                u.file === file && u.status === "uploading"
                  ? { ...u, progress: Math.min(u.progress + 15, 85) }
                  : u
              )
            );
          }, 300);

          const result = await uploadToCloudinary(file);

          clearInterval(progressInterval);

          // Mark as done
          setUploads((prev) =>
            prev.map((u) =>
              u.file === file ? { ...u, progress: 100, status: "done" } : u
            )
          );

          // Add to images array after a brief moment to show completion
          setTimeout(() => {
            onImagesChange([...images, result.url]);
            setUploads((prev) => prev.filter((u) => u.file !== file));
          }, 600);

          return result;
        } catch (err) {
          setUploads((prev) =>
            prev.map((u) =>
              u.file === file
                ? {
                    ...u,
                    status: "error",
                    error:
                      err instanceof Error ? err.message : "Upload failed",
                  }
                : u
            )
          );
          return null;
        }
      });

      await Promise.allSettled(uploadPromises);
    },
    [images, maxImages, onImagesChange]
  );

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const removeUpload = (file: File) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.file === file);
      if (upload) URL.revokeObjectURL(upload.preview);
      return prev.filter((u) => u.file !== file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: images.length >= maxImages,
  });

  return (
    <div className="space-y-4">
      {/* ── Existing Images ── */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          <AnimatePresence>
            {images.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
              >
                <Image
                  src={url}
                  alt={`Car image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-accent/90 px-2 py-0.5 font-sans text-[10px] font-semibold text-accent-foreground">
                    Cover
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Uploading Items ── */}
      <AnimatePresence>
        {uploads.map((upload) => (
          <motion.div
            key={upload.preview}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={upload.preview}
                alt="Uploading"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs text-foreground truncate max-w-[160px]">
                  {upload.file.name}
                </span>
                {upload.status === "uploading" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                )}
                {upload.status === "error" && (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                )}
              </div>
              {/* Progress bar */}
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <motion.div
                  className={`h-full rounded-full ${
                    upload.status === "error" ? "bg-destructive" : "bg-accent"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${upload.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {upload.status === "error" && (
                <p className="font-sans text-[11px] text-destructive">
                  {upload.error}{" "}
                  <button
                    onClick={() => removeUpload(upload.file)}
                    className="underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Dropzone ── */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`group cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            isDragActive
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-border hover:border-accent/50 hover:bg-muted/30"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div
              className={`rounded-full p-3 transition-colors ${
                isDragActive ? "bg-accent/10" : "bg-muted"
              }`}
            >
              {isDragActive ? (
                <ImagePlus className="h-6 w-6 text-accent" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-sans text-sm font-medium text-foreground">
                {isDragActive ? "Drop images here" : "Drag & drop images"}
              </p>
              <p className="mt-0.5 font-sans text-xs text-muted-foreground">
                or click to browse • JPG, PNG, WebP up to 10 MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Slot counter ── */}
      <p className="font-sans text-xs text-muted-foreground">
        {images.length}/{maxImages} images uploaded
      </p>
    </div>
  );
}
