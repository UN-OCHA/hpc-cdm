import { Environment } from './interface';
import { loadEnvForConfig } from './config-loader';

export { Environment };

export default () => loadEnvForConfig('/config/config.json');
