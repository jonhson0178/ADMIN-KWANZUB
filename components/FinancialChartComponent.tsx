
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ChartType = 'line' | 'bar' | 'pie';

interface FinancialChartComponentProps {
  type: ChartType;
  data: any[];
  title: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const FinancialChartComponent: React.FC<FinancialChartComponentProps> = ({ type, data, title }) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis dataKey="name" stroke="#a0aec0" />
            <YAxis stroke="#a0aec0" />
            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
            <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis type="number" stroke="#a0aec0" />
            <YAxis type="category" dataKey="name" stroke="#a0aec0" width={100} tick={{fontSize: 12}}/>
            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} cursor={{fill: '#4a5568'}}/>
            <Legend />
            <Bar dataKey="commission" fill="#8884d8" name="Commission" />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} />
            <Legend />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-kwanzub-dark rounded-lg shadow-lg h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialChartComponent;
