"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarFormDialog } from "./components/car-form-dialog";
import { DeleteDialog } from "./components/delete-dialog";
import type { Car } from "@/data/cars";

/** Car record as returned by the MongoDB API (includes _id) */
type DbCar = Car & { _id?: string };
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Loader2,
  ArrowUpDown,
  CarIcon,
  LayoutDashboard,
  Settings,
  Key,
} from "lucide-react";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=60";

const categoryColors: Record<string, string> = {
  luxury: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  suv: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  sedan: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  wedding: "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [cars, setCars] = useState<DbCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<DbCar | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCar, setDeletingCar] = useState<DbCar | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"fleet" | "settings">("fleet");

  // Account Settings Form State
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Fetch cars
  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch("/api/cars");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCars(data);
    } catch (error) {
      toast.error("Failed to load cars");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
    // Retrieve email from user session if possible
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/cars"); // dummy call to verify api works, actually we can just look up standard email from local state or fetch profile info.
      } catch {}
    };
    fetchSession();
  }, [fetchCars]);

  // ── CRUD Handlers ──
  const handleSave = async (data: Partial<Car>) => {
    const isEditing = !!editingCar;
    const url = isEditing
      ? `/api/cars/${editingCar.id}`
      : "/api/cars";
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

      toast.success(isEditing ? "Car updated successfully" : "Car added to fleet");
      await fetchCars(); // Refresh with real data
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save car"
      );
      if (!isEditing) {
        // Rollback optimistic add
        setCars((prev) => prev.filter((c) => !c.id.startsWith("temp-")));
      }
      throw error; // Re-throw so the dialog knows it failed
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

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSettingsSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      toast.success("Settings updated! Logging out...");
      
      // Auto logout and redirect
      setTimeout(() => {
        handleLogout();
      }, 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile settings"
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Table Columns ──
  const columns: ColumnDef<DbCar>[] = useMemo(
    () => [
      {
        id: "image",
        header: "",
        cell: ({ row }) => {
          const img = row.original.images?.[0] || PLACEHOLDER_IMG;
          return (
            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image
                src={img}
                alt={row.original.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-sans text-xs font-semibold uppercase tracking-wider"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <span className="font-sans text-sm font-medium text-foreground">
              {row.original.name}
            </span>
            <p className="font-sans text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.tagline}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge
            className={`border font-sans text-[11px] capitalize ${
              categoryColors[row.original.category] || ""
            }`}
          >
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "pricePerDay",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 font-sans text-xs font-semibold uppercase tracking-wider"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price / Day
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-sans text-sm font-semibold">
            ₹{row.original.pricePerDay.toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "transmission",
        header: "Trans.",
        cell: ({ row }) => (
          <span className="font-sans text-xs text-muted-foreground">
            {row.original.transmission}
          </span>
        ),
      },
      {
        accessorKey: "seats",
        header: "Seats",
        cell: ({ row }) => (
          <span className="font-sans text-sm">{row.original.seats}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditingCar(row.original);
                setFormOpen(true);
              }}
              className="text-muted-foreground hover:text-accent"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setDeletingCar(row.original);
                setDeleteOpen(true);
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
        size: 80,
      },
    ],
    []
  );

  const table = useReactTable({
    data: cars,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
          <>
            {/* ── Page Header ── */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-wide">
                  Fleet Manager
                </h1>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  {cars.length} vehicles in the collection
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingCar(null);
                  setFormOpen(true);
                }}
                className="rounded-full bg-accent px-6 font-sans text-sm font-semibold text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Car
              </Button>
            </div>

        {/* ── Search Bar ── */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search fleet..."
              value={globalFilter}
              onChange={(e) =>
                setGlobalFilter((e.target as HTMLInputElement).value)
              }
              className="pl-10 font-sans"
            />
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <CarIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mb-1 font-serif text-xl font-semibold">
                No vehicles yet
              </h3>
              <p className="mb-4 font-sans text-sm text-muted-foreground">
                Add your first car to get started.
              </p>
              <Button
                onClick={() => {
                  setEditingCar(null);
                  setFormOpen(true);
                }}
                className="rounded-full bg-accent font-sans text-sm font-semibold text-accent-foreground"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add First Car
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-border bg-muted/30"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  <AnimatePresence>
                    {table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border/50 transition-colors hover:bg-muted/20"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl rounded-xl border border-border bg-card/60 p-8 backdrop-blur-xl"
          >
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold tracking-wide">
                Account Credentials
              </h2>
              <p className="mt-1 font-sans text-sm text-muted-foreground">
                Update your login email address and secure password.
              </p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  New Email Address (Optional)
                </label>
                <Input
                  type="email"
                  placeholder="Leave blank to keep current email"
                  value={newEmail}
                  onChange={(e) => setNewEmail((e.target as HTMLInputElement).value)}
                  className="font-sans"
                />
              </div>

              <div className="h-px bg-border my-2" />

              {/* Password */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
                  className="font-sans"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                  className="font-sans"
                />
              </div>

              <div className="h-px bg-border my-2" />

              {/* Current Password Verification */}
              <div className="space-y-1.5">
                <label className="font-sans text-xs font-medium uppercase tracking-wider text-accent font-semibold">
                  Verify Current Password *
                </label>
                <Input
                  type="password"
                  placeholder="Enter current password to save changes"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)}
                  className="font-sans border-accent/45 focus:border-accent"
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={settingsSaving}
                className="w-full rounded-full bg-accent py-3 font-sans text-sm font-semibold text-accent-foreground transition-all duration-300 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 h-auto"
              >
                {settingsSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes…
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </form>
          </motion.div>
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
