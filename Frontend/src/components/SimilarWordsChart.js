import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './SimilarWords.css'; 

const SimilarWordsChart = ({ userData }) => {
  const { similar_words } = userData;


  const barColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57'];


  const formattedData = similar_words.map((item, index) => ({
    word: item.word,
    count: item.count,
    fill: barColors[index % barColors.length], 
  }));

  return (
    <div className="similar-words-container">
      <h3 className="similar-words-title">Similar Words Frequency</h3>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="word" tick={{ fill: '#555', fontSize: 12 }} />
            <YAxis tick={{ fill: '#555', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: 'none', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }} 
              itemStyle={{ color: '#8884d8' }} 
            />
            <Bar
              dataKey="count"
              barSize={30}
            >
              {
 
                formattedData.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="count" fill={entry.fill} />
                ))
              }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimilarWordsChart;
