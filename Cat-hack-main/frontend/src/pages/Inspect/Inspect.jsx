import React, { useState } from 'react';
import './Inspect.css';
import { db } from '../../context/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';

const Inspect = () => {
  const [formData, setFormData] = useState({
    truckSerialNumber: '',
    truckModel: '',
    inspectionId: '',
    inspectorName: '',
    inspectorEmployeeId: '',
    dateTimeOfInspection: '',
    locationOfInspection: '',
    serviceMeterHours: '',
    inspectorSignature: '',
    customerName: '',
    catCustomerId: ''
  });

  const [errors, setErrors] = useState({});
  const [signaturePad, setSignaturePad] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(formData);
    if (Object.keys(newErrors).length === 0) {
      try {
        await addDoc(collection(db, 'truckDetails'), formData);
        alert('Form submitted successfully!');
        navigate('/checklist'); // Redirect to /checklist
        setFormData({
          truckSerialNumber: '',
          truckModel: '',
          inspectionId: '',
          inspectorName: '',
          inspectorEmployeeId: '',
          dateTimeOfInspection: '',
          locationOfInspection: '',
          serviceMeterHours: '',
          inspectorSignature: '',
          customerName: '',
          catCustomerId: ''
        });
        if (signaturePad) signaturePad.clear();
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const validate = (values) => {
    const errors = {};
    if (!values.truckSerialNumber) errors.truckSerialNumber = 'Truck Serial Number is required';
    if (!values.truckModel) errors.truckModel = 'Truck Model is required';
    if (!values.inspectionId) errors.inspectionId = 'Inspection Id is required';
    if (!values.inspectorName) errors.inspectorName = 'Inspector Name is required';
    if (!values.inspectorEmployeeId) errors.inspectorEmployeeId = 'Inspector Employee ID is required';
    if (!values.dateTimeOfInspection) errors.dateTimeOfInspection = 'Date and Time of Inspection is required';
    if (!values.locationOfInspection) errors.locationOfInspection = 'Location of Inspection is required';
    if (!values.serviceMeterHours) errors.serviceMeterHours = 'Service Meter Hours is required';
    if (!values.customerName) errors.customerName = 'Customer Name is required';
    if (!values.catCustomerId) errors.catCustomerId = 'Cat Customer Id is required';
    return errors;
  };

  const clearSignature = () => {
    signaturePad.clear();
    setFormData({ ...formData, inspectorSignature: '' });
  };

  const saveSignature = () => {
    setFormData({ ...formData, inspectorSignature: signaturePad.getTrimmedCanvas().toDataURL('image/png') });
  };

  return (
    <div className="bg">
    <div className="inspect-container">
      <h1>Truck Inspection Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Truck Serial Number</label>
          <input
            type="text"
            name="truckSerialNumber"
            value={formData.truckSerialNumber}
            onChange={handleChange}
            required
          />
          {errors.truckSerialNumber && <span className="error">{errors.truckSerialNumber}</span>}
        </div>
        <div className="form-group">
          <label>Truck Model</label>
          <input
            type="text"
            name="truckModel"
            value={formData.truckModel}
            onChange={handleChange}
            required
          />
          {errors.truckModel && <span className="error">{errors.truckModel}</span>}
        </div>
        <div className="form-group">
          <label>Inspection Id</label>
          <input
            type="text"
            name="inspectionId"
            value={formData.inspectionId}
            onChange={handleChange}
            required
          />
          {errors.inspectionId && <span className="error">{errors.inspectionId}</span>}
        </div>
        <div className="form-group">
          <label>Inspector Name</label>
          <input
            type="text"
            name="inspectorName"
            value={formData.inspectorName}
            onChange={handleChange}
            required
          />
          {errors.inspectorName && <span className="error">{errors.inspectorName}</span>}
        </div>
        <div className="form-group">
          <label>Inspector Employee ID</label>
          <input
            type="text"
            name="inspectorEmployeeId"
            value={formData.inspectorEmployeeId}
            onChange={handleChange}
            required
          />
          {errors.inspectorEmployeeId && <span className="error">{errors.inspectorEmployeeId}</span>}
        </div>
        <div className="form-group">
          <label>Date and Time of Inspection</label>
          <input
            type="datetime-local"
            name="dateTimeOfInspection"
            value={formData.dateTimeOfInspection}
            onChange={handleChange}
            required
          />
          {errors.dateTimeOfInspection && <span className="error">{errors.dateTimeOfInspection}</span>}
        </div>
        <div className="form-group">
          <label>Location of Inspection</label>
          <input
            type="text"
            name="locationOfInspection"
            value={formData.locationOfInspection}
            onChange={handleChange}
            required
          />
          {errors.locationOfInspection && <span className="error">{errors.locationOfInspection}</span>}
        </div>
        <div className="form-group">
          <label>Service Meter Hours</label>
          <input
            type="number"
            name="serviceMeterHours"
            value={formData.serviceMeterHours}
            onChange={handleChange}
            required
          />
          {errors.serviceMeterHours && <span className="error">{errors.serviceMeterHours}</span>}
        </div>
       
        <div className="form-group">
          <label>Cat Customer Id</label>
          <input
            type="text"
            name="catCustomerId"
            value={formData.catCustomerId}
            onChange={handleChange}
            required
          />
          {errors.catCustomerId && <span className="error">{errors.catCustomerId}</span>}
        </div>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
          {errors.customerName && <span className="error">{errors.customerName}</span>}
        </div>
        <div className="form-group">
          <label>Inspector Signature</label>
          <SignaturePad
            ref={(ref) => setSignaturePad(ref)}
            canvasProps={{ className: 'signature-pad' }}
          />
          <div className="signature-buttons">
            <button type="button" onClick={clearSignature}>Clear</button>
            <button type="button" onClick={saveSignature}>Save</button>
          </div>
          {errors.inspectorSignature && <span className="error">{errors.inspectorSignature}</span>}
        </div>
        <button type="submit" className='submit-btn'>Submit</button>
      </form>
    </div>
    </div>
  );
};

export default Inspect;
