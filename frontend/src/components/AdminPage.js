import React, { useState, useContext } from 'react';
import Toolbar from './Toolbar'; // Import the reusable toolbar
import './AdminPage.css'; // Import the CSS for styling
import Config from '../Config'; // Import your configuration for the baseURL
import AuthContext from './AuthContext'; // Import the AuthContext for authentication tokens

function AdminPage() {
  const [newQuestion, setNewQuestion] = useState({
    questionName: '',
    questionDescription: '',
    subject: '',
    topic: '',
    correctAnswer: '',
    options: ['', '', '', ''],
    difficulty: 'easy',
  });
  const [questions, setQuestions] = useState([]);
  const { authTokens } = useContext(AuthContext); // Get authTokens from context

  const handleAddQuestion = async () => {
    // Validate that no field is empty
    if (
      !newQuestion.questionName ||
      !newQuestion.questionDescription ||
      !newQuestion.subject ||
      !newQuestion.topic ||
      !newQuestion.correctAnswer ||
      newQuestion.options.some(option => !option.trim())
    ) {
      alert('All fields are required and options cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`${Config.baseURL}/api/add-question/`, { // Update URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authTokens?.access}`, // Ensure authTokens are available and valid
        },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        const data = await response.json();
        // Optionally update local state or UI with the new question if needed
        setQuestions([...questions, { ...newQuestion, qNo: questions.length + 1 }]);
        setNewQuestion({
          questionName: '',
          questionDescription: '',
          subject: '',
          topic: '',
          correctAnswer: '',
          options: ['', '', '', ''],
          difficulty: 'easy',
        });
        alert('Question added successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to add question: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('An error occurred while adding the question.');
    }
  };

  const handleRemoveQuestion = async (questionId) => {
    try {
      const response = await fetch(`${Config.baseURL}/api/delete-question/${questionId}/`, { // Update URL
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`, // Ensure authTokens are available and valid
        },
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q.qNo !== questionId));
        alert('Question removed successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to remove question: ${error.message}`);
      }
    } catch (error) {
      console.error('Error removing question:', error);
      alert('An error occurred while removing the question.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('option')) {
      const index = parseInt(name.split('-')[1]);
      const newOptions = [...newQuestion.options];
      newOptions[index] = value;
      setNewQuestion({ ...newQuestion, options: newOptions });
    } else {
      setNewQuestion({ ...newQuestion, [name]: value });
    }
  };

  const handleGetCSV = () => {
    // Logic for generating CSV goes here
    console.log("Get CSV clicked");
  };

  return (
    <div className="admin-container">
      <Toolbar />
      <div className="admin-content">
        <h1>Admin Page</h1>
        <div className="add-question-form">
          <h2>Add Question</h2>
          <input
            type="text"
            name="questionName"
            value={newQuestion.questionName}
            placeholder="Question Name"
            onChange={handleChange}
          />
          <textarea
            name="questionDescription"
            value={newQuestion.questionDescription}
            placeholder="Question Description"
            onChange={handleChange}
          />
          <input
            type="text"
            name="subject"
            value={newQuestion.subject}
            placeholder="Subject"
            onChange={handleChange}
          />
          <input
            type="text"
            name="topic"
            value={newQuestion.topic}
            placeholder="Topic"
            onChange={handleChange}
          />
          <input
            type="text"
            name="correctAnswer"
            value={newQuestion.correctAnswer}
            placeholder="Correct Answer"
            onChange={handleChange}
          />
          <input
            type="text"
            name="option-0"
            value={newQuestion.options[0]}
            placeholder="Option 1"
            onChange={handleChange}
          />
          <input
            type="text"
            name="option-1"
            value={newQuestion.options[1]}
            placeholder="Option 2"
            onChange={handleChange}
          />
          <input
            type="text"
            name="option-2"
            value={newQuestion.options[2]}
            placeholder="Option 3"
            onChange={handleChange}
          />
          <input
            type="text"
            name="option-3"
            value={newQuestion.options[3]}
            placeholder="Option 4"
            onChange={handleChange}
          />
          <select
            name="difficulty"
            value={newQuestion.difficulty}
            onChange={handleChange}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <div className="button-group">
            <button onClick={handleAddQuestion}>Add Question</button>
            <button className="get-csv-button" onClick={handleGetCSV}>Extract CSV</button>
          </div>
        </div>

        <div className="remove-question">
          <h2>Remove Question</h2>
          {questions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>QNo</th>
                  <th>Question</th>
                  <th>Description</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Correct Answer</th>
                  <th>Options</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.qNo}>
                    <td>{q.qNo}</td>
                    <td>{q.questionName}</td>
                    <td>{q.questionDescription}</td>
                    <td>{q.subject}</td>
                    <td>{q.topic}</td>
                    <td>{q.correctAnswer}</td>
                    <td>{q.options.join(', ')}</td>
                    <td>{q.difficulty}</td>
                    <td>
                      <button onClick={() => handleRemoveQuestion(q.qNo)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No questions to remove</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
