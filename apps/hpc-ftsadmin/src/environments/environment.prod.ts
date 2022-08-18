import { loadEnvForConfig } from './config-loader';
import { Environment } from './interface';

export { Environment };

export default () => loadEnvForConfig('/config/config.json');
