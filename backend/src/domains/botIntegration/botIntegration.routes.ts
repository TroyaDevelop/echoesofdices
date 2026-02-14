import { Router } from 'express';
import { ackBotMarketEventsHandler, getBotMarketEventsHandler } from './botIntegration.controller';

export const botIntegrationRouter = Router();

botIntegrationRouter.get('/market/events', getBotMarketEventsHandler);
botIntegrationRouter.post('/market/events/ack', ackBotMarketEventsHandler);
