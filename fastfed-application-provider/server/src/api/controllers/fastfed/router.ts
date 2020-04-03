import express from 'express';
import controller from './controller';
import Utils from '../../../common/utils';

/*
Class that defines the FastFed endpoints

Some of these endpoints require authentication and will be authenticated through the ADFS IdP
 */
export default express.Router()
    .get('/provider-metadata', (req, res, next) => controller.getMetadata(req, res, next))
    .post('/register', Utils.ensureAuthenticated, (req, res, next) => controller.register(req, res, next))
    .post('/finalize', Utils.ensureAuthenticated, (req, res, next) => controller.finalize(req, res, next))
    // testing/QA/dev endpoint for removing the FastFed demo app from the ADFS relying trust list
    .get('/rm/:name', Utils.ensureAuthenticated, (req, res, next) => controller.removeAuthenticationProfile(req, res, next))
    .get('/discovery/:type', Utils.ensureAuthenticated, (req, res, next) => controller.discovery(req, res, next))
    .get('/whitelist', Utils.ensureAuthenticated, (req, res, next) => controller.getWhitelist(req, res, next))
    .delete('/whitelist/:entityId', Utils.ensureAuthenticated, (req, res, next) => controller.removeWhitelist(req, res, next))
