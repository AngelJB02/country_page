import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Equitacion from "./views/Equitacion";
import CalendarioReserva from "./components/CalendarioReserva";
import MenuCalendario from "./components/MenuCalendario";
import Login from "./components/Login";
import RegistroUsuarios from "./components/RegistroUsuarios";
import InstructorClases from "./components/InstructorClases";  
import Contabilidad from "./components/Contabilidad";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equitacion" element={<Equitacion />} />
        <Route path="/CalendarioReserva" element={<CalendarioReserva />} />
        <Route path="/MenuCalendario" element={<MenuCalendario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegistroUsuarios />} />
        <Route path="/instructor" element={<InstructorClases />} />
        <Route path="/contabilidad" element={<Contabilidad />} />
      </Routes>
    </Router>
  );
}

export default App;