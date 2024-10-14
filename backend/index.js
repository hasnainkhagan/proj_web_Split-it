import 'dotenv/config'
import express from 'express';
import { Router } from './routes/router.js';
import serverMiddleware from './middlewares/server.js';
import { client } from './client.js';

// DB
import { connectDB } from './db/db.js'

const app = express();
const PORT = 1024 || process.env.PORT;

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [process.env.MAIN_WEB_URL];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.header("Access-Control-Allow-Credentials", true);

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  next();
});

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
});

// Other middleware
app.use(serverMiddleware);

// Routes
app.use(Router);

// Server
client.connect().then(() => console.log("Redis Connected")).catch((err) => console.log(err)).then(() => connectDB(process.env.MONGO_URL, process.env.MONGO_DB_NAME).then(() => app.listen(PORT, () => {
  console.log('Server running at port: ' + PORT);
})));
