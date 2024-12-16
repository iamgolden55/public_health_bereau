// app/[role]/researcher/page.tsx
"use client";

export default function ResearcherDashboard() {
  return (
    <div>
      <h1>Research Portal</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>Research Projects</div>
        <div>Data Analytics</div>
        <div>Publications</div>
      </div>
    </div>
  );
}