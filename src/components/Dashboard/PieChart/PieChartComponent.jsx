import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function PieChartComponent({ data }) {
  // Transform the data dynamically, finding the label and value keys
  console.log("PieChartComponent data:", data);
  
  const transformedData = data.map(item => {
    const valueObj = item.value;
    // Find the color key directly
    const color = valueObj.color;
    
    // Find the first key that's not "color" to use as category/name
    // and the first numeric value to use as the value
    let name = "";
    let value = 0;
    
    Object.entries(valueObj).forEach(([key, val]) => {
      if (key !== "color") {
        // If we haven't set a name yet, use this key's value as the name
        if (name === "" && typeof val === "string") {
          name = val;
        }
        // If we haven't set a value yet, use this key's value as the pie value
        // and it should be a number
        if (value === 0 && typeof val === "number") {
          value = val;
        }
      }
    });
    
    return { name, value, color };
  });
  
  console.log("Transformed data:", transformedData);
  
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