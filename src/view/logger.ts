import { logger as baseLogger } from '../logger';

export const logger = baseLogger.location.push('view');
