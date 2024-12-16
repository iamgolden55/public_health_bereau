// app/[role]/hospital/page.tsx
"use client";

export default function HospitalDashboard() {
  return (
    <div>
      <h1>Hospital Management</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>Staff Management</div>
        <div>Patient Records</div>
        <div>Hospital Analytics</div>
      </div>
    </div>
  );
}