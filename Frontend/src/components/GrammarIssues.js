import React from 'react';
import './GrammarIssues.css'; 
import { FaExclamationCircle, FaFileAlt } from 'react-icons/fa'; 
import Slider from 'react-slick'; 

const GrammarIssues = ({ userData }) => {
  const { grammar } = userData;


  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="grammar-issues-container">
      <h3 className="grammar-issues-title">Grammar Issues</h3>

      <Slider {...sliderSettings} className="grammar-issues-slider">
        {grammar.map((issue, index) => (
          <div key={index} className="grammar-issue-item">
            <div className="issue-icon">
              <FaExclamationCircle size={20} color="#d9534f" /> 
            </div>
            <p className="sentence-label"><strong>Issue:</strong></p>
            <p className="issue-title">{issue.Message}</p>

            <div className="context-section">
              <div className="context-icon">
                <FaFileAlt size={20} color="#5bc0de" /> 
              </div>
              <p className="sentence-label"><strong>Issue found in text:</strong></p>
              <div className="issue-details">
                <p>{issue["Context in Text"]}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default GrammarIssues;
