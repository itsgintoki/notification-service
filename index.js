import 'dotenv/config';

import express from 'express';
import userRouter from './routes/auth.routes.js';
import notificationRouter from './routes/notifications.routes.js'

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req, res) => {
    return res.json({ status: 'Server is up and running...' })
})


app.use('/', userRouter);
app.use('/',notificationRouter)

app.listen(PORT,()=>{
    console.log(`Server listening on ${PORT}`);
})

