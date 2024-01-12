import * as io from 'io-ts';
import { isRight } from 'fp-ts/lib/Either';
import { FormikErrors } from 'formik';
import { isKey } from './parse-filters';

/**
 * Validate form fields when using io-ts as a validator. validationSchema key names must be the same as the ones supplied to values
 */
const validateForm = <T extends object>(
  values: T,
  validationSchema: io.Any
) => {
  const result = validationSchema.decode(values);
  if (isRight(result)) {
    return {};
  } else {
    const errors: FormikErrors<T> = {};
    result.left.map((value) =>
      value.context.map((context) => {
        if (isKey(values, context.key)) {
          const key = context.key;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          errors[key] = '{validationError}'; //  Placeholder to change for i18n text
        }
        return null;
      })
    );
    return errors;
  }
};

export default validateForm;
