import express from 'express';
import controller from './controller';
import Utils from '../../../common/utils';

/*
Class that defines some general app specific endpoints
 */
export default express.Router()
    .post('/consent', Utils.ensureAuthenticated, (req, res) => controller.consent(req, res))
    .get('/apps', Utils.ensureAuthenticated, (req, res) => controller.getApps(req, res))
    .get('/sso', Utils.ensureAuthenticated, (req, res) => controller.getSsoSettings(req, res));

