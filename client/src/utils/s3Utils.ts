import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique interview ID
 */
export const generateInterviewId = (): string => {
  return uuidv4();
};
