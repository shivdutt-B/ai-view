import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { ReportData } from './types';

interface PerformanceChartProps {
  reportData: ReportData;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ reportData }) => {
  const chartData = [
    { name: 'Technical', value: reportData.technicalKnowledge, color: '#10B981' },
    { name: 'Communication', value: reportData.communicationSkills, color: '#3B82F6' },
    { name: 'Attitude', value: reportData.attitude, color: '#8B5CF6' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-700 font-medium">{`${label}: ${payload[0].value}/100`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg h-full">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Performance Breakdown</h3>
            <p className="text-gray-600 text-sm">Skills analysis overview</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]}
                fill="#3B82F6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
