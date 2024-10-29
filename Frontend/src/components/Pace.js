import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import './Pace.css'; 

const Pace = ({ userData }) => {
  const { wpm = 0 } = userData;

  const maxWPM = 200;



  const getPaceColor = () => {
    if (wpm.wpm > 120) return '#FF4E42';  // Red for fast pace
    if (wpm.wpm < 110) return '#FFD700';  // Yellow for slow pace
    return '#82ca9d';                     // Green for balanced pace
  };

  const paceColor = getPaceColor();


  const data = [
    {
      name: 'Pace',
      value: Math.min(wpm.wpm, maxWPM), 
      fill: paceColor,
    },
  ];

  return (
    <div className="pace-container" >
      <h3 className="pace-title">Pace</h3>
      
      {/* Container for the semi-circle gauge */}
      <div className="radial-bar-container" >
        <ResponsiveContainer>
            
          <RadialBarChart
            cx="50%"
            cy="70%"
            innerRadius="100%"
            outerRadius="100%"
            barSize={30}
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <text
              x="10%"
              y="65%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="radial-bar-custom-label"
            >
              slow
            </text>
            <text
              x="30%"
              y="10%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="radial-bar-custom-label"
            >
              100
            </text>
            <text
              x="70%"
              y="10%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="radial-bar-custom-label"
            >
              150
            </text>
            <text
              x="90%"
              y="65%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="radial-bar-custom-label"
            >
              fast
            </text>
            <PolarAngleAxis
              type="number"
              domain={[0, maxWPM]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
            
            {/* Display the WPM in the center of the gauge */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="radial-bar-value"
            >
              {Math.round(wpm.wpm)}
            </text>
            <text
              x="50%"
              y="70%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="radial-bar-label"
            >
              words/min
            </text>


            
          </RadialBarChart>
        </ResponsiveContainer>
      </div>


      <div className="pace-details">
        <p>Duration: {wpm.duration_seconds.toFixed(2)} seconds</p>
        <p>Word Count: {wpm.word_count}</p>
        <p className={`pace-feedback ${wpm.wpm > 120 ? 'fast' : wpm.wpm < 110 ? 'slow' : 'balanced'}`}>
          Your pace is {wpm.wpm> 120 ? "too fast" : wpm.wpm< 110 ? "a bit slow" : "just right"}. Keep it up!
        </p>
      </div>
    </div>
  );
};

export default Pace;
