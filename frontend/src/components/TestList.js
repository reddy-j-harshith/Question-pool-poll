import React, { useEffect, useState, useContext } from 'react';
import './TestList.css'; // Assuming the CSS file is created
import Config from '../Config'; // Assuming you have a Config file for the base URL
import AuthContext from './AuthContext'; // Ensure AuthContext is set up for authTokens

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // To handle modal visibility
  const [newTest, setNewTest] = useState({ subject: '', topic: '', duration: '' }); // New test data
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`${Config.baseURL}/api/test/fetch-all/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokens?.access}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTests(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Error fetching tests');
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
        setError('An error occurred while fetching tests.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [authTokens]);

  if (loading) return <p>Loading tests...</p>;
  if (error) return <p>{error}</p>;

  const startTest = async (testId) => {
    try {
      const response = await fetch(`${Config.baseURL}/api/test/${testId}/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
        },
      });

      if (response.ok) {
        alert(`Test ${testId} started successfully`);
        setTests(tests.map(test => (test.id === testId ? { ...test, active: true } : test)));
      } else {
        const errorData = await response.json();
        alert(`Failed to start Test ${testId}: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      alert('An error occurred while starting the test.');
    }
  };

  const stopTest = async (testId) => {
    try {
      const response = await fetch(`${Config.baseURL}/api/test/${testId}/stop/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
        },
      });

      if (response.ok) {
        alert(`Test ${testId} stopped successfully`);
        setTests(tests.map(test => (test.id === testId ? { ...test, active: false } : test)));
      } else {
        const errorData = await response.json();
        alert(`Failed to stop Test ${testId}: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error stopping test:', error);
      alert('An error occurred while stopping the test.');
    }
  };

  // Handle showing modal
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewTest({ subject: '', topic: '', duration: '' }); // Reset form fields
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    const { subject, topic, duration } = newTest;

    try {
      const response = await fetch(`${Config.baseURL}/api/test/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, topic, duration }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Test created successfully');
        setTests([...tests, { id: data.test_id, subject, topic, duration, active: false }]);
        handleCloseModal(); // Close the modal after successful creation
      } else {
        const errorData = await response.json();
        alert(`Failed to create test: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('An error occurred while creating the test.');
    }
  };

  return (
    <div className="test-list">
      <h2>Test List</h2>
      <button className="add-test-button" onClick={handleOpenModal}>
        + Add Test
      </button>
      
      <div className="test-grid">
        {tests.map(test => (
          <div key={test.id} className="test-tile">
            <h3>{test.subject}</h3>
            <p>Topic: {test.topic}</p>
            <p>Status: {test.active ? 'Active' : 'Inactive'}</p>
            <button onClick={() => test.active ? stopTest(test.id) : startTest(test.id)}>
              {test.active ? 'Stop Test' : 'Start Test'}
            </button>
          </div>
        ))}
      </div>

      {/* Modal for adding new test */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Test</h3>
            <form onSubmit={handleCreateTest}>
              <div>
                <label>Subject</label>
                <input 
                  type="text" 
                  value={newTest.subject} 
                  onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label>Topic</label>
                <input 
                  type="text" 
                  value={newTest.topic} 
                  onChange={(e) => setNewTest({ ...newTest, topic: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label>Duration (in minutes)</label>
                <input 
                  type="number" 
                  value={newTest.duration} 
                  onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })} 
                  required 
                />
              </div>
              <button type="submit">Create Test</button>
              <button type="button" onClick={handleCloseModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;