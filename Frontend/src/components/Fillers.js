import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Fillers.css';

const Fillers = ({ userData }) => {
  const { filler_words_count } = userData;

  // Check if filler_words_count exists and has at least one count greater than zero
  const hasFillerData = filler_words_count && Object.values(filler_words_count).some(count => count > 0);

  // Prepare data for the Pie chart if filler_words_count is available
  const data = hasFillerData
    ? Object.entries(filler_words_count).map(([word, count]) => ({
        name: word,
        value: count,
      }))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF6699', '#33CCFF'];

  return (
    <div className="fillers">
      <h3>Fillers</h3>
      <p>To sound more polished and confident, avoid filler words like:</p>

      {hasFillerData ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>No filler words detected!</p>
      )}
    </div>
  );
};

export default Fillers;
