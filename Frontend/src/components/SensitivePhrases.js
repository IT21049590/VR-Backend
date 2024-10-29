import React from "react";

const SensitivePhrases = ({ userData }) => {
  const { silences } = userData;

  return (
    <div className="sensitive-phrases">
      <h3>Silence Phrases</h3>
      {silences && silences.message ? (
        <p>{silences.message}</p>
      ) : (
        <p>No silences detected</p>
      )}
    </div>
  );
};

export default SensitivePhrases;
