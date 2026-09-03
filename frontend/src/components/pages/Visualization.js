import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import readings from "../../data/sensorReadings.json";

// Recorded field data from the chilli deployment. The node published live to
// ThingSpeak while it ran; that channel has since been retired, so these charts
// replay the logged readings instead of embedding a dashboard that no longer
// resolves.
const CHARTS = [
  { key: "soilTemp", label: "Soil Temperature", unit: "°C",    color: "#d62020" },
  { key: "airTemp",  label: "Air Temperature",  unit: "°C",    color: "#e07b00" },
  { key: "humidity", label: "Air Humidity",     unit: "%",     color: "#006b6b" },
  { key: "moisture", label: "Soil Moisture",    unit: "%",     color: "#0066cc" },
  { key: "n",        label: "Nitrogen",         unit: "mg/kg", color: "#2e7d32" },
  { key: "p",        label: "Phosphorus",       unit: "mg/kg", color: "#7b1fa2" },
  { key: "k",        label: "Potassium",        unit: "mg/kg", color: "#c2185b" },
];

const SensorChart = ({ label, unit, color, dataKey }) => (
  <div className="bg-white p-4 rounded-lg shadow-md w-full">
    <h3 className="text-left text-sm font-semibold text-gray-700 mb-3">
      {label} <span className="font-normal text-gray-400">({unit})</span>
    </h3>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={readings} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="t" tick={{ fontSize: 11 }} stroke="#999"
               label={{ value: "reading #", position: "insideBottom", offset: -2,
                        style: { fontSize: 11, fill: "#999" } }} />
        <YAxis tick={{ fontSize: 11 }} stroke="#999" domain={["auto", "auto"]} />
        <Tooltip formatter={(v) => [`${v} ${unit}`, label]}
                 labelFormatter={(t) => `Reading ${t}`} />
        <Line type="monotone" dataKey={dataKey} stroke={color}
              strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const Visualization = () => (
  <div className="text-center p-6 bg-gray-100 min-h-screen py-14">
    <h1 className="text-4xl font-bold text-gray-800 mb-4 text-primary">
      Data Visualization and Insights
    </h1>
    <p className="text-gray-600 max-w-2xl mx-auto mb-3">
      Readings logged by the solar-powered sensor node during the chilli
      deployment — soil nutrients, moisture and climate across
      {" "}{readings.length} samples.
    </p>
    <p className="text-gray-500 text-sm max-w-2xl mx-auto mb-8">
      The node published live to a ThingSpeak channel while deployed. That
      channel has since been retired, so these charts replay the recorded field
      data.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {CHARTS.map((c) => (
        <SensorChart key={c.key} dataKey={c.key} {...c} />
      ))}
    </div>
  </div>
);

export default Visualization;
