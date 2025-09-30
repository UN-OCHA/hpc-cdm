import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  Grow,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { t } from '../../i18n';
import { getContext } from '../context';
import { TOAST_CONFIG_ERROR } from '../utils/constants';

type Props = {
  errorMessage: string | null;
};
type ValidationError = Record<string, Set<string>>;

const ERROR_REGEX = /Invalid value (.+?) supplied to (\w+)/g;

const parseErrorMessage = (
  errorMessage: string
): Array<[string, Set<string>]> => {
  const matches = errorMessage.matchAll(ERROR_REGEX);
  const errors: ValidationError = {};

  for (const match of matches) {
    const [, invalidValue, key] = match;

    if (!errors[key]) {
      errors[key] = new Set();
    }
    errors[key].add(invalidValue);
  }
  return Object.entries(errors);
};

const XLSXErrorDisplay = ({ errorMessage }: Props) => {
  const hasNoError = !errorMessage;
  if (hasNoError) {
    return null;
  }
  const isValidationError = !!errorMessage && ERROR_REGEX.test(errorMessage);
  if (!isValidationError) {
    toast.error(errorMessage, TOAST_CONFIG_ERROR);
    return null;
  }
  const { lang } = getContext();
  const parsedErrors = parseErrorMessage(errorMessage);

  return (
    <Grow in={isValidationError}>
      <Box sx={tw`self-center`}>
        <Box sx={tw`shadow-lg mb-4`}>
          <Table>
            <TableHead sx={tw`bg-unocha-pallete-gray-light3`}>
              <TableRow sx={tw`bg-unocha-pallete-red-dark`}>
                <TableCell
                  sx={tw`rounded-t-sm text-white`}
                  colSpan={2}
                  align="center"
                >
                  <Box sx={tw`flex justify-center gap-x-2`}>
                    <ErrorIcon />
                    <span>
                      {t.t(
                        lang,
                        (s) => s.components.xlsxUpload.errorTable.title
                      )}
                    </span>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t.t(lang, (s) => s.components.xlsxUpload.errorTable.column)}
                </TableCell>
                <TableCell>
                  {t.t(
                    lang,
                    (s) => s.components.xlsxUpload.errorTable.invalidValues
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedErrors.map(([key, invalidValues]) => (
                <TableRow key={`body_${key}`}>
                  <TableCell>{key}</TableCell>
                  <TableCell sx={tw`text-unocha-pallete-red-dark`}>
                    {[...invalidValues].join(', ')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Grow>
  );
};

export default XLSXErrorDisplay;
