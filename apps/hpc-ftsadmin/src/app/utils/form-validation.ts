import { type FormikErrors } from 'formik';
import { isRight } from 'fp-ts/lib/Either';
import type * as t from 'io-ts';
import { isKey } from './parse-filters';

/**
 * Validate form fields when using io-ts as a validator.
 */
const validateForm = <T, K extends keyof T>(
  values: T,
  validationSchema: t.TypeC<Record<K, t.Mixed>>,
  errorMessages: Record<K, string>
) => {
  const result = validationSchema.decode(values);
  if (isRight(result)) {
    return {};
  }

  const errors: FormikErrors<T> = {};
  for (const value of result.left) {
    for (const context of value.context) {
      const key = context.key;
      if (isKey(errorMessages, key)) {
        errors[key] = errorMessages[key] as FormikErrors<T>[typeof key];
      }
    }
  }
  return errors;
};

export default validateForm;
