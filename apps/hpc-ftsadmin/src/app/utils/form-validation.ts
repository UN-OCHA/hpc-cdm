import { type FormikErrors } from 'formik';
import { isRight } from 'fp-ts/lib/Either';
import type * as io from 'io-ts';
import { isKey } from './parse-filters';

/**
 * Validate form fields when using io-ts as a validator. validationSchema key names must be the same as the ones supplied to values
 */
const validateForm = <T, K extends keyof T>(
  values: T,
  validationSchema: io.TypeC<Record<K, io.Mixed>>,
  errorMessages?: Record<K, string>
) => {
  const result = validationSchema.decode(values);
  if (isRight(result)) {
    return {};
  }
  const errors: FormikErrors<T> = {};
  for (const value of result.left) {
    for (const context of value.context) {
      if (isKey(values, context.key)) {
        const key = context.key;
        if (errorMessages && isKey(errorMessages, key)) {
          errors[key] = errorMessages[key] as FormikErrors<T>[typeof key];
        }
      }
    }
  }
  return errors;
};

export default validateForm;
