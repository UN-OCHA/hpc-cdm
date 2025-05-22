import { loadEnvForConfig } from './config-loader';




export default () => loadEnvForConfig('/config/config.json');

export {Environment} from './interface';