// app/[role]/superadmin/page.tsx
"use client";

export default function SuperAdminDashboard() {
  return (
    <div>
      <h1>PHB Platform Administration</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>Hospital Management</div>
        <div>Platform Analytics</div>
        <div>System Settings</div>
      </div>
    </div>
  );
}