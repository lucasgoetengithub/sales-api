import express from 'express';

import { connectMongoDB } from './src/config/db/mongoDbConfig.js';
import { createInitialData } from './src/config/db/initialData.js';
import checkToken from './src/config/auth/checkToken.js';
import { connectRabbitMq } from './src/config/rabbitmq/rabbitConfig.js';
import orderRoutes from './src/modules/sales/routes/OrderRoutes.js';
import tracing from './src/config/tracing.js';

const app = express();
const env = process.env;
const PORT = env.PORT || 8082;
const THREE_MINUTRES = 180000;
const CONTAINER_ENV = "container";

startApplication();

async function startApplication() {
    if (CONTAINER_ENV === env.NODE_ENV) {
        console.info("Waiting for RabbitMQ and MongoDB containers to start...");
        setInterval(() => {
            connectMongoDB();
            connectRabbitMq();
        }, THREE_MINUTRES);
    } else {
        console.info("Waiting for RabbitMQ and MongoDB containers to start...");
        connectMongoDB();
        createInitialData();
        connectRabbitMq();
    }
}

app.use(express.json());

app.get("/api/initial-data", (req, res) => {
    createInitialData();
    return res.json({ message: "Data created." });
})

app.use(tracing);
app.use(checkToken);
app.use(orderRoutes);

app.get('/api/status', (req, res) => {
    
    return res.status(200).json({
        service: 'Sales-API',
        status: 'up',
        httpStatus: 200
    });
})

app.listen(PORT, () => {
    console.info(`Server started sucessfully at port ${PORT}`)
})