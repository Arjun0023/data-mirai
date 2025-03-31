import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function PieChartComponent({ data }) {
  // Transform the data to extract information from the 'value' property
  const transformedData = data.map(item => ({
    name: item.value.category, // Use category as the name
    value: item.value.value, // Use the value from the nested value object
    color: item.value.color // Use the color from the nested value object
  }));

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