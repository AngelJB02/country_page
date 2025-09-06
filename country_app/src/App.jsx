// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Equitacion from "./views/Equitacion";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equitacion" element={<Equitacion />} />
      </Routes>
    </Router>
  );
}

export default App;
