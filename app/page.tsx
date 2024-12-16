// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "./context/user-context";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const { userData, loading } = useUser();

  useEffect(() => {
    // Wait for loading to complete
    if (loading) return;

    const token = localStorage.getItem("token");
    
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Get role from userData if available, otherwise from localStorage
    let role = userData?.role || localStorage.getItem("userRole");
    
    if (!role) {
      router.push("/auth/login");
      return;
    }

    const validRoles = ["superadmin", "hospital", "doctor", "researcher", "patient"];
    role = validRoles.includes(role) ? role : "patient";

    // Prevent infinite redirects
    if (pathname === `/role/${role}`) {
      return;
    }

    router.push(`/role/${role}`);
  }, [router, userData, pathname, loading]);

  return null;
}