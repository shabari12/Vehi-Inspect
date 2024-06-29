import React from "react";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Inspect from "./pages/Inspect/Inspect";
import Footer from "./components/Footer/Footer";
import Checklist from "./pages/Checklist/Checklist";
import Success from "./pages/Success/Success";
import Records from "./pages/Records/Records";

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inspect" element={<Inspect />} />
        <Route path="/checklist" element={<Checklist />}></Route>
        <Route path="/success" element={<Success/>}></Route>
        <Route path="/records" element={<Records/>}></Route>
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
