import React from 'react';
import './RepeatedSentences.css'; 

const RepeatedSentences = ({ userData }) => {
  const { repeat_sentences } = userData;

  return (
    <div className="repeated-sentences-container">
      <h3 className="repeated-sentences-title">Repeated Sentences</h3>

      <div className="repeated-sentences-list">
        {repeat_sentences.map((item, index) => (
          <div key={index} className="repeated-sentence-item">
            <div className="sentence-block">
              <p className="sentence-label">Sentence 1:</p>
              <p className="sentence-text">{item.sentence1}</p>
            </div>
            <div className="sentence-block">
              <p className="sentence-label">Sentence 2:</p>
              <p className="sentence-text">{item.sentence2}</p>
            </div>
            <p className="similarity-score">Similarity Score: {Number(item.similarity_score).toFixed(3)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepeatedSentences;
