import { C } from '@unocha/hpc-ui';
import { MdUploadFile } from 'react-icons/md';
import { getContext } from '../context';
import { TOAST_CONFIG, TOAST_CONFIG_ERROR } from '../utils/constants';
import { toast } from 'react-toastify';
import { t } from '../../i18n';
import { isModelError } from '@unocha/hpc-live';

const VALID_FILE_EXTENSION = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

const XLSXUploader = () => {
  const { lang, env: getEnv } = getContext();
  const env = getEnv();

  const handleFileValidation = (file?: File) => {
    if (!file) {
      return false;
    }

    const isValid = VALID_FILE_EXTENSION.includes(
      file.type
    );

    if (!isValid) {
      toast.error(
        t.t(lang, (s) => s.components.upload.error.invalidExtension),
        TOAST_CONFIG_ERROR
      );
    }

    return isValid;
  };

  const handleSuccess = (fileName:string | null = '') => {
    toast.success(
      t.t(lang, (s) => s.components.upload.success, {
        fileName,
      }),
      TOAST_CONFIG
    );
  };

  const handleError = (err: unknown) => {
    if (isModelError(err)) {
      toast.error(err.message, TOAST_CONFIG_ERROR);
      return;
    }

    toast.error(
      t.t(lang, (s) => s.components.upload.error.unknown),
      TOAST_CONFIG_ERROR
    );
  };

  return (
    <C.UploadFile
      buttonConfig={{
        color: 'primary',
        text: t.t(lang, (s) => s.components.upload.buttonText),
        startIcon: MdUploadFile,
      }}
      name="uploadXLSX"
      onDelete={async (setSavedFile) => {
        setSavedFile(undefined);
      }}
      onUpload={async (file) => {
        if (!file) {
          return;
        }
        return await env.model.fileAssetEntities.uploadXLSX(file);
      }}
      confirmUpload={{
        validation: handleFileValidation,
        onSuccess: handleSuccess,
        onError: handleError,
      }}
    />
  );
};

export default XLSXUploader;
