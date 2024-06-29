import React, { useEffect, useState } from 'react';
import { db } from '../../context/firebase';
import { collection, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import './Records.css';

const Records = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'checkbox'));
        const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(recordsData);
      } catch (error) {
        console.error('Error fetching records: ', error);
      }
    };

    fetchRecords();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();

    records.forEach((record, recordIndex) => {
      doc.text(`Check list Record`, 10, 10 + recordIndex * 50);

      let yOffset = 20 + recordIndex * 50;

      Object.entries(record.answers).forEach(([question, answer], index) => {
        doc.text(`${question}: ${answer}`, 10, yOffset + index * 10);
        if (answer === 'Fail' && record.reasons && record.reasons[question]) {
          doc.text(`Reason: ${record.reasons[question]}`, 10, yOffset + (index + 1) * 10);
          yOffset += 10; // Add extra space for reason
        }
      });

      doc.addPage();
    });

    doc.save('records.pdf');
  };

  return (
    <div className="records-container">
      <button onClick={generatePDF} className="generate-pdf-button">Generate PDF</button>
      <div className="records-grid">
        {records.map((record) => (
          <div key={record.id} className="record-card">
            <h2>Check list Record</h2>
            <div className="record-details">
              {Object.entries(record.answers).map(([question, answer], index) => (
                <div key={index} className="record-item">
                  <p><strong>{question}</strong>: {answer}</p>
                  {answer === 'Fail' && record.reasons && record.reasons[question] && (
                    <p><strong>Reason:</strong> {record.reasons[question]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Records;
