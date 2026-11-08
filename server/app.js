import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import genreRoutes from './routes/genreRoutes.js';
import titleRoutes from './routes/titleRoutes.js'

dotenv.config();

const app=express();

app.use(cors({origin:process.env.CLIENT_URL}));
app.use(express.json());

app.use('/api/health',healthRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/genres',genreRoutes);
app.use('/api/titles',titleRoutes);
app.use((req,res)=>{
    res.status(404).json({message: 'Route not found'});

});


export default app;