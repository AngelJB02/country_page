import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor corriendo ✅');
});

app.listen(3001, () => console.log('Servidor escuchando en http://localhost:3001'));
