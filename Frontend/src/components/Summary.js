import React from 'react';


const Summary = ({ userData }) => {
  const { User, Date, wpm } = userData;

  return (
    <div className="summary">
      <h3>Summary</h3>
      <p><strong>User:</strong> {User}</p>
      <p><strong>Total Time Spent:</strong> {Math.floor(wpm.duration_seconds / 60)}:{String(Math.floor(wpm.duration_seconds % 60)).padStart(2, '0')}</p>
      <p><strong>Slides Rehearsed:</strong> 12</p> 
      <p><strong>Date:</strong> {Date}</p>
    </div>
  );
};

export default Summary;
