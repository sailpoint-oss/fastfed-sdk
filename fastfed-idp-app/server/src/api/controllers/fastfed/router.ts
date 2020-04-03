import express from 'express';
import controller from './controller';
import Utils from '../../../common/utils';

/*
Class that defines the FastFed endpoints

Some of these endpoints require authentication and will be authenticated through the ADFS IdP
 */
export default express.Router()
    .get('/', (req, res) => controller.getMetadata(req, res))
    .post('/continue', Utils.ensureAuthenticated, (req, res, next) => controller.postConsentContinue(req, res, next))
    .get('/start', Utils.ensureAuthenticated, (req, res, next) => controller.start(req, res, next))

    // TODO: move these to an app endpoint.  they aren't truly FastFed related
    .get('/confirmations', Utils.ensureAuthenticated, (req, res, next) => controller.getConfirmationRequirements(req, res, next))
    .get('/relyingParties', Utils.ensureAuthenticated, (req, res, next) => controller.getRelyingParties(req, res, next));

