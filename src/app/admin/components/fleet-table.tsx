"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  CarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { DbCar } from "@/data/cars";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=60";

const categoryColors: Record<string, string> = {
  luxury: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  suv: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  sedan: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  wedding: "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

interface FleetTableProps {
  cars: DbCar[];
  onAddCar: () => void;
  onEditCar: (car: DbCar) => void;
  onDeleteCar: (car: DbCar) => void;
}

export function FleetTable({
  cars,
  onAddCar,
  onEditCar,
  onDeleteCar,
}: FleetTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

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
              onClick={() => onEditCar(row.original)}
              className="text-muted-foreground hover:text-accent"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDeleteCar(row.original)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
        size: 80,
      },
    ],
    [onEditCar, onDeleteCar]
  );

  const table = useReactTable({
    data: cars,
    columns,
    state: { globalFilter, sorting },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide">
            Fleet Manager
          </h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} in the collection
          </p>
        </div>
        <Button
          onClick={onAddCar}
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
            onChange={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
            className="pl-10 font-sans"
          />
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {cars.length === 0 ? (
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
              onClick={onAddCar}
              className="rounded-full bg-accent font-sans text-sm font-semibold text-accent-foreground"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add First Car
            </Button>
          </div>
        ) : (
          <div>
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

            {/* ── Table Pagination Footer ── */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="font-sans text-xs text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()} ({table.getFilteredRowModel().rows.length} total cars)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="font-sans text-xs h-8 px-3"
                  >
                    <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="font-sans text-xs h-8 px-3"
                  >
                    Next
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
