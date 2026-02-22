
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyData } from '../types';

interface ChartComponentProps {
    data: MonthlyData[];
    dataKey: keyof MonthlyData;
    secondaryDataKey?: keyof MonthlyData;
    legend1: string;
    legend2?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, dataKey, secondaryDataKey, legend1, legend2 }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="name" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#2d3748',
                        border: '1px solid #4a5568',
                        color: '#e2e8f0',
                    }}
                />
                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                <Line type="monotone" dataKey={dataKey} stroke="#8884d8" activeDot={{ r: 8 }} name={legend1} />
                {secondaryDataKey && <Line type="monotone" dataKey={secondaryDataKey} stroke="#82ca9d" name={legend2}/>}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
