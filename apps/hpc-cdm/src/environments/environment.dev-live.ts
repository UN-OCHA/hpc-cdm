import { Environment } from './interface';
import { loadEnvForConfig } from './config-loader';

export { Environment };

export default () => loadEnvForConfig('http://localhost:3000/config.json');
