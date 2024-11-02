import React, { useEffect, useState, useContext } from 'react';
import './TestList.css'; // Ensure this file exists and is correctly linked
import Config from '../Config'; // Ensure this file exists and is correctly linked
import AuthContext from './AuthContext'; // Ensure this context exists and is correctly set up
const TestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTest, setNewTest] = useState({ subject: '', topic: '', duration: '' });
  const { authTokens } = useContext(AuthContext);

  // Fetch all tests when the component mounts
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(`${Config.baseURL}/api/test/fetch-all/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokens?.access}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error fetching tests');
        }

        const data = await response.json();
        // Ensure remaining_time is initialized correctly
        const initializedTests = data.map(test => ({
          ...test,
          remaining_time: test.remaining_time || { minutes: 0, seconds: 0 },
        }));
        setTests(initializedTests);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setError(error.message || 'An error occurred while fetching tests.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();

    // Fetch tests every minute
    const interval = setInterval(fetchTests, 60000);

    return () => clearInterval(interval); // Clean up on unmount
  }, [authTokens]);

  // Countdown logic for each test
  useEffect(() => {
    const interval = setInterval(() => {
      setTests(prevTests =>
        prevTests.map(test => {
          if (test.active && test.remaining_time) {
            let remainingSeconds = test.remaining_time.minutes * 60 + test.remaining_time.seconds - 1;

            // Ensure remaining time doesn't go below zero
            if (remainingSeconds < 0) {
              remainingSeconds = 0;
              stopTest(test.id); // Stop the test when time runs out
            }

            return {
              ...test,
              remaining_time: {
                minutes: Math.floor(remainingSeconds / 60),
                seconds: remainingSeconds % 60,
              },
            };
          }
          return test;
        })
      );
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [tests]);

  // Handle loading and error states
  if (loading) return <p>Loading tests...</p>;
  if (error) return <p>{error}</p>;

  // Start a test
// Start a test
const startTest = async (testId) => {
  try {
    // First, start the test
    const response = await fetch(`${Config.baseURL}/api/test/${testId}/start/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
      },
    });

    if (response.ok) {
      // Fetch the remaining time for the test after starting it
      const timeResponse = await fetch(`${Config.baseURL}/api/test/${testId}/time/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
        },
      });

      if (timeResponse.ok) {
        const timeData = await timeResponse.json();
        alert(`Test ${testId} started successfully`);

        // Set the test as active and initialize remaining_time with fetched values
        setTests(tests.map(test => 
          (test.id === testId ? { 
            ...test, 
            active: true, 
            remaining_time: timeData.remaining_time // Use the fetched remaining time
          } : test)
        ));
      } else {
        const errorData = await timeResponse.json();
        alert(`Failed to fetch remaining time for Test ${testId}: ${errorData.error}`);
      }
    } else {
      const errorData = await response.json();
      alert(`Failed to start Test ${testId}: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error starting test:', error);
    alert('An error occurred while starting the test.');
  }
};

  // Stop a test
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
        setTests(prevTests => prevTests.map(test => 
          (test.id === testId ? { ...test, active: false } : test)
        ));
      } else {
        const errorData = await response.json();
        alert(`Failed to stop Test ${testId}: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error stopping test:', error);
      alert('An error occurred while stopping the test.');
    }
  };

  // Handle modal visibility
  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setNewTest({ subject: '', topic: '', duration: '' });
  };

  // Create a new test
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create test');
      }

      const data = await response.json();
      alert('Test created successfully');
      // Ensure duration is correctly passed as an integer
      setTests(prevTests => [
        ...prevTests,
        {
          id: data.test_id,
          subject,
          topic,
          duration: parseInt(duration, 10), // Ensure duration is an integer
          active: false,
          remaining_time: { minutes: parseInt(duration, 10), seconds: 0 } // Initialize remaining time
        }
      ]);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating test:', error);
      alert(error.message);
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
            {test.active && test.remaining_time && (
              <p>
                Time Remaining: {test.remaining_time.minutes}m {test.remaining_time.seconds}s
              </p>
            )}
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