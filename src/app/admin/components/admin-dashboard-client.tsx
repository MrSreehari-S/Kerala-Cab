"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarFormDialog } from "./car-form-dialog";
import { DeleteDialog } from "./delete-dialog";
import { FleetTable } from "./fleet-table";
import { SettingsForm } from "./settings-form";
import { LayoutDashboard, LogOut, CarIcon, Settings } from "lucide-react";
import type { Car, DbCar } from "@/data/cars";

interface AdminDashboardClientProps {
  initialCars: DbCar[];
}

export function AdminDashboardClient({
  initialCars,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [cars, setCars] = useState<DbCar[]>(initialCars);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<DbCar | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCar, setDeletingCar] = useState<DbCar | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"fleet" | "settings">("fleet");

  // Refresh cars from API
  const refreshCars = useCallback(async () => {
    try {
      const res = await fetch("/api/cars");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCars(data);
    } catch (error) {
      toast.error("Failed to load cars");
      console.error(error);
    }
  }, []);

  // ── CRUD Handlers ──
  const handleSave = async (data: Partial<Car>) => {
    const isEditing = !!editingCar;
    const url = isEditing ? `/api/cars/${editingCar.id}` : "/api/cars";
    const method = isEditing ? "PUT" : "POST";

    // Optimistic update
    if (!isEditing) {
      const optimisticCar: DbCar = {
        ...data,
        id: `temp-${Date.now()}`,
        _id: `temp-${Date.now()}`,
      } as DbCar;
      setCars((prev) => [optimisticCar, ...prev]);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      toast.success(
        isEditing ? "Car updated successfully" : "Car added to fleet"
      );
      await refreshCars(); // Refresh with real data from server
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save car"
      );
      if (!isEditing) {
        // Rollback optimistic add
        setCars((prev) => prev.filter((c) => !c.id.startsWith("temp-")));
      }
      throw error; // Re-throw so dialog knows it failed
    }
  };

  const handleDelete = async () => {
    if (!deletingCar) return;
    setDeleteLoading(true);

    // Optimistic removal
    const previousCars = [...cars];
    setCars((prev) => prev.filter((c) => c.id !== deletingCar.id));

    try {
      const res = await fetch(`/api/cars/${deletingCar.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success(`${deletingCar.name} removed from fleet`);
      setDeleteOpen(false);
      setDeletingCar(null);
    } catch {
      toast.error("Failed to delete car");
      setCars(previousCars); // Rollback
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="section-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-accent" />
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.jpeg"
                alt="KeralaCabs Logo"
                width={100}
                height={33}
                className="h-8 w-auto object-contain rounded-md"
              />
            </Link>
            <Badge className="ml-2 border-accent/30 bg-accent/10 font-sans text-[10px] font-semibold text-accent">
              Admin
            </Badge>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="font-sans text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="section-container py-8">
        {/* ── Tabs Bar ── */}
        <div className="mb-8 flex gap-6 border-b border-border">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`flex items-center gap-2 pb-3 font-sans text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 ${
              activeTab === "fleet"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CarIcon className="h-4 w-4" />
            Fleet Manager
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 pb-3 font-sans text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 ${
              activeTab === "settings"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Account Settings
          </button>
        </div>

        {activeTab === "fleet" ? (
          <FleetTable
            cars={cars}
            onAddCar={() => {
              setEditingCar(null);
              setFormOpen(true);
            }}
            onEditCar={(car) => {
              setEditingCar(car);
              setFormOpen(true);
            }}
            onDeleteCar={(car) => {
              setDeletingCar(car);
              setDeleteOpen(true);
            }}
          />
        ) : (
          <SettingsForm onLogout={handleLogout} />
        )}
      </main>

      {/* ── Dialogs ── */}
      <CarFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCar(null);
        }}
        car={editingCar}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletingCar(null);
        }}
        carName={deletingCar?.name || ""}
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
