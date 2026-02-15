import { Router } from 'express';
import {
	ackBotEncounterEventsHandler,
	ackBotMarketEventsHandler,
	getBotEncounterEventsHandler,
	getBotMarketEventsHandler,
} from './botIntegration.controller';

export const botIntegrationRouter = Router();

botIntegrationRouter.get('/market/events', getBotMarketEventsHandler);
botIntegrationRouter.post('/market/events/ack', ackBotMarketEventsHandler);
botIntegrationRouter.get('/screen/encounters/events', getBotEncounterEventsHandler);
botIntegrationRouter.post('/screen/encounters/events/ack', ackBotEncounterEventsHandler);
