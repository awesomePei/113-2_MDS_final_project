import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';

interface Props {
  filename: string;
}

const Dashboard: React.FC<Props> = ({ filename }) => {
  const [delayByCategory, setDelayByCategory] = useState<Record<string, number>>({});
  const [shipmentOverview, setShipmentOverview] = useState<{ name: string; value: number }[]>([]);
  const [featureImportance, setFeatureImportance] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`http://localhost:5001/api/dashboard/${filename}`)
      .then((res) => res.json())
      .then((data) => {
        setDelayByCategory(data.delayByCategory);
        setShipmentOverview([
          { name: 'On Time', value: data.shipmentOverview['On Time'] || 0 },
          { name: 'Late', value: data.shipmentOverview['Late'] || 0 },
        ]);
        
        // Sort featureImportance by value in descending order (highest first)
        const sortedFeatureImportance = Object.entries(data.featureImportance)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .reduce((obj: Record<string, number>, [key, value]) => {
            obj[key] = value as number;
            return obj;
          }, {});
        
        setFeatureImportance(sortedFeatureImportance);
      })
      .catch((err) => console.error('Dashboard fetch error:', err));
  }, [filename]);

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {/* Card 1: Delays by Category */}
      <div className="glass-card h-[320px]">
        <h2 className="text-lg font-semibold mb-2 text-white">Delays by Category</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={Object.entries(delayByCategory).map(([name, value]) => ({
              name,
              value: +(value * 100).toFixed(1),
            }))}
            margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Card 2: Shipment Delay Overview */}
      <div className="glass-card h-[320px]">
        <h2 className="text-lg font-semibold mb-2 text-white">Shipment Delay Overview</h2>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={shipmentOverview}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
              {shipmentOverview.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Card 3: Feature Importance */}
      <div className="glass-card h-[320px]">
        <h2 className="text-lg font-semibold mb-2 text-white">Feature Importance</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={Object.entries(featureImportance).map(([name, value]) => ({
              name,
              value: +(value * 100).toFixed(1),
            }))}
            margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={80} />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;