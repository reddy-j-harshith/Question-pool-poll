import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Toolbar from './Toolbar';
import './AdminPage.css';
import Config from '../Config';
import AuthContext from './AuthContext';

function AdminPage() {
  const [newQuestion, setNewQuestion] = useState({
    question_name: '',
    question_description: '',
    subject: '',
    topic: '',
    correct_option: '',
    options: ['', '', '', ''],
    difficulty: 'easy',
  });

  const nav = useNavigate();
  const [questions, setQuestions] = useState([]);
  const { authTokens } = useContext(AuthContext);

  const handleAddQuestion = async () => {
    if (
      !newQuestion.question_name ||
      !newQuestion.question_description ||
      !newQuestion.subject ||
      !newQuestion.topic ||
      !newQuestion.correct_option ||
      newQuestion.options.some(option => !option.trim())
    ) {
      alert('All fields are required and options cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`${Config.baseURL}/api/add-question/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authTokens?.access}`,
        },
        body: JSON.stringify({
          question_name: newQuestion.question_name,
          question_description: newQuestion.question_description,
          subject: newQuestion.subject,
          topic: newQuestion.topic,
          correct_option: newQuestion.correct_option,
          option_1: newQuestion.options[0],
          option_2: newQuestion.options[1],
          option_3: newQuestion.options[2],
          option_4: newQuestion.options[3],
          difficulty: newQuestion.difficulty,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions([...questions, { ...newQuestion, qNo: questions.length + 1 }]);
        setNewQuestion({
          question_name: '',
          question_description: '',
          subject: '',
          topic: '',
          correct_option: '',
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
      const response = await fetch(`${Config.baseURL}/api/delete-question/${questionId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
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


  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
  
    // Directly pass the file to handleBulkAdd
    await handleBulkAdd(file);
  };

  // Function to parse CSV and convert it to the expected format
 

  const handleTestNavigate = async () => {
    nav("/test");
  };

  const handleGetCSV = async () => {
    try {
      const response = await fetch(`${Config.baseURL}/api/get-net-ratings/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('CSV data:', data);

        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Question ID,Net Rating,Difficulty\n';
        data.forEach((row) => {
          csvContent += `${row.question_id},${row.net_rating},${row.difficulty}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'question_ratings.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const error = await response.json();
        alert(`Failed to generate CSV: ${error.message}`);
      }
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('An error occurred while generating the CSV.');
    }
  };

  const handleBulkAdd = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch(`${Config.baseURL}/api/bulk-add-questions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
        },
        body: formData, // Send the FormData containing the file
      });
  
      if (response.ok) {
        const data = await response.json();
        alert(`Bulk questions added successfully! ${data.questions_created} questions created.`);
      } else {
        const error = await response.json();
        alert(`Failed to add bulk questions: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error with bulk question addition:', error);
      alert('An error occurred during the bulk addition.');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        <h1>Admin Page</h1>
        <div className="add-question-form">
          <h2>Add Question</h2>
          <input
            type="text"
            name="question_name"
            value={newQuestion.question_name}
            placeholder="Question Name"
            onChange={handleChange}
          />
          <textarea
            name="question_description"
            value={newQuestion.question_description}
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
            name="correct_option"
            value={newQuestion.correct_option}
            placeholder="Correct Option"
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
            <button className="get-difficulties-button" onClick={handleTestNavigate}>Tests</button>
            {/* Add the button for bulk add and the file input for CSV */}
            
            <button onClick={() => document.getElementById("bulkUploadInput").click()}>Bulk Add CSV</button>
  <input
    type="file"
    id="bulkUploadInput"
    style={{ display: 'none' }}
    accept=".csv"
    onChange={handleCSVUpload}
  />
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
                  <th>Difficulty</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question, index) => (
                  <tr key={question.qNo}>
                    <td>{question.qNo}</td>
                    <td>{question.question_name}</td>
                    <td>{question.question_description}</td>
                    <td>{question.subject}</td>
                    <td>{question.topic}</td>
                    <td>{question.difficulty}</td>
                    <td>
                      <button onClick={() => handleRemoveQuestion(question.qNo)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No questions available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;