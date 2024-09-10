import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import Config from '../Config';
import AuthContext from './AuthContext';

function HomePage() {
  const [questions, setQuestions] = useState([]);
  const { authTokens, user } = useContext(AuthContext);
  const [difficultyValues, setDifficultyValues] = useState([]);

  useEffect(() => {
    const fetchQuestionsAndRatings = async () => {
      try {
        const response = await fetch(`${Config.baseURL}/api/questions/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setQuestions(data);

          const ratingsPromises = data.map(question =>
            fetch(`${Config.baseURL}/api/get_ratings/${question.id}/${user.user_id}/`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authTokens?.access}`
              },
            }).then(res => res.ok ? res.json() : null)
          );

          const ratings = await Promise.all(ratingsPromises);
          setDifficultyValues(ratings.map(rating => rating ? rating.rating : 1));
        } else {
          console.error('Failed to fetch questions:', response.status);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestionsAndRatings();
  }, [authTokens, user]);

  const handleDifficultyChange = async (index, value) => {
    const questionId = questions[index].id;
    const newValues = [...difficultyValues];
    newValues[index] = value;
    setDifficultyValues(newValues);

    try {
      const ratingResponse = await fetch(`${Config.baseURL}/api/add-rating/${questionId}/${user.user_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authTokens?.access}`
        },
        body: JSON.stringify({ rating: parseFloat(value) }),  // Ensure rating is a float
      });

      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        // Optionally handle response
      } else {
        console.error('Error updating rating:', ratingResponse.status);
      }
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Questions</h1>
        <table className="questions-table">
          <thead>
            <tr>
              <th>QNo.</th>
              <th>Question Name</th>
              <th>Subject</th>
              <th>Topic</th>
              <th>Correct Answer</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={question.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{index + 1}</td>
                <td>
                  <Link to={`/question/${question.id}`}>{question.question_name}</Link>
                </td>
                <td>{question.subject}</td>
                <td>{question.topic}</td>
                <td>{question.correct_option}</td>
                <td>
                  <div className="difficulty-meter">
                    <input
                      type="range"
                      min="0.1"
                      max="10.0"
                      step="0.1"
                      className="difficulty-input"
                      value={difficultyValues[index]}
                      onChange={(e) => handleDifficultyChange(index, parseFloat(e.target.value))}
                    />
                    <span className="difficulty-number">{difficultyValues[index]}</span>
                  </div>
                </td>
                <td className="actions-cell">
                  <Link to={`/comments/${question.id}`}>
                    <button className="comment-button">Comment</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HomePage;
