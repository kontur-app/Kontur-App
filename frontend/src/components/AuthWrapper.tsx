"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push("/login");
    }
  }, [loading, user, isPublic, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F3EFE6" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-3 animate-pulse"
            style={{ backgroundColor: "#7FE0F5", color: "#1B2A6B" }}
          >
            K
          </div>
          <p className="text-sm" style={{ color: "#1B2A6B", opacity: 0.5 }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublic) return null;

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </main>
    </>
  );
}
