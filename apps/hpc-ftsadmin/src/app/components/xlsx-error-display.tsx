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
import tw from 'twin.macro';
import { t } from '../../i18n';
import { getContext } from '../context';

type Props = {
  errorMessages: string[] | null;
};

const XLSXErrorDisplay = ({ errorMessages }: Props) => {
  if (!errorMessages) {
    return null;
  }
  const { lang } = getContext();

  return (
    <Grow in={!!errorMessages}>
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
            </TableHead>
            <TableBody>
              {errorMessages.map((errorMessage, index) => (
                <TableRow key={`body_${index}`}>
                  <TableCell sx={tw`text-unocha-pallete-red-dark`}>
                    {errorMessage}
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
