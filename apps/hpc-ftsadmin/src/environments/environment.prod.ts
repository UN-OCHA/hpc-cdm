import { loadEnvForConfig } from './config-loader';

export default () => {
  console.log('Calling loadEnvForConfig()');
  return loadEnvForConfig('/config/config.json');
};

export { Environment } from './interface';
