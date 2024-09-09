import React from 'react';

const SensitivePhrases = ({ userData }) => {
  const { silences } = userData;

  return (
    <div className="sensitive-phrases">
      <h3>Silence Phrases</h3>
      <p>{silences.message}</p>
    </div>
  );
};

export default SensitivePhrases;
