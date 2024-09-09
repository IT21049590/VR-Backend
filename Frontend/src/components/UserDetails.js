// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Summary from './Summary';
// import Pace from './Pace';
// import Fillers from './Fillers';
// import SensitivePhrases from './SensitivePhrases';
// import Transcription from './Transcription';
// import SimilarWordsChart from './SimilarWordsChart';
// import RepeatedSentences from './RepeatedSentences';
// import GrammarIssues from './GrammarIssues';

// const UserDetails = () => {
//   const { state } = useLocation();
//   const { user } = state || {}; // Access the user data passed via navigate
//   const navigate = useNavigate();

//   if (!user) {
//     return <p>No user selected</p>;
//   }

//   return (
//     <div className="user-details-container">

//       <div className="upper-section">
//         <Summary userData={user} />
//       </div>

//       <div className="middle-section">
//         <Pace userData={user} />
//         <div className="section">
//           <SensitivePhrases userData={user} />
//           <Transcription userData={user} />
//         </div>
//         <Fillers userData={user} />
//       </div>

//       <div className="middle-section">
//         <RepeatedSentences userData={user} />
//         <div className="section">
//           <SimilarWordsChart userData={user} />
//           <GrammarIssues userData={user} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDetails;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Summary from './Summary';
import Pace from './Pace';
import Fillers from './Fillers';
import SensitivePhrases from './SensitivePhrases';
import Transcription from './Transcription';
import SimilarWordsChart from './SimilarWordsChart';
import RepeatedSentences from './RepeatedSentences';
import GrammarIssues from './GrammarIssues';
import './styles.css'; 

const UserDetails = () => {
  const { state } = useLocation();
  const { user } = state || {};
  const [isListening, setIsListening] = useState(true);

  useEffect(() => {
    if (user) {
      
      setTimeout(() => {
        setIsListening(false); 
      }, 2000);
    }
  }, [user]);

  if (isListening) {
    return (
      <div class="voice-container">
      <div class="voice-animation">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
    </div>
    );
  }

  if (!user) {
    return <p>No user selected</p>;
  }

  return (
    <div className="user-details-container">
      <div className="upper-section">
        <Summary userData={user} />
      </div>
      <div className="middle-section">
        <Pace userData={user} />
        <div className="section">
          <SensitivePhrases userData={user} />
          <Transcription userData={user} />
        </div>
        <Fillers userData={user} />
      </div>
      <div className="middle-section">
        <RepeatedSentences userData={user} />
        <div className="section">
          <SimilarWordsChart userData={user} />
          <GrammarIssues userData={user} />
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
