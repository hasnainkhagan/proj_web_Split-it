import express from 'express';

const server = express();

server.use(express.json({ limit: '1024mb' }));
server.use(express.urlencoded({ extended: true }));

export default server;