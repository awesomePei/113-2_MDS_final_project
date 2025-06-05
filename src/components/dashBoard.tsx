import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  filename: string;
}

interface DashboardData {
  delayByCategory: Record<string, number>;
  shipmentOverview: {
    'On Time': number;
    'Late': number;
  };
  featureImportance: Record<string, number>;
}

const Dashboard: React.FC<Props> = ({ filename }) => {
  // const [delayByCategory, setDelayByCategory] = useState<Record<string, number>>({});
  // const [shipmentOverview, setShipmentOverview] = useState<{ name: string; value: number }[]>([]);
  const [featureImportance, setFeatureImportance] = useState<Record<string, number>>({});
  console.log(featureImportance)
  useEffect(() => {
    fetch(`http://localhost:5001/api/dashboard/${filename}`)
      .then((res) => res.json())
      .then((data: DashboardData) => {
        // setDelayByCategory(data.delayByCategory);

        // setShipmentOverview([
        //   { name: 'On Time', value: data.shipmentOverview['On Time'] || 0 },
        //   { name: 'Late', value: data.shipmentOverview['Late'] || 0 },
        // ]);

        const sortedFeatureImportance = (Object.entries(data.featureImportance) as [string, number][])
          .sort(([, a], [, b]) => b - a)
          .reduce((obj: Record<string, number>, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {});

        setFeatureImportance(sortedFeatureImportance);
      })
      .catch((err) => console.error('Dashboard fetch error:', err));
  }, [filename]);

  const COLORS = ['#00C49F', '#FF8042'];

  return (
      <div className="glass-card w-full mb-2 h-[360px]">
        <h2 className="text-lg font-semibold mb-2 text-black">Feature Importance</h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={Object.entries(featureImportance).map(([name, value]) => ({
              name,
              value: +(value * 100).toFixed(1),
            }))}
            margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={80} tick={{ fontSize: 10, fill: '#333' }}
 />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
};

export default Dashboard;
