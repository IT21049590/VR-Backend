import React from "react";
import "./Transcription.css";

const Transcription = ({ userData }) => {
  const { transcription_text } = userData;

  return (
    <div className="transcription-container">
      <h3 className="transcription-title">Transcription Text</h3>
      {transcription_text && transcription_text.transcription_text ? (
        <p className="transcription-text">
          {transcription_text.transcription_text}
        </p>
      ) : (
        <p className="transcription-text">No transcription available</p>
      )}
    </div>
  );
};

export default Transcription;
