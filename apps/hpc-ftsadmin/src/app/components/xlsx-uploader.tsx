import { isModelError } from '@unocha/hpc-live';
import { C } from '@unocha/hpc-ui';
import { useState } from 'react';
import { MdUploadFile } from 'react-icons/md';
import { toast } from 'react-toastify';
import { t } from '../../i18n';
import { getContext } from '../context';
import { TOAST_CONFIG, TOAST_CONFIG_ERROR } from '../utils/constants';
import XLSXErrorDisplay from './xlsx-error-display';

const VALID_FILE_EXTENSION = new Set<string>([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const XLSXUploader = () => {
  const { lang, env: getEnv } = getContext();
  const env = getEnv();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileValidation = (file?: File) => {
    if (!file) {
      return false;
    }

    const isValid = VALID_FILE_EXTENSION.has(file.type);

    if (!isValid) {
      toast.error(
        t.t(lang, (s) => s.components.upload.error.invalidExtension),
        TOAST_CONFIG_ERROR
      );
    }

    setErrorMessage(null);
    return isValid;
  };

  const handleSuccess = (fileName: string = '') => {
    setErrorMessage(null);
    toast.success(
      t.t(lang, (s) => s.components.upload.success, {
        fileName,
      }),
      TOAST_CONFIG
    );
  };

  const handleError = (err: unknown) => {
    if (isModelError(err)) {
      setErrorMessage(err.message);
      return;
    }

    toast.error(
      t.t(lang, (s) => s.components.upload.error.unknown),
      TOAST_CONFIG_ERROR
    );
  };

  return (
    <>
      <C.UploadFile
        buttonConfig={{
          color: 'primary',
          text: t.t(lang, (s) => s.components.upload.buttonText),
          startIcon: MdUploadFile,
        }}
        name="uploadXLSX"
        onDelete={(setSavedFile) => {
          setErrorMessage(null);
          return Promise.resolve(setSavedFile(undefined));
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
        lang={lang}
        hideFileChangeStatusStyle
      />
      <XLSXErrorDisplay errorMessage={errorMessage} />
    </>
  );
};

export default XLSXUploader;
