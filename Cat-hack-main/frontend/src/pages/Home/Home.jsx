import React from 'react';
import './Home.css';
import bg1 from '../../assets/bg1.jpeg';
import bg2 from '../../assets/bg2.jpeg';
import bg3 from '../../assets/bg3.jpeg';
import bg4 from '../../assets/bg4.jpeg';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="image-container">
        <img src={bg1} className="inspection-image" alt="Truck Inspection" />
        <div className="overlay"></div>
        <p className="description">
          Perform thorough inspections with CatInspect. Ensure safety and compliance with ease.
        </p>
        <Link to='/inspect'><button className="inspect-button">Inspect</button></Link>
      </div>
      <div className="home-content">
        <div className="card-container">
          <div className="card">
            <img src={bg2} className="card-image" alt="Our Mission" />
            <div className="card-overlay"></div>
            <h3>Our Mission</h3>
            <p>We are committed to ensuring vehicle safety through meticulous inspections.</p>
          </div>
          <div className="card">
            <img src={bg3} className="card-image" alt="Our Services" />
            <div className="card-overlay"></div>
            <h3>Our Services</h3>
            <p>Offering comprehensive truck inspection services to meet regulatory standards.</p>
          </div>
          <div className="card">
            <img src={bg4} className="card-image" alt="Why Choose Us" />
            <div className="card-overlay"></div>
            <h3>Why Choose Us</h3>
            <p>Trusted by businesses for reliable and efficient inspection solutions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
