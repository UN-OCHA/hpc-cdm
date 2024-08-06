import { flows } from '@unocha/hpc-data';

/**
 * Same as `JSON.stringify()`, but we remove '"' from property keys.
 *  Example: `"{\"key1\":12}"` becomes: `"{key1:12}"`
 */
const stringify = (value: unknown): string =>
  JSON.stringify(value).replace(/"([^"]+)":/g, '$1:');

export const searchFlowsParams = (params: flows.SearchFlowsParams): string => {
  let queryParams = '';
  let typedKey: keyof typeof params;
  for (typedKey in params) {
    const key = typedKey;
    switch (key) {
      case 'flowCategoryFilters':
      case 'flowObjectFilters': {
        const filter = params[key];
        if (filter && filter.length > 0)
          queryParams += `${key}: ${stringify(filter)} `;
        break;
      }
      case 'nestedFlowFilters':
      case 'flowFilters': {
        const filter = params[key];
        if (filter && JSON.stringify(filter) !== '{}')
          queryParams += `${key}: ${stringify(filter)} `;
        break;
      }
      default: {
        if (params[key]) {
          queryParams += `${key}: ${stringify(params[key])} `;
        }
        break;
      }
    }
  }
  return !queryParams ? '' : `(${queryParams})`;
};
