import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './SimilarWords.css'; 

const SimilarWordsChart = ({ userData }) => {
  const { similar_words } = userData;

  // Check if similar_words exists and has entries
  const hasSimilarWords = similar_words && similar_words.length > 0;

  // Format the data if similar_words exists
  const formattedData = hasSimilarWords
    ? similar_words.map((item) => ({
        word: item.word,
        count: item.count,
      }))
    : [];

  return (
    <div className="similar-words-container">
      <h3 className="similar-words-title">Similar Words Frequency</h3>

      {hasSimilarWords ? (
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
              <Bar dataKey="count" barSize={30} fill="#8884d8" /> {/* Use a single color here */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>No similar words found!</p>
      )}
    </div>
  );
};

export default SimilarWordsChart;
