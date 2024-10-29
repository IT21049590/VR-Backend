// import React, { useEffect, useState } from 'react';
// import Summary from './components/Summary';
// import Pace from './components/Pace';
// import Fillers from './components/Fillers';
// import SensitivePhrases from './components/SensitivePhrases';
// import Transcription from './components/Transcription';
// import SimilarWordsChart from './components/SimilarWordsChart';
// import RepeatedSentences from './components/RepeatedSentences';
// import GrammarIssues from './components/GrammarIssues'; // Import the component
// import './App.css';

// const App = () => {
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     // Fetch user data (replace the URL with your actual API endpoint)
//     fetch('http://localhost:3000/user/hiruna@gmail.com')
//       .then((response) => response.json())
//       .then((data) => setUserData(data))
//       .catch((error) => console.log(error));
//   }, []);

//   return (
//     <div className="app-container">
//       {userData ? (
//         <>
//         <div className="upper-section">
//         <Summary userData={userData} />
//         </div>

//           <div className="middle-section">

//             <Pace userData={userData} />
//             <div className="section">
//             <SensitivePhrases userData={userData} />
//             <Transcription userData={userData}/>
//           </div>
//           <Fillers userData={userData} />
//           </div>

//           <div className="middle-section">
//           <RepeatedSentences userData={userData} />

//           <div className="section">
//           <SimilarWordsChart userData={userData}/>
//           <GrammarIssues userData={userData} />
//           </div>
//           </div>
//         </>
//       ) : (
//         <p>Loading...</p>
//       )}
//     </div>
//   );
// };

// export default App;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import "./App.css";

const App = () => {
  const [userObjects, setUserObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      fetch("http://35.223.130.187:4000/users/hiruna@gmail.com")
        .then((response) => response.json())
        .then((data) => {
          setUserObjects(data);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
        });
    }, 1000);
  }, []);

  const handleCardClick = (user) => {
    navigate("/user-details", { state: { user } });
  };

  return (
    <div className="app-container">
      {loading ? (
        <div className="loading-container">
          <ClipLoader color="#36d7b7" size={150} />
        </div>
      ) : (
        <div className="card-container">
          {userObjects.map((user, index) => (
            <div
              key={index}
              className="user-card"
              onClick={() => handleCardClick(user)}
            >
              <div className="user-email">
                <p>Attempt {index + 1}</p>
              </div>
              <div className="card-content">
                <p>
                  <strong>Date:</strong> {user.Date}
                </p>
                <p>
                  <strong>Total time spent:</strong>{" "}
                  {Math.floor(user.wpm.duration_seconds / 60)}:
                  {Math.floor(user.wpm.duration_seconds % 60)}
                </p>
                <p>
                  <strong>Slides rehearsed:</strong> 12
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
