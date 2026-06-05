import 'dotenv/config';

import express from 'express';
import userRouter from './routes/auth.routes.js';

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running...' })
})


app.use('/', userRouter);

app.listen(PORT,()=>{
    console.log(`Server listening on ${PORT}`);
})

