import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Admin Panel — KeralaCabs",
  description: "KeralaCabs fleet management dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {children}
      <Toaster
        position="top-right"
        toastOptions={{ className: "font-sans" }}
        richColors
        theme="dark"
      />
    </div>
  );
}
