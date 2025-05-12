import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function PieChartComponent({ data }) {
  // Transform the data dynamically
  const transformedData = data.map(item => {
    // Dynamically extract the first string and number values
    const name = Object.values(item).find(val => typeof val === 'string' && val !== item.color);
    const value = Object.values(item).find(val => typeof val === 'number');
    
    return { 
      name: name || 'Unknown', 
      value: value || 0, 
      color: item.color || '#000000' 
    };
  });
  
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsPieChart>
        <Pie
          data={transformedData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          innerRadius={0}
          paddingAngle={1}
          dataKey="value"
        >
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(value)} 
          labelFormatter={(label) => label}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export default PieChartComponent;