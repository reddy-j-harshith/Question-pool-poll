import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './QuestionPage.css';
import Config from '../Config';
import AuthContext from './AuthContext';

function QuestionPage() {
  const { id } = useParams(); // Get the question ID from the URL
  const [questionData, setQuestionData] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(10); // Replace with actual total question count from backend
  const navigate = useNavigate();
 const { authTokens } = useContext(AuthContext);

  // Fetch the question data based on ID
  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        const response = await fetch(`${Config.baseURL}/api/question/${id}/`, { // Updated URL
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens?.access}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setQuestionData(data);
        } else {
          console.error('Failed to fetch question data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching question data:', error);
      }
    };

    // Fetch total questions count for navigation
    const fetchTotalQuestions = async () => {
      try {
        const response = await fetch(`${Config.baseURL}/api/questions/`, { // Updated URL
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include your authorization header if needed
            // 'Authorization': `Bearer ${yourToken}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTotalQuestions(data.length); // Assuming data is an array of questions
        } else {
          console.error('Failed to fetch total questions count:', response.status);
        }
      } catch (error) {
        console.error('Error fetching total questions count:', error);
      }
    };

    fetchQuestionData();
    fetchTotalQuestions();
  }, [id]);

  // Handlers for navigating to next and previous questions
  const handlePreviousQuestion = () => {
    if (id > 1) {
      navigate(`/question/${Number(id) - 1}`);
    }
  };

  const handleNextQuestion = () => {
    if (id < totalQuestions) {
      navigate(`/question/${Number(id) + 1}`);
    }
  };

  if (!questionData) return <div>Loading...</div>;

  return (
    <div className="question-page-container">
      <h1 className="question-title">{`Question ${questionData.id}: ${questionData.question_name}`}</h1>

      <div className="description-section">
        <h2>Description</h2>
        <div className="description-content">{questionData.question_description}</div>
      </div>

      <div className="options-section">
        <h2>Options</h2>
        {Object.entries({
          A: questionData.option_1,
          B: questionData.option_2,
          C: questionData.option_3,
          D: questionData.option_4
        }).map(([option, text]) => (
          <div className="option-container" key={option}>
            {option}) {text}
          </div>
        ))}
      </div>

      <div className="correct-answer-section">
        <p>
          The correct Answer: <strong>{questionData.correct_option}</strong>,{' '}
          {questionData[`option_${questionData.correct_option}`]}
        </p>
      </div>

      <div className="actions-section">
        {/* Link to the comment section for this question */}
        <Link to={`/comments/${questionData.id}`}>
          <button className="comment-button">Comment</button>
        </Link>

        {/* Navigation Buttons */}
        {id > 1 && (
          <button className="prev-next-button" onClick={handlePreviousQuestion}>
            Previous Question
          </button>
        )}
        {id < totalQuestions && (
          <button className="prev-next-button" onClick={handleNextQuestion}>
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}

export default QuestionPage;
