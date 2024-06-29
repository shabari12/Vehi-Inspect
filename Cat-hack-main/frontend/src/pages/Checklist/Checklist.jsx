import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { db } from '../../context/firebase';
import { collection, addDoc } from 'firebase/firestore';
import './Checklist.css'; // Import the CSS file for styling

const Checklist = () => {
  const [status, setStatus] = useState('');
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [reasons, setReasons] = useState({});
  const [images, setImages] = useState({});
  const [inspectFormId, setInspectFormId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('question_answer', (data) => {
      setAnswers(prevAnswers => ({
        ...prevAnswers,
        [data.question]: data.answer
      }));

      if (data.answer === 'Fail' && data.reason) {
        setReasons(prevReasons => ({
          ...prevReasons,
          [data.question]: data.reason
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startProcess = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/start-process');
      setStatus(response.data.message);
      setWebcamStarted(true);
      // Auto-fill air pressure questions with random numbers between 50 to 60
      setAnswers(prevAnswers => ({
        ...prevAnswers,
        "TIRE PRESSURE for Left Front": getRandomNumber(50, 60),
        "TIRE PRESSURE for Right Front": getRandomNumber(50, 60),
        "TIRE PRESSURE for Left Rear": getRandomNumber(50, 60),
        "TIRE PRESSURE for Right Rear": getRandomNumber(50, 60),
      }));
    } catch (error) {
      console.error('Error starting process:', error);
      setStatus('Error starting process');
    }
  };

  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const questions = [
    "TIRE CONDITION for Left Front",
    "TIRE CONDITION for Right Front",
    "TIRE PRESSURE for Left Rear",
    "TIRE PRESSURE for Right Rear",
    "TIRE CONDITION for Left Rear",
    "TIRE CONDITION for Right Rear",
    "BATTERY Make",
    "BATTERY Water level",
    "BATTERY Replacement date",
    "BATTERY Voltage",
    "Condition of BATTERY",
    "Any Leak / Rust in BATTERY",
    "Rust, Dent or Damage to EXTERIOR",
    "Oil leak in SUSPENSION",
    "BRAKE Fluid level",
    "BRAKE CONDITION for Front",
    "BRAKE CONDITION for Rear",
    "Emergency BRAKE",
    "Rust, Dents or Damage in ENGINE",
    "ENGINE Oil Condition",
    "ENGINE Oil Color",
    "BRAKE Fluid Condition",
    "BRAKE Fluid Color",
    "Any oil leak in ENGINE",
  ];

  const visibleWithNakedEyeQuestions = [
    "TIRE CONDITION for Left Front",
    "TIRE CONDITION for Right Front",
    "TIRE CONDITION for Left Rear",
    "TIRE CONDITION for Right Rear",
    "Condition of BATTERY",
    "Any Leak / Rust in BATTERY",
    "Rust, Dent or Damage to EXTERIOR",
    "Oil leak in SUSPENSION",
    "Rust, Dents or Damage in ENGINE",
    "Any oil leak in ENGINE",
  ];

  const handleAnswerChange = (question, answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [question]: answer
    }));
  };

  const handleImageChange = (question, event) => {
    const file = event.target.files[0];
    if (file) {
      setImages(prevImages => ({
        ...prevImages,
        [question]: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async () => {
    const dataToSave = {
      answers,
      reasons,
      images,
      inspectFormId,
    };

    try {
      await addDoc(collection(db, 'checkbox'), dataToSave);
      alert('Details submitted successfully!');
      navigate('/success'); // Redirect to Success page
    } catch (error) {
      console.error('Error saving details: ', error);
      alert('Error saving details.');
    }
  };

  return (
    <div className="checklist-container">
      <h1>Checklist</h1>
      <button className="start-button" onClick={startProcess}>Start Process</button>
      
      {webcamStarted && (
        <div className="webcam-feed">
          <img src="http://localhost:5000/video_feed" alt="Webcam Feed" width="640" height="480" />
        </div>
      )}

      <h2>Inspection Questions</h2>

      {/* Air pressure inspection questions */}
      <div className="question-card">
        <p>Air Pressure at Front Left:</p>
        <input
          type="number"
          value={answers["TIRE PRESSURE for Left Front"] || ''}
          onChange={(e) => handleAnswerChange("TIRE PRESSURE for Left Front", e.target.value)}
        />
      </div>
      <div className="question-card">
        <p>Air Pressure at Front Right:</p>
        <input
          type="number"
          value={answers["TIRE PRESSURE for Right Front"] || ''}
          onChange={(e) => handleAnswerChange("TIRE PRESSURE for Right Front", e.target.value)}
        />
      </div>
      <div className="question-card">
        <p>Air Pressure at Rear Left:</p>
        <input
          type="number"
          value={answers["TIRE PRESSURE for Left Rear"] || ''}
          onChange={(e) => handleAnswerChange("TIRE PRESSURE for Left Rear", e.target.value)}
        />
      </div>
      <div className="question-card">
        <p>Air Pressure at Rear Right:</p>
        <input
          type="number"
          value={answers["TIRE PRESSURE for Right Rear"] || ''}
          onChange={(e) => handleAnswerChange("TIRE PRESSURE for Right Rear", e.target.value)}
        />
      </div>

      {/* Remaining inspection questions */}
      {questions.map((question, index) => (
        <div key={index} className="question-card">
          <p>{question}</p>
          <label>
            Pass
            <input
              type="radio"
              name={`question-${index}`}
              value="Pass"
              checked={answers[question] === 'Pass'}
              onChange={() => handleAnswerChange(question, 'Pass')}
            />
          </label>
          <label>
            Fail
            <input
              type="radio"
              name={`question-${index}`}
              value="Fail"
              checked={answers[question] === 'Fail'}
              onChange={() => handleAnswerChange(question, 'Fail')}
            />
          </label>
          {answers[question] === 'Fail' && reasons[question] && (
            <p><strong>Reason:</strong> {reasons[question]}</p>
          )}
          {visibleWithNakedEyeQuestions.includes(question) && (
            <div className="image-upload">
              <label>
                Upload Image:
                <input type="file" accept="image/*" onChange={(event) => handleImageChange(question, event)} />
              </label>
              {images[question] && (
                <div>
                  <p>Uploaded Image:</p>
                  <img src={images[question]} alt={`Uploaded for ${question}`} className="uploaded-image" />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <button className="submit-button" onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Checklist;
