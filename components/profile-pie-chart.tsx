"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Item = {
  label: string;
  score: number;
};

const COLORS = ["#95b8ff", "#d5e2ff", "#9ce6d8", "#f5d492", "#f0b1c6"];

export function ProfilePieChart({ data }: { data: Item[] }) {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="score"
            nameKey="label"
            innerRadius={70}
            outerRadius={105}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
