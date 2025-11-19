import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { DatabaseConnect } from './configs/db';
import cookieParser from 'cookie-parser';
import UserRoutes from './routes/user.routes';
import TaskRoutes from './routes/task.routes';
dotenv.config();

const app = express()
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:3000", "https://todo-backend-tujg.onrender.com", "https://todo-app-frontend-six-blond.vercel.app", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}))
app.use(cookieParser());
app.use('/api/user', UserRoutes);
app.use('/api/task', TaskRoutes);
DatabaseConnect()
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`The server is activating on ${PORT}`)
})          