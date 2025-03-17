import { Box } from '@mui/material';
import { type FormObjectValue, fileAssetEntities } from '@unocha/hpc-data';
import { C } from '@unocha/hpc-ui';
import { type Dayjs } from 'dayjs';
import { useFormikContext } from 'formik';
import { MdUploadFile } from 'react-icons/md';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../i18n';
import { getContext } from '../context';
import { fnCategories, fnOrganizations } from '../utils/fn-promises';
import { type FlowFormType, FormGroup } from './flow-form/flow-form';

export type ReportingDetailProps = {
  reportSource: 'Primary' | 'Secondary';
  reportedByOrganization: FormObjectValue | null;
  reportChannel: FormObjectValue | null;
  sourceSystemRecordId: string;
  verified: string;
  dateReported: Dayjs | null;
  reporterReferenceCode: string;
  reporterContactInfo: string;
  reportFileTitle: string;
  file: fileAssetEntities.FileUploadResult | null;
  reportURLTitle: string;
  url: string;
};

export const REPORTING_DETAIL_INITIAL_VALUES = {
  reportSource: 'Primary',
  reportedByOrganization: null,
  reportChannel: null,
  sourceSystemRecordId: '',
  verified: 'true',
  dateReported: null,
  reporterReferenceCode: '',
  reporterContactInfo: '',
  reportFileTitle: '',
  file: null,
  reportURLTitle: '',
  url: '',
} satisfies ReportingDetailProps;

const ReportingOrganizationSuggestion = tw.span`
  text-unocha-textLink
  hover:cursor-pointer
  hover:underline
`;

export const validateReportingDetailsRequiredField = (
  value: FormObjectValue | null,
  lang: LanguageKey
) =>
  !value
    ? t.t(lang, (s) => s.components.reportingDetail.validation.required)
    : undefined;

export const validateReportingDetailsURLFormat = (
  value: string | '',
  lang: LanguageKey
) => {
  if (value === '') {
    return undefined;
  }
  return /^https:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/.test(value)
    ? undefined
    : t.t(lang, (s) => s.components.reportingDetail.validation.url);
};

const ReportingDetail = ({
  index,
  disabled,
}: {
  index: number;
  disabled?: boolean;
}) => {
  const { env: getEnv, lang } = getContext();
  const env = getEnv();

  const { values, setFieldValue } = useFormikContext<FlowFormType>();

  const {
    dateReported,
    file,
    reportChannel,
    reportFileTitle,
    reportSource,
    sourceSystemRecordId,
    verified,
    reportURLTitle,
    url,
    reportedByOrganization,
    reporterContactInfo,
    reporterReferenceCode,
  } = values.reportingDetails[index] ?? REPORTING_DETAIL_INITIAL_VALUES;

  const reportSourceOptions = () => {
    const PRIMARY = 'Primary';
    const SECONDARY = 'Secondary';
    return [
      {
        displayLabel: t.t(
          lang,
          (s) => s.components.reportingDetail.reportSource.options[PRIMARY]
        ),
        value: PRIMARY,
      },
      {
        displayLabel: t.t(
          lang,
          (s) => s.components.reportingDetail.reportSource.options[SECONDARY]
        ),
        value: SECONDARY,
      },
    ];
  };

  const verifiedOptions = () => {
    const VERIFIED = 'true';
    const UNVERIFIED = 'false';
    return [
      {
        displayLabel: t.t(
          lang,
          (s) => s.components.reportingDetail.verified.options[VERIFIED]
        ),
        value: VERIFIED,
      },
      {
        displayLabel: t.t(
          lang,
          (s) => s.components.reportingDetail.verified.options[UNVERIFIED]
        ),
        value: UNVERIFIED,
      },
    ];
  };

  const handleRemoveReportingDetail = () => {
    const reportingDetails = values.reportingDetails;
    reportingDetails.splice(index, 1);
    setFieldValue('reportingDetails', reportingDetails);
  };

  const handleChange = (
    fieldName: keyof ReportingDetailProps,
    value: unknown
  ) => {
    const newReportingDetail = {
      ...values.reportingDetails[index],
      [fieldName]: value,
    };
    const reportingDetails = values.reportingDetails;
    reportingDetails[index] = newReportingDetail;

    setFieldValue('reportingDetails', reportingDetails);
  };

  const handleChangeReportSource = (
    value: ReportingDetailProps['reportSource']
  ) => {
    const verifiedValue = value === 'Primary' ? 'true' : 'false';

    const newReportingDetail = {
      ...values.reportingDetails[index],
      reportSource: value,
      verified: verifiedValue,
    };

    const reportingDetails = values.reportingDetails;
    reportingDetails[index] = newReportingDetail;

    setFieldValue('reportingDetails', reportingDetails);
  };

  const handleUploadFile = async (file?: File) => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('data', file);

    return env.model.fileAssetEntities.fileUpload(formData).then((file) => {
      handleChange('file', file);
      return file;
    });
  };
  const handleDeleteFile = async () => {
    const fileId = file?.id;
    if (!fileId) {
      return;
    }
    return env.model.fileAssetEntities
      .fileDelete(fileId, 'fts')
      .then(() => handleChange('file', null));
  };

  const handleDownloadFile = async () => {
    const fileId = file?.id;
    if (!fileId) {
      return;
    }
    return env.model.fileAssetEntities
      .fileDownload(fileId, 'fts')
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      });
  };
  return (
    <FormGroup
      title={t.t(lang, (s) => s.components.reportingDetail.title, {
        index: index !== 0 ? index + 1 : '',
      })}
      styles={tw`p-6`}
      closeButtonAction={index > 0 ? handleRemoveReportingDetail : undefined}
    >
      <Box sx={tw`grid grid-cols-2 gap-y-8 gap-x-24`}>
        <div>
          <C.RadioButtonField
            name="reportSource"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.reportSource.label
            )}
            options={reportSourceOptions()}
            value={
              reportSource ?? REPORTING_DETAIL_INITIAL_VALUES['reportSource']
            }
            onChange={(value) =>
              handleChangeReportSource(
                value as ReportingDetailProps['reportSource']
              )
            }
            disabled={disabled}
          />
          <C.AsyncAutocompleteSelect
            name="reportedByOrganization"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.reportedByOrganization.label
            )}
            fnPromise={(query) => fnOrganizations(query, env)}
            required
            initialValue={reportedByOrganization}
            onChange={(value) => handleChange('reportedByOrganization', value)}
            disabled={disabled}
            controlledError={validateReportingDetailsRequiredField(
              values.reportingDetails[index].reportedByOrganization,
              lang
            )}
          />
          <div>
            {!disabled &&
              values.fundingSourceOrganizations.length +
                values.fundingDestinationOrganizations.length >
                0 && (
                <span>
                  {t.t(
                    lang,
                    (s) =>
                      s.components.reportingDetail.reportedByOrganization
                        .organizationsInFlow
                  )}
                  {values.fundingSourceOrganizations.map((org) => (
                    <ReportingOrganizationSuggestion
                      onClick={() =>
                        handleChange('reportedByOrganization', org)
                      }
                      key={org.value}
                    >
                      {` ${org.displayLabel} `}
                    </ReportingOrganizationSuggestion>
                  ))}
                  {values.fundingDestinationOrganizations.map((org) => (
                    <ReportingOrganizationSuggestion
                      onClick={() =>
                        handleChange('reportedByOrganization', org)
                      }
                      key={org.value}
                    >
                      {` ${org.displayLabel} `}
                    </ReportingOrganizationSuggestion>
                  ))}
                </span>
              )}
          </div>
          <C.AsyncAutocompleteSelect
            name="reportChannel"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.reportChannel.label
            )}
            fnPromise={() => fnCategories('reportChannel', env)}
            isAutocompleteAPI={false}
            initialValue={reportChannel}
            onChange={(value) => handleChange('reportChannel', value)}
            disabled={disabled}
            controlledError={validateReportingDetailsRequiredField(
              values.reportingDetails[index].reportChannel,
              lang
            )}
            required
          />
          <C.TextFieldWrapper
            name="sourceSystemRecordId"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.sourceSystemRecordId.label
            )}
            controlledField={{
              // This is a readonly field
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              onChange: () => {},
              value: sourceSystemRecordId,
            }}
            disabled={true}
          />
        </div>
        <div>
          <C.RadioButtonField
            name="verified"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.verified.label
            )}
            options={verifiedOptions()}
            value={verified}
            onChange={(value) => handleChange('verified', value)}
            disabled={disabled}
          />
          <C.DatePicker
            name="dateReported"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.dateReported.label
            )}
            controlledField={{
              value: dateReported,
              onChange: (value) => handleChange('dateReported', value),
            }}
            disabled={disabled}
            lang={lang}
          />
          <C.TextFieldWrapper
            name="reporterReferenceCode"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.reporterReferenceCode.label
            )}
            controlledField={{
              value: reporterReferenceCode,
              onChange: (value) => handleChange('reporterReferenceCode', value),
            }}
            disabled={disabled}
          />
          <C.TextFieldWrapper
            name="reporterContactInfo"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.reporterContactInfo.label
            )}
            textarea
            minRows={2}
            controlledField={{
              value: reporterContactInfo,
              onChange: (value) => handleChange('reporterContactInfo', value),
            }}
            disabled={disabled}
          />
        </div>
      </Box>
      <Box
        sx={tw`flex gap-x-10 justify-around p-4 my-4 border border-solid border-unocha-panel-border rounded-[4px] flex-grow-0`}
      >
        <Box sx={tw`basis-1/2 max-w-[50%]`}>
          <span>
            {t.t(lang, (s) => s.components.reportingDetail.fileSection)}
          </span>
          <C.TextFieldWrapper
            name="reportFileTitle"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.reportFileTitle.label
            )}
            placeholder={t.t(
              lang,
              (s) => s.components.reportingDetail.reportFileTitle.label
            )}
            controlledField={{
              value: reportFileTitle,
              onChange: (value) => {
                handleChange('reportFileTitle', value);
              },
            }}
            disabled={disabled}
          />

          <C.UploadFile
            name="file"
            buttonConfig={{
              color: 'primary',
              text: t.t(lang, (s) => s.components.upload.buttonText),
              startIcon: MdUploadFile,
            }}
            onUpload={handleUploadFile}
            onDelete={handleDeleteFile}
            onDownload={handleDownloadFile}
            file={
              file
                ? {
                    displayLabel: file.name,
                    value: file.id,
                  }
                : undefined
            }
            disabled={disabled}
          />
        </Box>
        <Box sx={tw`basis-1/2 max-w-[50%]`}>
          <span>
            {t.t(lang, (s) => s.components.reportingDetail.urlSection)}
          </span>
          <C.TextFieldWrapper
            name="reportURLTitle"
            label={t.t(
              lang,
              (s) => s.components.reportingDetail.reportURLTitle.label
            )}
            placeholder={t.t(
              lang,
              (s) => s.components.reportingDetail.reportURLTitle.label
            )}
            controlledField={{
              value: reportURLTitle,
              onChange: (value) => handleChange('reportURLTitle', value),
            }}
            disabled={disabled}
          />
          <C.TextFieldWrapper
            name="url"
            label={t.t(lang, (s) => s.components.reportingDetail.url.label)}
            placeholder={t.t(
              lang,
              (s) => s.components.reportingDetail.url.label
            )}
            controlledField={{
              value: url,
              onChange: (value) => handleChange('url', value),
              error: validateReportingDetailsURLFormat(
                values.reportingDetails[index].url,
                lang
              ),
            }}
            disabled={disabled}
          />
        </Box>
      </Box>
    </FormGroup>
  );
};

export default ReportingDetail;
