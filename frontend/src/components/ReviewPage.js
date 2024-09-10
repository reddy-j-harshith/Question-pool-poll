// ReviewPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ReviewPage.css';
import Toolbar from './Toolbar';
function ReviewPage() {
  // Placeholder data for saved questions
  const savedQuestions = [
    { id: 1, name: 'Example Question 1', subject: 'Math', topic: 'Algebra', correctAnswer: 'A' },
    { id: 2, name: 'Example Question 2', subject: 'Science', topic: 'Physics', correctAnswer: 'B' },
    // ... other saved questions
  ];

  return (
    <div className="review-page-container">
      <h1>Saved Questions</h1>
      <Toolbar/>
      <table className="questions-table">
        <thead>
          <tr>
            <th>QNo.</th>
            <th>Question Name</th>
            <th>Subject</th>
            <th>Topic</th>
            <th>Correct Answer</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {savedQuestions.map((question, index) => (
            <tr key={question.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
              <td>{index + 1}</td>
              <td>
                <Link to={`/question/${question.id}`}>{question.name}</Link>
              </td>
              <td>{question.subject}</td>
              <td>{question.topic}</td>
              <td>{question.correctAnswer}</td>
              <td>
                <input type="range" min="1" max="10" value={5} readOnly />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewPage;