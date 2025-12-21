"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export function DonutChart({ pending = 92, approved = 0 }: { pending?: number; approved?: number }) {
  const data = {
    labels: ["รอดำเนิน", "อนุมัติ"],
    datasets: [
      {
        data: [pending, approved],
        backgroundColor: ["#f59e0b", "#10b981"],
        hoverBackgroundColor: ["#fbbf24", "#34d399"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  return <Doughnut data={data} options={options as any} />;
}

export function TopCentersBar() {
  const labels = ["ศูนย์ A", "ศูนย์ B", "ศูนย์ C", "ศูนย์ D", "ศูนย์ E"];
  const data = {
    labels,
    datasets: [
      {
        label: "จำนวนสิ่งของ",
        data: [120, 98, 76, 45, 30],
        backgroundColor: "#60a5fa",
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
    maintainAspectRatio: false,
  };

  return <Bar data={data} options={options as any} />;
}

export default function DashboardCharts() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <div style={{ height: 180 }}>
        <TopCentersBar />
      </div>
      <div style={{ height: 180 }}>
        <DonutChart />
      </div>
    </div>
  );
}
