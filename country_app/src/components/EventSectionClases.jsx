import React from 'react';
import { useNavigate } from 'react-router-dom'; 

// Imágenes slides
import image11 from "../img/image11.jpg";
import image12 from "../img/image12.jpg";
import image13 from "../img/image13.jpg";
import ClaseBasica from "../img/clases_basicas.jpeg";


const EventsSection = () => {
  const navigate = useNavigate(); // Hook para redireccionar


    const clases = [
      {
        id: 1,
        titulo: "Clases Básicas",
        descripcion: "Aprende los fundamentos de la equitación, desde la postura hasta el control del caballo.",
        imagen: ClaseBasica,
        caracteristicas: ["Instrucción personalizada", "Caballos entrenados", "Duración 1 hora"],
      },
      {
        id: 2,
        titulo: "Clases Intermedias",
        descripcion: "Mejora tu técnica, aprende a trotar y galopar con seguridad y confianza.",
        imagen: class2Img,
        caracteristicas: ["Ejercicios avanzados", "Clases grupales o individuales", "Duración 1.5 horas"],
      },
      {
        id: 3,
        titulo: "Clases Avanzadas",
        descripcion: "Perfecciona tu habilidad con técnicas de salto y manejo avanzado del caballo.",
        imagen: class3Img,
        caracteristicas: ["Salto de obstáculos", "Competencias simuladas", "Duración 2 horas"],
      },
    ;