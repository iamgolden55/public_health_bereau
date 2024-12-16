'use client'

import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { Heart, Activity, Pill, Zap } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Progress } from "@/components/ui/progress"
import { useUser } from '@/app/context/user-context'


const healthRhythmData = [
  { time: 'M', heartRate: 62, bloodPressure: 110, sleep: 90 },
  { time: 'T', heartRate: 58, bloodPressure: 105, sleep: 85 },
  { time: 'W', heartRate: 70, bloodPressure: 115, sleep: 60 },
  { time: 'T', heartRate: 80, bloodPressure: 120, sleep: 20 },
  { time: 'F', heartRate: 75, bloodPressure: 118, sleep: 10 },
  { time: 'S', heartRate: 72, bloodPressure: 115, sleep: 15 },
  { time: 'S', heartRate: 68, bloodPressure: 112, sleep: 40 },
]

// Function to evaluate blood pressure status
function evaluateBloodPressure(systolic: number, diastolic: number): string {
  if (systolic < 120 && diastolic < 80) return "Good";
  if ((systolic >= 120 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) return "Take Rest";
  if (systolic >= 140 || diastolic >= 90) return "Critical";
  if (systolic >= 180 || diastolic >= 120) return "See a Doctor Immediately";
  return "Unknown";
}

// HealthRhythmCard Component
export function HealthRhythmCard() {
  const { userData, loading } = useUser(); // Assume `loading` state is provided by context

  if (loading || !userData) {
    return (
      <Card className="w-full max-w-sm bg-white shadow-lg rounded-3xl">
        <CardContent className="p-4 space-y-4">
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Dynamically calculate health metrics
  const healthMetrics = [
    {
      name: 'Avg Heart Rate',
      value: userData?.medical_records?.length > 0
        ? Math.round(userData.medical_records.reduce((sum, record) => sum + (record.vital_signs.heart_rate || 0), 0) / userData.medical_records.length)
        : "No Data", // Handle missing data
      unit: 'BPM',
    },
    {
      name: 'Avg Blood Pressure',
      value: userData?.medical_records?.length > 0
        ? Math.round(
            userData.medical_records.reduce((sum, record) => {
              const [systolic, diastolic] = (record.vital_signs.blood_pressure || "0/0").split('/').map(Number);
              return sum + (systolic + diastolic) / 2;
            }, 0) / userData.medical_records.length
          )
        : "No Data", // Handle missing data
      unit: 'mmHg',
    },
    {
      name: 'Avg Sleep',
      value: userData?.medical_records?.length > 0
        ? (
            userData.medical_records.reduce((sum, record) => sum + (record.vital_signs.sleep_hours || 0), 0) / userData.medical_records.length
          ).toFixed(1)
        : "No Data", // Handle missing data
      unit: 'hours',
    },
  ];

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-3xl">
      <CardContent className="p-4 space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold">Health Rhythm</h2>
          </div>
          {userData?.medical_records?.map(record => {
            const bloodPressure = record.vital_signs.blood_pressure || "0/0";
            const [systolic, diastolic] = bloodPressure.split('/').map(Number);
            const bloodPressureStatus = evaluateBloodPressure(systolic, diastolic);

            return (
              <div key={record.id}>
                <div className="flex items-center space-x-2 bg-blue-50 px-2 py-1 rounded-full">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold">{bloodPressure} mmHg</span>
                  <span
                    className={`text-xs italic ${
                      bloodPressureStatus === "Critical" || bloodPressureStatus === "See a Doctor Immediately"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    ({bloodPressureStatus})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Section */}
        <div className="space-y-1">
  <div className="flex items-baseline justify-between">
    <span
      className={`text-xl font-bold ${
        userData?.medical_records?.some(record => {
          const [systolic, diastolic] = (record.vital_signs.blood_pressure || "0/0").split('/').map(Number);
          return systolic >= 140 || diastolic >= 90;
        })
          ? "text-red-500" // Critical
          : "text-gray-800" // Normal
      }`}
    >
      {userData?.medical_records?.length > 0
        ? userData.medical_records.map(record => {
            const bloodPressure = record.vital_signs.blood_pressure || "0/0";
            const [systolic, diastolic] = bloodPressure.split('/').map(Number);
            const status = evaluateBloodPressure(systolic, diastolic);
            return status;
          }).join(", ")
        : "No Data"}
    </span>
    <span className="text-xs text-gray-500">Overall Health Status</span>
  </div>
  <Progress
    value={
      userData?.medical_records?.length > 0
        ? Math.min(
            Math.round(
              (userData.medical_records.reduce((sum, record) => {
                const [systolic, diastolic] = record.vital_signs.blood_pressure.split('/').map(Number);
                return sum + (systolic + diastolic) / 2;
              }, 0) / userData.medical_records.length) / 2
            ),
            100
          )
        : 0
    }
    className="h-1.5 bg-gray-200"
  />
</div>

        {/* Bar Chart Section */}
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthRhythmData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
              />
              <YAxis hide />
              <Bar dataKey="heartRate" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="bloodPressure" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="sleep" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Health Metrics Section */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {healthMetrics.map(metric => (
            <div key={metric.name}>
              <div className="text-sm font-semibold">{metric.value}{metric.unit}</div>
              <div className="text-gray-500 text-[10px]">{metric.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const medications = [
  { name: "Lisinopril", efficacy: 85, sideEffects: 15, adherence: 95 },
  { name: "Metformin", efficacy: 78, sideEffects: 22, adherence: 88 },
]

export function MedicationEfficacyCard() {
  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-3xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-green-500" />
            <h2 className="text-base font-semibold">Medication Efficacy</h2>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-full">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold">85% Overall</span>
          </div>
        </div>

        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{med.name}</span>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs">{med.efficacy}% Effective</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${med.efficacy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Efficacy</span>
                    <span>{med.efficacy}%</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${med.sideEffects}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Side Effects</span>
                    <span>{med.sideEffects}%</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${med.adherence}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Adherence</span>
                    <span>{med.adherence}%</span>
                  </div>
                  
                </div>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-gray-400">
          By clicking "Next," you confirm your intention to connect your app to Tradie API. This
          action signifies you accept of the <Link href="#" className="text-blue-500">Terms and conditions</Link> outlined.
        </p>
        </div>
      </CardContent>
    </Card>
  )
}