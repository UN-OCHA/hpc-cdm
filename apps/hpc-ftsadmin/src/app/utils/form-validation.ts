import { type FormikErrors } from 'formik';
import { isRight } from 'fp-ts/lib/Either';
import type * as io from 'io-ts';
import { isKey } from './parse-filters';

const isStringUndefined = (value: unknown): value is string | undefined =>
  typeof value === 'string' || value === undefined;
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
        // Did not find a better solution, but I think it is
        // fine to let it like that for the moment
        if (isStringUndefined(errors[key])) {
          let validationErrorMessage = '{validationError}'; // Placeholder to change for i18n text
          if (errorMessages && isKey(errorMessages, key)) {
            validationErrorMessage = errorMessages[key];
          }
          (errors[key] as string | undefined) = validationErrorMessage;
        }
      }
    }
  }
  return errors;
};

export default validateForm;
