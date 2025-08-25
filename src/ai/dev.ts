
import { config } from 'dotenv';
config();

// This is a dev-only file that dynamically imports your flows.
// It is used with `genkit:watch` to support hot-reloading of flows.
import { educationalContentFlows } from './flows';

export default {
  ...educationalContentFlows,
};
