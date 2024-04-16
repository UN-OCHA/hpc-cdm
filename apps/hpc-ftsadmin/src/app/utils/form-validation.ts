import * as io from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { FormikErrors } from 'formik';
import { isKey } from './parse-filters';

export const parseFieldError = (validationError: string, error: string) => {
  if (validationError === '{validationError}') {
    return error;
  }
};
const isStringUndefined = (value: unknown): value is string | undefined =>
  typeof value === 'string' || typeof value === 'undefined';
/**
 * Validate form fields when using io-ts as a validator. validationSchema key names must be the same as the ones supplied to values
 */
const validateForm = <T extends object, K extends io.Any>(
  values: T,
  validationSchema: K
) => {
  const result = validationSchema.decode(values);
  if (isRight(result)) {
    return {};
  } else {
    const errors: FormikErrors<T> = {};
    for (const value of result.left) {
      for (const context of value.context) {
        if (isKey(values, context.key)) {
          const key = context.key;
          //  Did not find a better solution, but I think it is fine to let it like that for the moment
          if (isStringUndefined(errors[key])) {
            (errors[key] as string | undefined) = '{validationError}'; //  Placeholder to change for i18n text
          }
        }
      }
    }
    return errors;
  }
};

export default validateForm;
