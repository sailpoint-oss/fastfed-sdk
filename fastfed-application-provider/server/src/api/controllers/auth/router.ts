import express from 'express';
import controller from './controller';

/*
Class that defines the OAuth endpoints
 */
export default express.Router()
    .post('/token', (req, res) => controller.authenticate(req, res));

