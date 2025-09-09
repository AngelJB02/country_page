import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./views/Home";
import Equitacion from "./views/Equitacion";
import CalendarioReserva from "./components/CalendarioReserva";
import MenuCalendario from "./components/MenuCalendario";
import RegistroUsuarios from "./components/RegistroUsuarios";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/equitacion" element={<Equitacion />} />
        <Route path="/CalendarioReserva" element={<CalendarioReserva />} />
        <Route path="/MenuCalendario" element={<MenuCalendario />} />
        <Route path="/RegistroUsuarios" element={<RegistroUsuarios />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;