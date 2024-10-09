import { FormObjectValue, fileAssetEntities } from '@unocha/hpc-data';
import { FlowFormType, FormGroup } from './flow-form/flow-form';
import AsyncAutocompleteSelectReview from './flow-form/inputs/async-autocomplete-pending-review';
import { fnCategories, fnOrganizations } from '../utils/fn-promises';
import { getEnv } from '../context';
import tw from 'twin.macro';
import RadioButtonFieldReview from './flow-form/inputs/radio-button-peding-review';
import { useFormikContext } from 'formik';
import TextFieldReview from './flow-form/inputs/text-field-pending-review';
import DatePickerReview from './flow-form/inputs/date-picker-pending-review';
import { Box } from '@mui/material';
import { Dayjs } from 'dayjs';
import { C } from '@unocha/hpc-ui';
import { MdUploadFile } from 'react-icons/md';

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

const ReportingDetail = ({
  index,
}: {
  index: number;
  reportingDetailValue?: ReportingDetailProps;
}) => {
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
  } = values.reportingDetails[index];

  const REPORT_SOURCES = [
    {
      displayLabel: 'Primary',
      value: 'Primary',
    },
    {
      displayLabel: 'Secondary',
      value: 'Secondary',
    },
  ];

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
    console.log(value);
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
      title={`Reporting Detail ${index !== 0 ? index + 1 : ''}`}
      styles={tw`p-6`}
      closeButtonAction={index > 0 ? handleRemoveReportingDetail : undefined}
    >
      <Box sx={tw`grid grid-cols-2 gap-y-8 gap-x-24`}>
        <div>
          <RadioButtonFieldReview
            fieldName="reportSource"
            label="Report Source"
            options={REPORT_SOURCES}
            value={
              reportSource ?? REPORTING_DETAIL_INITIAL_VALUES['reportSource']
            }
            onChange={(value) =>
              handleChangeReportSource(
                value as ReportingDetailProps['reportSource']
              )
            }
          />
          <AsyncAutocompleteSelectReview
            fieldName="reportedByOrganization"
            label="Reported by Organization"
            fnPromise={(query) => fnOrganizations(query, env)}
            required
            initialValue={reportedByOrganization}
            onChange={(value) => handleChange('reportedByOrganization', value)}
          />
          <div>
            {values.fundingSourceOrganizations.length +
              values.fundingDestinationOrganizations.length >
              0 && <span> Organizations already on this flow: </span>}
            {values.fundingSourceOrganizations.map((org) => (
              <ReportingOrganizationSuggestion
                onClick={() => handleChange('reportedByOrganization', org)}
                key={org.value}
              >
                {` ${org.displayLabel} `}
              </ReportingOrganizationSuggestion>
            ))}
            {values.fundingDestinationOrganizations.map((org) => (
              <ReportingOrganizationSuggestion
                onClick={() => handleChange('reportedByOrganization', org)}
                key={org.value}
              >
                {` ${org.displayLabel} `}
              </ReportingOrganizationSuggestion>
            ))}
          </div>
          <AsyncAutocompleteSelectReview
            fieldName="reportChannel"
            label="Report Channel"
            fnPromise={() => fnCategories('reportChannel', env)}
            isAutocompleteAPI={false}
            initialValue={reportChannel}
            onChange={(value) => handleChange('reportChannel', value)}
          />
          <TextFieldReview
            fieldName="sourceSystemRecordId"
            label="Source System Record ID"
            initialValue={sourceSystemRecordId}
            onChange={(value) => handleChange('sourceSystemRecordId', value)}
          />
        </div>
        <div>
          <RadioButtonFieldReview
            fieldName="verified"
            label="Verified"
            options={[
              { displayLabel: 'Verified', value: 'true' },
              { displayLabel: 'Unverified', value: 'false' },
            ]}
            value={verified}
            onChange={(value) => handleChange('verified', value)}
          />
          <DatePickerReview
            fieldName="dateReported"
            label="Date Reported"
            initialValue={dateReported}
            onChange={(value) => handleChange('dateReported', value)}
          />
          <TextFieldReview
            fieldName="reporterReferenceCode"
            label="Reporter Reference Code"
            initialValue={reporterReferenceCode}
            onChange={(value) => handleChange('reporterReferenceCode', value)}
          />
          <TextFieldReview
            fieldName="reporterContactInfo"
            label="Reporter Contact Information"
            textarea
            minRows={2}
            initialValue={reporterContactInfo}
            onChange={(value) => handleChange('reporterContactInfo', value)}
          />
        </div>
      </Box>
      <Box
        sx={tw`flex gap-x-10 justify-around p-4 my-4 border border-solid border-unocha-panel-border rounded-[4px] flex-grow-0`}
      >
        <Box sx={tw`basis-1/2 max-w-[50%]`}>
          <span>Report File:</span>
          <TextFieldReview
            fieldName="reportFileTitle"
            label="Title"
            placeholder="Title"
            initialValue={reportFileTitle}
            onChange={(value) => {
              handleChange('reportFileTitle', value);
            }}
          />
          <C.UploadFile
            name="file"
            buttonConfig={{
              color: 'primary',
              text: 'Upload',
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
          />
        </Box>
        <Box sx={tw`basis-1/2 max-w-[50%]`}>
          <span>Report URL:</span>
          <TextFieldReview
            fieldName="reportURLTitle"
            label="Title"
            placeholder="Title"
            initialValue={reportURLTitle}
            onChange={(value) => handleChange('reportURLTitle', value)}
          />
          <TextFieldReview
            fieldName="url"
            label="URL"
            placeholder="URL"
            initialValue={url}
            onChange={(value) => handleChange('url', value)}
          />
        </Box>
      </Box>
    </FormGroup>
  );
};

export default ReportingDetail;
