import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    results: [
      {
        id: "1",
        title: "Advanced Battle Management System Support (USAF)",
        agency: "Department of the Air Force",
        responseDate: "2026-01-14"
      },
      {
        id: "2",
        title: "AI/ML Transformation and Mission Automation",
        agency: "Department of Defense",
        responseDate: "2026-02-01"
      },
      {
        id: "3",
        title: "Cyber Defense Analytics Platform Modernization",
        agency: "DISA",
        responseDate: "2026-01-10"
      },
      {
        id: "4",
        title: "Predictive Maintenance for Aviation Fleet",
        agency: "USAF",
        responseDate: "2026-01-30"
      },
      {
        id: "5",
        title: "Enterprise Data and Analytics Support Services",
        agency: "US Army PEO EIS",
        responseDate: "2026-02-01"
      },
      {
        id: "6",
        title: "Next-Gen Logistics Optimization",
        agency: "USTRANSCOM",
        responseDate: "2026-01-18"
      },
      {
        id: "7",
        title: "Command and Control Modernization",
        agency: "USN",
        responseDate: "2026-02-12"
      },
      {
        id: "8",
        title: "Secure Cloud Migration for Legacy Systems",
        agency: "USMC",
        responseDate: "2026-01-25"
      },
      {
        id: "9",
        title: "Integrated Training Simulation Environment",
        agency: "USSF",
        responseDate: "2026-02-05"
      },
      {
        id: "10",
        title: "AI-Driven Threat Detection and Response",
        agency: "NSA",
        responseDate: "2026-01-28"
      }
    ]
  });
}
