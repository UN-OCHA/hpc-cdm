import nxESlintPlugin from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [...nxESlintPlugin.configs['flat/react'], ...baseConfig];
