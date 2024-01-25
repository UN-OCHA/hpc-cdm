import { flows } from '@unocha/hpc-data';

/**
 * Transform any object or Array to a string
 */
function parseFilterToGraphQL(obj: Record<string, any>): string {
  const keyValuePairs: string[] = [];

  if (Array.isArray(obj)) {
    // If the input is an array, apply the function to each element and return the result in square brackets
    const arrayValues = obj.map((element: any) =>
      parseFilterToGraphQL(element)
    );
    return `[${arrayValues.join(', ')}]`;
  }
  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key] !== undefined
    ) {
      let valueString: string;

      if (Array.isArray(obj[key])) {
        // If the value is an array, stringify the entire array
        valueString = `${key}: [${obj[key]
          .map((element: any) => JSON.stringify(element))
          .join(', ')}]`;
      } else if (typeof obj[key] === 'object') {
        // If the value is an object, call the function recursively
        valueString = `${key}: ${parseFilterToGraphQL(obj[key])}`;
      } else {
        // Otherwise, use the value as is
        valueString = `${key}: ${
          typeof obj[key] === 'string' ? `"${obj[key]}"` : obj[key].toString()
        }`;
      }

      keyValuePairs.push(valueString);
    }
  }

  return `{${keyValuePairs.join(', ')}}`;
}
/**
 * Also valid for TotalAmountUSD() params
 */
export const searchFlowsParams = (params: flows.SearchFlowsParams): string => {
  let queryParams = '';
  let key: keyof typeof params;
  for (key in params) {
    const unmutableKey = key;
    switch (unmutableKey) {
      case 'carryover':
      case 'commitment':
      case 'paid':
      case 'parked':
      case 'standard':
      case 'pass_through':
      case 'pending':
      case 'pledged':
      case 'includeChildrenOfParkedFlows':
        if (params[unmutableKey])
          queryParams = queryParams.concat(unmutableKey, ': true ');
        break;
      case 'limit':
        if (params[unmutableKey])
          queryParams = queryParams.concat(
            unmutableKey,
            `:${params[unmutableKey]} `
          );
        break;
      case 'sortField':
      case 'nextPageCursor':
      case 'prevPageCursor':
      case 'sortOrder':
        if (params[unmutableKey])
          queryParams = queryParams.concat(
            unmutableKey,
            `:"${params[unmutableKey]}" `
          );
        break;
      case 'flowCategoryFilters':
      case 'flowObjectFilters': {
        const filter = params[unmutableKey];
        if (filter && filter.length > 0)
          queryParams = queryParams.concat(
            unmutableKey,
            `:${parseFilterToGraphQL(filter)} `
          );
        break;
      }
      case 'flowFilters': {
        const filter = params[unmutableKey];
        if (filter && JSON.stringify(filter) !== '{}')
          queryParams = queryParams.concat(
            unmutableKey,
            `:${parseFilterToGraphQL(filter)} `
          );
        break;
      }
      case 'nestedFlowFilters': {
        const filter = params[unmutableKey];
        if (filter && JSON.stringify(filter) !== '{}')
          queryParams = queryParams.concat(
            unmutableKey,
            `:${parseFilterToGraphQL(filter)} `
          );
        break;
      }
    }
  }

  return queryParams === '' ? '' : `(${queryParams})`;
};
