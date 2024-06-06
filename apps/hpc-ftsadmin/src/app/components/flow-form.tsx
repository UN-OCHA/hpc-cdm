import React, {
  ChangeEvent,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { Form, Formik, FieldArray } from 'formik';
import tw from 'twin.macro';
import dayjs from 'dayjs';
import { isRight } from 'fp-ts/Either';
import { FormikErrors } from 'formik';
import * as t from 'io-ts';
import { util as codecs } from '@unocha/hpc-data';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import _, { set, values } from 'lodash';
import useSharePath from './Hooks/SharePath';
import { C, dialogs } from '@unocha/hpc-ui';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Environment } from '../../environments/interface';
import { MdAdd, MdRemove, MdClose, MdCheck } from 'react-icons/md';
import {
  usageYears,
  forms,
  governingEntities,
  fileUpload,
  flows as flowsResponse,
} from '@unocha/hpc-data';
import { getEnv } from '../context';
import { editFlowSetting, copyFlow } from '../paths';
import { flows } from '../paths';
import Link from '@mui/material/Link';
import { useNavigate, unstable_usePrompt } from 'react-router-dom';
import { id } from 'fp-ts/lib/Refinement';
import { stringify } from 'querystring';
import { mergeOptions } from 'use-query-params/dist/options';

export type AutoCompleteSelectionType = forms.InputSelectValueType;

const INPUT_SELECT_VALUE_TYPE = forms.INPUT_SELECT_VALUE_TYPE;

type UniqueDataType = {
  [key: string]: string[];
};

export interface DeleteFlowParams {
  VersionID: number;
  FlowID: number;
}

export interface categoryType {
  value: string | number;
  displayLabel: string;
  parentID: number | null;
}

export interface FileAssetEntityType {
  collection?: string;
  createAt?: string;
  filename?: string;
  id?: number;
  mimetype?: string;
  originalname?: string;
  path?: string;
  size?: number;
  updatedAt?: string;
}
export interface ReportFileType {
  title?: string;
  fileName?: string;
  UploadFileUrl?: string;
  type?: string;
  url?: string;
  fileAssetID?: number;
  size?: number;
  fileAssetEntity?: FileAssetEntityType;
}
export interface ReportDetailType {
  verified: string;
  reportSource: string;
  reporterReferenceCode: string;
  reportChannel: AutoCompleteSelectionType | '';
  reportedOrganization: AutoCompleteSelectionType;
  reportedDate: string;
  reporterContactInformation: string;
  sourceSystemRecordId: string;
  reportFiles: ReportFileType[];
  reportFileTitle?: string;
  reportUrlTitle?: string;
  reportUrl?: string;
  versionId?: number;
  fileAsset?: FileAssetEntityType;
}

export interface ParentFlowType {
  value: any;
}

export interface FormValues {
  id: string | null;
  amountUSD: number;
  keywords: AutoCompleteSelectionType[];
  flowStatus: AutoCompleteSelectionType | '';
  flowType: AutoCompleteSelectionType | '';
  flowDescription: string;
  firstReported: string;
  decisionDate: string | null;
  budgetYear: string;
  flowDate: string;
  contributionType: AutoCompleteSelectionType | '';
  earmarkingType: AutoCompleteSelectionType | '';
  method: AutoCompleteSelectionType | '';
  cashTransfer: AutoCompleteSelectionType | '';
  beneficiaryGroup: AutoCompleteSelectionType | '';
  inactiveReason: any[] | string;
  childMethod: object;
  origCurrency: AutoCompleteSelectionType | string;
  amountOriginal: number | null;
  exchangeRateUsed: number | null;
  notes: string;
  sourceOrganizations: AutoCompleteSelectionType[];
  sourceLocations: AutoCompleteSelectionType[];
  sourceUsageYears: AutoCompleteSelectionType[];
  sourceProjects: AutoCompleteSelectionType[];
  sourcePlans: AutoCompleteSelectionType[];
  sourceGoverningEntities: AutoCompleteSelectionType[];
  sourceGlobalClusters: AutoCompleteSelectionType[];
  sourceEmergencies: AutoCompleteSelectionType[];
  destinationOrganizations: AutoCompleteSelectionType[];
  destinationLocations: AutoCompleteSelectionType[];
  destinationUsageYears: AutoCompleteSelectionType[];
  destinationProjects: AutoCompleteSelectionType[];
  destinationPlans: AutoCompleteSelectionType[];
  destinationGoverningEntities: AutoCompleteSelectionType[];
  destinationGlobalClusters: AutoCompleteSelectionType[];
  destinationEmergencies: AutoCompleteSelectionType[];
  reportDetails: ReportDetailType[];
  parentFlow?: AutoCompleteSelectionType[];
  childFlow?: AutoCompleteSelectionType[];
  isParkedParent?: boolean;
  includeChildrenOfParkedFlows: boolean;
  isErrorCorrectionValue: boolean;
  sources?: Record<string, any[]>;
  submitAction?: string | undefined;
  versions?: {
    id: number | null;
    isPending: boolean | null;
  }[];
}

export interface VersionDataType {
  versionId: number;
  flowId: number;
  createdTime: string;
  createdBy: string | null;
  updatedTime: string;
  updatedBy: string | null;
  active: boolean;
  viewing: boolean;
  pending?: boolean;
  [key: string]:
    | string
    | number
    | null
    | boolean
    | string[]
    | Date
    | undefined
    | Record<string, string[]>;
  source: UniqueDataType;
  destination: UniqueDataType;
  categories: string[];
  uniqueSources: UniqueDataType;
  uniqueDestinations: UniqueDataType;
  uniqueCategories: string[];
  restricted?: boolean;
}

export interface InputEntriesType {
  amountUSD: forms.InputEntryType | null;
  origCurrency: forms.InputEntryType | null;
  keywords: forms.InputEntryType | null;
  flowStatus: forms.InputEntryType | null;
  flowType: forms.InputEntryType | null;
  flowDescription: forms.InputEntryType | null;
  contributionType: forms.InputEntryType | null;
  earmarkingType: forms.InputEntryType | null;
  method: forms.InputEntryType | null;
  beneficiaryGroup: forms.InputEntryType | null;
  inactiveReason: forms.InputEntryType | null;
  amountOriginal: forms.InputEntryType | null;
  exchangeRateUsed: forms.InputEntryType | null;
  notes: forms.InputEntryType | null;
  sourceOrganizations: forms.InputEntryType[];
  sourceLocations: forms.InputEntryType[];
  sourceUsageYears: forms.InputEntryType[];
  sourceProjects: forms.InputEntryType[];
  sourcePlans: forms.InputEntryType[];
  sourceGoverningEntities: forms.InputEntryType[];
  sourceGlobalClusters: forms.InputEntryType[];
  sourceEmergencies: forms.InputEntryType[];
  destinationOrganizations: forms.InputEntryType[];
  destinationLocations: forms.InputEntryType[];
  destinationUsageYears: forms.InputEntryType[];
  destinationProjects: forms.InputEntryType[];
  destinationPlans: forms.InputEntryType[];
  destinationGoverningEntities: forms.InputEntryType[];
  destinationGlobalClusters: forms.InputEntryType[];
  destinationEmergencies: forms.InputEntryType[];
  parentFlow: forms.InputEntryType | null;
  childFlow: forms.InputEntryType[];
}

type UploadedItem = fileUpload.FileUploadResult | FileAssetEntityType;

const reportChannelSchema = t.type({
  value: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
  displayLabel: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
});

const reportDetailsSchema = t.type({
  reportedOrganization: INPUT_SELECT_VALUE_TYPE,
  reportedDate: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
  reportChannel: t.intersection([codecs.NON_EMPTY_STRING, reportChannelSchema]),
  reportFileTitle: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
});

const validationSchema = t.type({
  amountUSD: t.number,
  flowStatus: INPUT_SELECT_VALUE_TYPE,
  flowDescription: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
  firstReported: t.string,
  flowDate: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
  sourceOrganizations: INPUT_SELECT_VALUE_TYPE,
  sourceUsageYears: INPUT_SELECT_VALUE_TYPE,
  destinationOrganizations: INPUT_SELECT_VALUE_TYPE,
  destinationUsageYears: INPUT_SELECT_VALUE_TYPE,
  reportDetails: reportDetailsSchema,
});

interface Props {
  currentVersionData: flowsResponse.FlowREST | null;
  environment: Environment;
  isEdit: boolean;
  initialValue: FormValues;
  prevDetails?: ReportDetailType[];
  versionData?: VersionDataType[];
  flowId?: string;
  versionId?: string;
  isRestricted: boolean;
  errorCorrection?: boolean;
  inputEntries: InputEntriesType;
  initializeInputEntries: () => void;
  rejectInputEntry: (key: string) => void;
  currentVersionID?: number;
  currentFlowID?: number;
  currentVersionActiveStatus?: boolean;
  isPending?: boolean;
  isSuperseded?: boolean;
  isCancelled?: boolean;
  isCancellation?: boolean;
  isNewPending?: boolean;
  isUpdatePending?: boolean;
  canReactive?: boolean;
  isErrorCorrection?: boolean | null;
  isApprovedFlowVersion?: boolean | null;
  pendingFieldsallApplied?: boolean;
  allFieldsReviewed?: boolean;
  pendingVersionV1?: boolean;
}

const StyledRepOrgLink = tw.div`
  flex
  ml-1
`;

const StyledAddChildWarning = tw.div`
  border border-solid border-yellow-600
  flex
  rounded-md
  text-gray-900
  bg-yellow-100 bg-opacity-50
`;

const StyledAddChildWarningIconDiv = tw.div`
  flex
  items-center
  p-1
`;
const StyledAddChildWarningText = tw.span`
  py-3 px-3 pb-3
`;
const StyledLayoutRow = tw.div`
flex
`;
const StyledHalfSection = tw.div`
w-1/2
`;
const StyledFullSection = tw.div`
w-full
mb-6
`;
const StyledRow = tw.div`
flex
gap-4
w-full
`;
const StyledFormRow = tw.div`
flex
gap-2
w-full
items-center
`;
const StyledAnchor = tw.a`
underline
ml-[15px]
opacity-100
`;
const StyledAnchorDiv = tw.div`
text-right
w-full
`;
const StyledRadioDiv = tw.div`
relative
w-full
`;
const StyledFieldset = tw.fieldset`
w-full
box-border
rounded-xl
mt-[16px]
mb-[8px]
border-gray-100
`;
const StyledCurrencyRow = tw.div`
w-1/2
`;
const StyledFormButton = tw(C.Button)`
ml-[25px]
mb-6
`;
const StyledLabel = tw.label`
block
my-4
`;
const StyledLinkedFlowRow = tw.div`
mt-4
`;

const StyledParentInfo = tw.div`
border-0
border-b
border-solid
cursor-pointer
mb-4
pb-4
`;

const StyledStrong = tw.strong`
min-w-[16rem]
inline-block
`;

const StyledList = tw.li`
list-none
`;

const StyledDiv = tw.div`
my-6
me-4
mr-[23px]
lg:flex
justify-end
gap-x-4
bg-white
z-10
`;

const initialReportDetail = {
  verified: 'verified',
  reportSource: 'primary',
  reporterReferenceCode: '',
  reportChannel: '',
  reportFileTitle: '',
  reportedOrganization: { value: '', displayLabel: '' },
  reportedDate: dayjs().format('DD/MM/YYYY'),
  reporterContactInformation: '',
  sourceSystemRecordId: '',
};

const FORM_SETTINGS = {
  organization: {
    behavior: 'shared',
  },
  project: {
    behavior: 'overlap',
  },
  usageYear: {
    behavior: 'shared',
  },
  location: {
    behavior: 'shared',
  },
  globalCluster: {
    behavior: 'shared',
  },
  emergency: {
    behavior: 'overlap',
  },
  governingEntity: {
    behavior: 'shared',
  },
  plan: {
    behavior: 'overlap',
  },
};

const objectTypes = [
  'emergencies',
  'projects',
  'usageYears',
  'globalClusters',
  'locations',
  'plans',
  'organizations',
] as const;

const flowValuesForDisplay = [
  'amountUSD',
  'flowDate',
  'decisionDate',
  'firstReportedDate',
  'budgetYear',
  'origAmount',
  'origCurrency',
  'exchangeRate',
  'activeStatus',
  'restricted',
  'newMoney',
  'description',
  'notes',
] as const;

let parentValue = '';

export const FlowForm = (props: Props) => {
  const {
    currentVersionData,
    environment,
    initialValue,
    isEdit,
    prevDetails,
    versionData,
    isRestricted,
    errorCorrection,
    inputEntries,
    flowId,
    versionId,
    initializeInputEntries,
    rejectInputEntry,
    currentVersionID,
    currentFlowID,
    currentVersionActiveStatus,
    isPending,
    isSuperseded,
    isCancelled,
    isCancellation,
    isNewPending,
    isUpdatePending,
    canReactive,
    pendingFieldsallApplied,
    allFieldsReviewed,
    pendingVersionV1,
  } = props;
  const { confirm } = dialogs;
  const env = getEnv();

  const collapseFlowObjects = (data: any) => {
    data.flowObjects = [];

    collapsePerBehavior(data.dest, 'destination');
    collapsePerBehavior(data.src, 'source');

    function collapsePerBehavior(behaviorArr: any, ref: any) {
      Object.keys(behaviorArr).forEach((type) => {
        behaviorArr[type].forEach((obj: any) => {
          if (
            obj !== null &&
            (!Object.prototype.hasOwnProperty.call(obj, 'cleared') ||
              !obj.cleared)
          ) {
            if (type === 'organization') {
              obj.objectDetail = obj.implementingPartner ? 'partner' : null;
            }

            const flowObj = {
              refDirection: ref,
              objectType: type,
              objectID: obj.id,
              behavior: obj.behavior || null,
              objectDetail: obj.objectDetail,
            };
            data.flowObjects.push(flowObj);
          }
        });
      });
    }

    return data as any;
  };

  const collapseCategories = (data: any) => {
    data.categories = [
      data.flowType,
      data.flowStatuses,
      data.contributionTypes,
      data.method,
      data.childMethod,
      data.keywords,
      data.inactiveReason,
      data.beneficiaryGroup,
      data.pendingStatus,
      data.earmarking !== null && data.earmarking.id,
    ].filter((category) => category);
    data.categories = data.categories
      .map((value: any) => {
        if (value && value.id) {
          return value.id;
        } else if (value[0]) {
          return value[0].id;
        }
      })
      .filter(function (value: any) {
        return value;
      })
      .map((value: any) => {
        return parseInt(value);
      });

    return data;
  };
  const [uploadFileFlag, setUploadFileFlag] = useState<boolean>(false);
  const [uploadFlag, setUploadFlag] = useState<boolean>(false);
  const normalizeFlowData = (values: FormValues) => {
    const fundingObject = {
      src: {
        governingEntity: values.sourceGoverningEntities.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        location: values.sourceLocations.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        organization: values.sourceOrganizations.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        project: values.sourceProjects.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        usageYear: values.sourceUsageYears.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        globalCluster: values.sourceGlobalClusters.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        emergency: values.sourceEmergencies.map((item) => ({
          id: item.value,
          name: item.displayLabel,
          restricted: item.restricted,
        })),
        plan: values.sourcePlans.map((item) => ({
          id: item.value,
          name: item.displayLabel,
          restricted: item.restricted,
        })),
      },
      dest: {
        governingEntity: values.destinationGoverningEntities.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        location: values.destinationLocations.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        organization: values.destinationOrganizations.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        project: values.destinationProjects.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        usageYear: values.destinationUsageYears.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        globalCluster: values.destinationGlobalClusters.map((item) => ({
          id: item.value,
          name: item.displayLabel,
        })),
        emergency: values.destinationEmergencies.map((item) => ({
          id: item.value,
          name: item.displayLabel,
          restricted: item.restricted,
        })),
        plan: values.destinationPlans.map((item) => ({
          id: item.value,
          name: item.displayLabel,
          restricted: item.restricted,
        })),
      },
    };

    let data = {
      id: isEdit && currentFlowID ? currentFlowID : null,
      versionID: isEdit && currentVersionID ? currentVersionID : null,
      amountUSD: values.amountUSD,
      flowDate: dayjs(values.flowDate, 'DD/MM/YYYY').format(
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
      ),
      decisionDate: values.decisionDate
        ? dayjs(values.decisionDate, 'DD/MM/YYYY').format(
            'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
          )
        : null,
      firstReportedDate: dayjs(values.firstReported, 'DD/MM/YYYY').format(
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
      ),
      budgetYear: values.budgetYear,
      origAmount: values.amountOriginal ? values.amountOriginal : null,
      origCurrency: (values.origCurrency as AutoCompleteSelectionType)
        ? (values.origCurrency as AutoCompleteSelectionType)?.displayLabel
        : null,
      exchangeRate: values.exchangeRateUsed ? values.exchangeRateUsed : null,
      activeStatus: true,
      restricted: false,
      newMoney: true,
      description: values.flowDescription,
      versionStartDate: currentVersionData?.versionStartDate,
      versionEndDate: currentVersionData?.versionEndDate,
      flowObjects: collapseFlowObjects(fundingObject),
      children:
        values.childFlow &&
        values.childFlow.map((item: any, index: number) => {
          return {
            childID: JSON.parse(item.value as string).id,
            origCurrency: JSON.parse(item.value as string).origCurrency,
          };
        }),
      parents:
        values.parentFlow &&
        values.parentFlow.map((item: any, index: number) => {
          return {
            Parent: {
              parentID: JSON.parse(item.value as string).id,
              origCurrency: JSON.parse(item.value as string).origCurrency,
            },
            childID: currentFlowID,
            parentID: JSON.parse(item.value as string).id,
            origCurrency: JSON.parse(item.value as string).origCurrency,
            id: JSON.parse(item.value as string).id,
            parents:
              values.parentFlow &&
              values.parentFlow.map((key: any) => {
                return {
                  child: JSON.parse(key.value as string).id,
                  parentID: 271736,
                };
              }),
          };
        }),
      reportDetails: values.reportDetails.map((item, index) => {
        return {
          contactInfo: item.reporterContactInformation,
          source: item.reportSource,
          date: dayjs(item.reportedDate, 'DD/MM/YYYY').format(
            'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
          ),
          versionID: currentVersionID,
          newlyAdded: addReportFlag,
          sourceID: null,
          refCode: '7F-10073.04',
          verified: true,
          organizationID: item.reportedOrganization.value,
          categories: [item.reportChannel && item.reportChannel.value],
          organization: {
            id: item.reportedOrganization.value,
            name: item.reportedOrganization.displayLabel,
          },
          reportFiles:
            uploadFlag &&
            uploadedFileArray[index] &&
            (uploadedFileArray[index] as { id?: number })?.id
              ? uploadFlag || uploadFileFlag
                ? [
                    {
                      title: item.reportUrlTitle,
                      type: 'url',
                      url: item.reportUrl,
                    },
                    {
                      fileAssetID:
                        uploadedFileArray[index] &&
                        (uploadedFileArray[index] as { id?: number })?.id,
                      reportFiles: [
                        {
                          fieldType: 'file',
                          fileAssetID:
                            uploadedFileArray[index] &&
                            (uploadedFileArray[index] as { id?: number })?.id,
                          type: 'file',
                        },
                      ],
                      title: item.reportFileTitle,
                      type: 'file',
                    },
                  ]
                : [
                    {
                      title: item.reportUrlTitle,
                      type: 'url',
                      url: item.reportUrl,
                    },
                  ]
              : uploadFileFlag
              ? [
                  {
                    title: item.reportUrlTitle,
                    type: 'url',
                    url: item.reportUrl,
                  },
                ]
              : item.reportFiles
              ? item.reportFiles
              : [],

          reportChannel: {
            group: 'reportChannel',
            id: item.reportChannel && item.reportChannel.value,
            name: item.reportChannel && item.reportChannel.displayLabel,
          },
        };
      }),
      flowType: {
        id: values.flowType && values.flowType.value,
        name: values.flowType && values.flowType.displayLabel,
        group: 'flowType',
      },
      keywords: values.keywords.map((item) => ({
        id: item.value,
        name: item.displayLabel,
        group: 'keywords',
      })),
      flowStatuses: {
        id: values.flowStatus && values.flowStatus.value,
        name: values.flowStatus && values.flowStatus.displayLabel,
        group: 'flowStatus',
      },
      contributionTypes: {
        id: values.contributionType && values.contributionType.value,
        name: values.contributionType && values.contributionType.displayLabel,
        group: 'contributionType',
      },
      method: {
        id: values.method && values.method.value,
        name: values.method && values.method.displayLabel,
        group: 'method',
      },
      childMethod: values.cashTransfer && {
        id: values.cashTransfer.value,
        name: values.cashTransfer.displayLabel,
        group: 'method',
        parentID: values.method && values.method.value,
      },
      earmarking: values.earmarkingType
        ? {
            id: values.earmarkingType.value,
            name: values.earmarkingType.displayLabel,
            group: 'earmarkingType',
          }
        : null,
      categories: [] as (string | number)[],
      isCancellation: isPending ? true : !isPending ? false : null,
      cancelled: isPending && isCancellation ? true : null,
      pendingStatus: isPending ? true : !isPending ? false : [],
      planEntities: isPending ? true : !isPending ? false : [],
      planIndicated: isPending ? true : !isPending ? false : [],
      isApprovedFlowVersion:
        rejectFlag && approveFlag
          ? true
          : !(rejectFlag && approveFlag)
          ? false
          : null,
      inactiveReason: [
        {
          id: null as null | number | string,
          name: '' as string | undefined,
          description: null,
          parentID: null,
          code: null,
          group: '',
          includeTotals: null,
          createdAt: '',
          updatedAt: '',
        },
      ],
      isErrorCorrection: errorCorrection
        ? true
        : isSuperseded
        ? true
        : isPending
        ? true
        : !isSuperseded && !isPending
        ? false
        : null,
      rejected: rejectFlag ? true : !rejectFlag ? false : null,
      versions:
        versionData &&
        versionData.map((item: VersionDataType) => {
          const items = {
            id: item.flowId,
            versionID: item.versionId,
            activeStatus: item.activeStatus,
            isPending: item.isPending ? item.isPending : false,
            isCancelled: item.isCancelled ? item.isCancelled : false,
          };
          return items;
        }),
      ...fundingObject,
    };

    data = collapseCategories(data);
    return data;
  };

  const [unsavedChange, setUnsavedChange] = useState<boolean>(false);
  const [parentCurrencyFlag, setParentCurrencyFlag] = useState<boolean>(false);
  const [childCurrencyFlag, setChildCurrencyFlag] = useState<boolean>(false);
  const [approveFlag, setApproveFlag] = useState<boolean>(false);
  const [rejectFlag, setRejectFlag] = useState<boolean>(false);
  const [validationFlag, setValidationFlag] = useState<boolean>(false);
  const [inactiveFlag, setInactiveFlag] = useState<boolean>(false);
  const [uploadedFileArray, setUploadedFileArray] = useState<UploadedItem[]>([
    {},
  ]);
  const [addReportFlag, setAddReportFlag] = useState<boolean>(false);
  const [alertFlag, setAlertFlag] = useState<boolean>(false);
  const [sharePath, setSharePath] = useSharePath('');
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [linkCheck, setLinkCheck] = useState<boolean>(false);
  const handleSave = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false);
  const [objects, setObjects] = useState<Record<string, any[]>>({});
  const [showingTypes, setShowingTypes] = useState<string[]>([]);
  const [newMoneyCheckboxDisabled, setNewMoneyCheckboxDisabled] =
    useState<boolean>(false);

  const [comparingVersions, setComparingVersions] = useState<VersionDataType[]>(
    []
  );
  const [comparedVersions, setComparedVersions] = useState<VersionDataType[]>(
    []
  );
  const [showSourceGoverningEntities, handleShowSourceGoverningEntities] =
    useState<boolean>(false);
  const [
    showDestinationGoverningEntities,
    handleShowDestinationGoverningEntities,
  ] = useState<boolean>(false);
  const [sourceGoverningEntities, setSourceGoverningEntities] =
    useState<governingEntities.GetGoverningEntityResult>([]);
  const [destinationGoverningEntities, setDestinationGoverningEntities] =
    useState<governingEntities.GetGoverningEntityResult>([]);
  const [isShowParentFlow, setShowParentFlow] = useState(
    initialValue.parentFlow && initialValue.parentFlow.length ? true : false
  );
  const [isShowChildFlow, setShowChildFlow] = useState(0);
  const [openAlerts, setOpenAlerts] = useState<
    { message: string; id: number }[]
  >([]);
  const [alertId, setAlertId] = useState(0);
  const handleClose = (id: number) => {
    setOpenAlerts(openAlerts.filter((alert) => alert.id !== id));
  };
  const buttonText = 'Calculate The Exchange Rate';

  const handleCalculateExchangeRate = (values: any, setFieldValue: any) => {
    const { amountOriginal, amountUSD } = values;

    if (amountOriginal && amountUSD) {
      const exchangeRateUsed = amountOriginal / amountUSD;
      setFieldValue('exchangeRateUsed', exchangeRateUsed.toFixed(4));
    } else if (amountOriginal && !amountUSD) {
      const calculatedAmountUSD = amountOriginal / values.exchangeRateUsed;
      setFieldValue('amountUSD', calculatedAmountUSD.toFixed(4));
    } else if (!amountOriginal && amountUSD) {
      const calculatedAmountOriginal = amountUSD * values.exchangeRateUsed;
      setFieldValue('amountOriginal', calculatedAmountOriginal.toFixed(4));
    } else {
      console.warn('Both original amount and USD amount are missing.');
    }
  };
  useEffect(() => {
    if (initialValue?.childFlow) {
      setShowChildFlow(initialValue?.childFlow.length);
    }
  }, [initialValue]);
  useEffect(() => {
    const fileAssets: FileAssetEntityType[] = [];
    if (isEdit) {
      initialValue.reportDetails.forEach((detail) => {
        if (detail?.fileAsset) {
          fileAssets.push(detail.fileAsset);
          setUploadedFileArray(fileAssets);
        } else {
          fileAssets.push({} as FileAssetEntityType);
          setUploadedFileArray(fileAssets);
        }
      });
    }
  }, [initialValue.reportDetails]);
  useEffect(() => {
    if (currentVersionActiveStatus) {
      setReadOnly(false);
    } else {
      setReadOnly(true);
    }
  }, [currentVersionActiveStatus]);
  useEffect(() => {
    if (initialValue.parentFlow && initialValue.parentFlow.length) {
      setShowParentFlow(true);
    }
  }, [initialValue.parentFlow]);
  const [remove, setRemove] = useState<boolean>(false);
  const handleRemove = (index: number, values: FormValues) => {
    if (window.confirm('Are you sure you want to remove this file?')) {
      if (
        initialValue.reportDetails[index].reportFiles &&
        initialValue.reportDetails[index].reportFiles[0]?.fileName
      ) {
        values.reportDetails[index].reportFileTitle = '';
        initialValue.reportDetails[index].reportFiles[0].fileName = '';
        initialValue.reportDetails[index].reportFiles[0].title = '';
        initialValue.reportDetails[index].reportFiles[0].fileAssetID =
          undefined;
        initialValue.reportDetails[index].reportFiles[0].UploadFileUrl = '';
        const updatedArray = removeByIndexFromArray(uploadedFileArray, index);
        setUploadedFileArray(updatedArray);
      } else return;
      setUploadFlag(false);
      setRemove(true);
    } else return;
  };
  const removeByIndexFromArray = (array: UploadedItem[], index: number) => {
    const newArray = [...array];
    newArray[index] = {};
    return newArray;
  };
  if (remove === true) setRemove(false);
  const SourceLink = (
    setFieldValue: any,
    values: FormValues,
    indexKey: number,
    index: number
  ) => {
    setFieldValue(
      `reportDetails[${index}].reportedOrganization`,
      values.sourceOrganizations[indexKey]
    );
  };
  const DestinationLink = (
    setFieldValue: any,
    values: FormValues,
    indexKey: number,
    index: number
  ) => {
    setFieldValue(
      `reportDetails[${index}].reportedOrganization`,
      values.destinationOrganizations[indexKey]
    );
  };

  interface Inconsistency {
    type: string;
    values: {
      name?: string;
      year?: string;
      refDirection: string;
      options?: { name: string }[];
    }[];
  }

  const processDataInconsistencies = (
    inconsistencyArray: Inconsistency[]
  ): string => {
    let message = '';
    inconsistencyArray.forEach((inconsistencyWith) => {
      if (inconsistencyWith && inconsistencyWith.type) {
        const inconsistencyType = inconsistencyWith.type;
        message +=
          inconsistencyType.charAt(0).toUpperCase() +
          inconsistencyType.slice(1) +
          ': ';

        if (inconsistencyWith.type === 'no-direct-link') {
          message += inconsistencyWith.values.join(', ');
        } else {
          message +=
            inconsistencyWith.values
              .map((value) => {
                const name = value.name || value.year;
                let joinedOptions = '';
                if (value.options) {
                  joinedOptions = value.options
                    .map((option) => {
                      return option.name || JSON.stringify(option);
                    })
                    .join(', ');
                }
                const options = `is not in the list of acceptable ${value.refDirection} ${inconsistencyType}: [${joinedOptions}]`;
                return `'${name}' ${options}`;
              })
              .join(', ') + '. ';
        }
      } else {
        message += JSON.stringify(inconsistencyArray);
      }
    });
    return message;
  };

  const handleSubmit = async (
    values: FormValues,
    submitAction: string | undefined
  ) => {
    if (values.childFlow) {
      for (let i = 0; i < values.childFlow.length; i++) {
        if (
          values.destinationUsageYears.length >= 2 &&
          JSON.parse(values.childFlow[i].value as string).activeStatus === true
        ) {
          values.flowType = {
            displayLabel: 'Parked',
            value: '1252',
          };
        }
      }
    }
    if (isShowParentFlow && isShowChildFlow > 0) {
      let childAmountSum = 0;
      let parentAmountSum = 0;
      values.childFlow &&
        values.childFlow.map((item, _index) => {
          childAmountSum += JSON.parse(item.value.toString())
            ? parseInt(JSON.parse(item.value.toString()).amountUSD)
            : 0;
        });
      values.parentFlow &&
        values.parentFlow.map((item, _index) => {
          parentAmountSum += JSON.parse(item.value.toString())
            ? parseInt(JSON.parse(item.value.toString()).amountUSD)
            : 0;
        });
      if (childAmountSum > parentAmountSum) {
        if (
          !window.confirm(
            `Please note, the Funding Amount on this parent flow ($${parentAmountSum}) is less than the sum of its children's amount ($${childAmountSum}). Do you want to proceed?`
          )
        ) {
          return;
        }
      }
    }
    if (isShowParentFlow || isShowChildFlow > 0) {
      let childAmountSum = 0;
      values.childFlow &&
        values.childFlow.map((item, _index) => {
          childAmountSum += JSON.parse(item.value.toString())
            ? parseInt(JSON.parse(item.value.toString()).amountUSD)
            : 0;
        });
      if (childAmountSum > values.amountUSD) {
        if (
          !window.confirm(
            `Please note, the Funding Amount on this parent flow ($${values.amountUSD}) is less than the sum of its children's amount ($${childAmountSum}). Do you want to proceed?`
          )
        )
          return;
      }
    }
    const parentFlow = values.parentFlow;
    if (parentFlow?.length) {
      for (let index = 0; index < parentFlow.length; index++) {
        const item = parentFlow[index];
        if (
          (typeof values?.origCurrency !== 'string' &&
            values.origCurrency?.displayLabel) ||
          !(
            JSON.parse(item.value.toString()) &&
            JSON.parse(item.value.toString())?.origCurrency === null
          )
        ) {
          if (
            (typeof values?.origCurrency !== 'string' &&
              values.origCurrency?.displayLabel) !==
            (JSON.parse(item.value.toString()) &&
              JSON.parse(item.value.toString())?.origCurrency)
          ) {
            handleSave();
            setParentCurrencyFlag(true);
            return;
          }
        }
      }
    }
    const childFlow = values.childFlow;
    if (childFlow) {
      for (let index = 0; index < childFlow.length; index++) {
        const item = childFlow[index];
        if (
          (typeof values?.origCurrency !== 'string' &&
            values.origCurrency?.displayLabel) ||
          !(
            JSON.parse(item.value.toString()) &&
            JSON.parse(item.value.toString())?.origCurrency === null
          )
        ) {
          if (
            (typeof values.origCurrency !== 'string' &&
              values.origCurrency?.displayLabel) !==
            (JSON.parse(item.value.toString()) &&
              JSON.parse(item.value.toString()).origCurrency)
          ) {
            handleSave();
            setChildCurrencyFlag(true);
            return;
          }
        }
      }
    }
    for (let i = 0; i < values.reportDetails.length; i++) {
      if (
        values.reportDetails[i].reportUrlTitle &&
        values.reportDetails[i].reportUrl
      ) {
        setUploadFileFlag(true);
      } else setUploadFileFlag(false);
    }
    const data = normalizeFlowData(values);
    const inactiveReasons = await fetchCategory('inactiveReason')();
    if (submitAction === 'approve') {
      data.isApprovedFlowVersion = true;
    } else if (submitAction === 'rejected') {
      data.activeStatus = false;
      data.rejected = true;
      data.inactiveReason = [
        {
          id:
            inactiveReasons.find((item) => item.displayLabel === 'Rejected')
              ?.value || null,
          name: inactiveReasons.find((item) => item.displayLabel === 'Rejected')
            ?.displayLabel,
          description: null,
          parentID: null,
          code: null,
          group: 'inactiveReason',
          includeTotals: null,
          createdAt: currentVersionData
            ? dayjs(currentVersionData.createdAt, 'DD/MM/YYYY').format(
                'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
              )
            : '',
          updatedAt: currentVersionData
            ? dayjs(currentVersionData.updatedAt, 'DD/MM/YYYY').format(
                'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
              )
            : '',
        },
      ];
    } else if (submitAction === 'inactive') {
      if (isShowParentFlow || isShowChildFlow > 0) {
        setInactiveFlag(true);
      } else {
        const categoryValue =
          inactiveReasons.find((item) => item.displayLabel === 'Cancelled')
            ?.value ?? null;
        if (categoryValue) {
          data.categories.push(parseInt(categoryValue.toString()));
        }
        data.activeStatus = false;
        data.cancelled = true;
        data.isCancellation = null;
        data.rejected = null;
        data.newMoney = false;
        data.inactiveReason = [
          {
            id:
              inactiveReasons.find((item) => item.displayLabel === 'Cancelled')
                ?.value || null,
            name: inactiveReasons.find(
              (item) => item.displayLabel === 'Cancelled'
            )?.displayLabel,
            description: null,
            parentID: null,
            code: null,
            group: 'inactiveReason',
            includeTotals: null,
            createdAt: currentVersionData ? currentVersionData.createdAt : '',
            updatedAt: currentVersionData ? currentVersionData.updatedAt : '',
          },
        ];
      }
    }
    if (!inactiveFlag) {
      const response = await env.model.flows.validateFlow(data, {
        adding: !isEdit,
        originalFlow: {},
      });
      let flag = true;
      let mismatchFound = false;
      for (let i = 0; i < values.reportDetails.length; i++) {
        const reportOrganizationLabel =
          values.reportDetails[i].reportedOrganization.displayLabel;
        const reportMatchesSource = values.sourceOrganizations.some(
          (sourceOrg) => sourceOrg.displayLabel === reportOrganizationLabel
        );
        const reportMatchesDestination = values.destinationOrganizations.some(
          (destOrg) => destOrg.displayLabel === reportOrganizationLabel
        );

        if (!reportMatchesSource && !reportMatchesDestination) {
          mismatchFound = true;
          break;
        }
      }
      if (mismatchFound) {
        if (
          !window.confirm(
            "Your flow's Report Detail organization doesn't match the source or destination organization or that of its parked parent. Are you sure this is right?"
          )
        ) {
          return;
        }
      }
      response.forEach((obj) => {
        if (obj) {
          const { success, message, confirmed } = obj;
          if (!success) {
            if (confirmed) {
              const confirm = window.confirm(confirmed);
              if (!confirm) {
                setOpenAlerts([...openAlerts, { message, id: alertId }]);
                setAlertId((prevId) => prevId + 1);
                flag = false;
                handleSave();
              }
            } else if (message) {
              setOpenAlerts([...openAlerts, { message, id: alertId }]);
              setAlertId((prevId) => prevId + 1);
              flag = false;
              handleSave();
            }
          }
        }
      });
      if (flag && !(isShowParentFlow || isShowChildFlow > 0)) {
        setUnsavedChange(false);
        if (!isEdit) {
          try {
            const response = await env.model.flows.createFlow({ flow: data });
            const path = editFlowSetting(response.id, response.versionID);
            window.open(path, '_self');
          } catch (err: any) {
            setOpenAlerts([
              ...openAlerts,
              { message: err.message, id: alertId },
            ]);
            setAlertId((prevId) => prevId + 1);
            handleSave();
          }
        } else {
          const dbFlow = await env.model.flows.getFlowREST({
            id: currentFlowID!,
          });
          if (
            (versionData &&
              currentVersionID &&
              Date.parse(versionData[currentVersionID - 1].updatedTime) <
                Date.parse(dbFlow.updatedAt)) ||
            (versionData && versionData.length < dbFlow.versions.length)
          ) {
            window.confirm(
              'This flow cannot be saved, as a concurrency conflict has been detected. Please refresh your screen to view the most up to date data.'
            );
          } else {
            if (isPending && (approveFlag || rejectFlag)) {
              if (
                allFieldsReviewed ||
                pendingFieldsallApplied ||
                !pendingVersionV1
              ) {
                try {
                  const response = await env.model.flows.updatePendingFlow({
                    flow: data,
                  });
                  if (response) {
                    const path = editFlowSetting(
                      response.id,
                      response.versionID
                    );
                    setAlertFlag(true);
                    setSharePath(path);
                  }
                } catch (err: any) {
                  setOpenAlerts([
                    ...openAlerts,
                    { message: err.message, id: alertId },
                  ]);
                  setAlertId((prevId) => prevId + 1);
                  handleSave();
                }
              } else {
                window.confirm(
                  'Some of the revised data on this flow still needs to be accepted or rejected before this update can be approved.'
                );
              }
            } else {
              try {
                const response = await env.model.flows.updateFlow({
                  flow: data,
                });
                if (response) {
                  const path = editFlowSetting(response.id, response.versionID);
                  setAlertFlag(true);
                  setSharePath(path);
                }
              } catch (err: any) {
                let errmessage = '';
                if (err.reason) {
                  const inconsistencyObject = err.reason;
                  errmessage = processDataInconsistencies(inconsistencyObject);
                } else {
                  const lastIndex = err.message.lastIndexOf(':');
                  errmessage = err.message.substring(lastIndex + 1);
                }
                setOpenAlerts([
                  ...openAlerts,
                  { message: errmessage, id: alertId },
                ]);
                setAlertId((prevId) => prevId + 1);
                handleSave();
              }
            }
          }
        }
      }
    }
  };
  const navigate = useNavigate();
  const handleCopy = (values: FormValues) => {
    if (currentFlowID && currentVersionID) {
      const isCopy = true;
      const path = copyFlow();
      if (typeof path === 'string') {
        const valuesWithFiles = { ...values, isCopy };
        navigate(path, { state: valuesWithFiles });
      } else {
        console.error('Path is not a string', path);
      }
    }
  };

  const handleAlert = (values: FormValues) => {
    const errors = validateForm(values);
    if (Object.keys(errors).length !== 0) {
      setValidationFlag(true);
      handleSave();
    }
  };

  const setObjectsWithArray = (
    fetchedObject: any,
    objectKeys: string[],
    settingArrayKeys: string[],
    setFieldValue: any,
    values: any
  ) => {
    const newObjects = { ...objects };
    const newShowingTypes = [...showingTypes];
    objectKeys.forEach((key, i) => {
      if (fetchedObject[settingArrayKeys[i]]) {
        newObjects[key] = checkIfExistingAndCopy(
          newObjects[key],
          fetchedObject,
          settingArrayKeys[i]
        );
      }

      const parsedResponse = newObjects[key].map((responseValue: any) => {
        if (settingArrayKeys[i] === 'years') {
          return {
            displayLabel:
              (responseValue as usageYears.UsageYear).year ||
              responseValue.displayLabel,
            value: responseValue.id || responseValue.value,
            isAutoFilled: responseValue.suggested,
          };
        } else if (settingArrayKeys[i] === 'plans') {
          return {
            displayLabel:
              (responseValue.planVersion as { planId: number; name: string })
                .name || responseValue.displayLabel,
            value: responseValue.planVersion.planId || responseValue.value,
            isAutoFilled: responseValue.suggested,
          };
        } else if (settingArrayKeys[i] === 'governingEntities') {
          return {
            displayLabel:
              (
                responseValue.governingEntityVersion as {
                  id: number;
                  name: string;
                }
              ).name || responseValue.displayLabel,
            value:
              responseValue.governingEntityVersion.id || responseValue.value,
            isAutoFilled: responseValue.suggested,
          };
        } else {
          return {
            displayLabel:
              (responseValue as { id: number; name: string }).name ||
              responseValue.displayLabel,
            value: responseValue.id || responseValue.value,
            isAutoFilled: responseValue.suggested,
          };
        }
      });
      newObjects[key].forEach((obj) => {
        if (obj?.suggested) {
          updateFlowObjects(key, parsedResponse, setFieldValue, values);
          obj.suggested = false;
        }
      });
      setFieldValue(key, parsedResponse);
    });

    setObjects(newObjects);
    setShowingTypes(newShowingTypes);
  };

  const checkIfExistingAndCopy = (
    existingObjects: any[],
    object: any,
    key: string
  ): any[] => {
    let newObjects = object[key];
    if (key === 'locations') {
      newObjects = newObjects.filter(function (location: any) {
        return location.adminLevel === 0;
      });
      if (existingObjects && existingObjects.length) {
        existingObjects = existingObjects.filter(function (location) {
          return location.adminLevel === 0 || location.value;
        });
      }
    }

    if (existingObjects && existingObjects.length) {
      const existingObjectsIds = existingObjects.map(function (o) {
        return o.id || o.value;
      });
      if (Array.isArray(newObjects)) {
        newObjects.forEach(function (obj) {
          if (existingObjectsIds.indexOf(obj.id) === -1) {
            obj.suggested = true;
            existingObjects.push(obj);
          }
        });
      } else {
        if (existingObjectsIds.indexOf(newObjects.id) === -1) {
          newObjects.suggested = true;
          existingObjects.push(newObjects);
        }
      }
    } else {
      if (newObjects) {
        if (Array.isArray(newObjects)) {
          newObjects.forEach(function (obj) {
            obj.suggested = true;
          });
          existingObjects = newObjects;
        } else {
          newObjects.suggested = true;
          existingObjects = [newObjects];
        }
      }
    }
    return existingObjects;
  };
  const fetchPlanDetails = async (
    objectType: string,
    plan: any,
    setFieldValue: any,
    values?: any
  ) => {
    const fetchedPlan = await environment.model.plans.getPlan(plan[0].value);
    if (objectType === 'sourcePlans') {
      setObjectsWithArray(
        fetchedPlan,
        ['sourceUsageYears', 'sourceEmergencies'],
        ['years', 'emergencies'],
        setFieldValue,
        values
      );
      setSourceGoverningEntities(fetchedPlan.governingEntities);
    }
    if (objectType === 'destinationPlans') {
      setObjectsWithArray(
        fetchedPlan,
        ['destinationUsageYears', 'destinationEmergencies'],
        ['years', 'emergencies'],
        setFieldValue,
        values
      );
      setDestinationGoverningEntities(fetchedPlan.governingEntities);
    }
    if (fetchedPlan.locations) {
      const countries = fetchedPlan.locations.filter(function (loc) {
        return loc.adminLevel === 0;
      });
      if (countries.length === 1) {
        if (objectType === 'sourcePlans') {
          setObjectsWithArray(
            { locations: countries },
            ['sourceLocations'],
            ['locations'],
            setFieldValue,
            values
          );
        }
        if (objectType === 'destinationPlans') {
          setObjectsWithArray(
            { locations: countries },
            ['destinationLocations'],
            ['locations'],
            setFieldValue,
            values
          );
        }
      }
    }
  };

  const fetchEmergencyDetails = async (
    objectType: string,
    emergency: any,
    setFieldValue: any,
    values?: any
  ) => {
    if (objectType === 'destinationEmergencies') {
      const fetchedEmergency = await environment.model.emergencies.getEmergency(
        emergency[0].value
      );
      if (fetchedEmergency.locations.length <= 1) {
        setObjectsWithArray(
          fetchedEmergency,
          ['destinationLocations'],
          ['locations'],
          setFieldValue,
          values
        );
      }
    }
  };
  const fetchProjectDetails = async (
    objectType: string,
    project: any,
    setFieldValue: any,
    values?: any
  ) => {
    const fetchedProject = await environment.model.projects.getProject(
      project[0].value
    );
    const publishedVersion = fetchedProject.projectVersions.filter(
      function (version) {
        return version.id === fetchedProject.currentPublishedVersionId;
      }
    )[0];
    if (objectType === 'destinationProjects') {
      const fetchedCategories =
        await environment.model.categories.getCategories({
          query: 'earmarkingType',
        });
      const category = fetchedCategories.filter(
        (item) => item.name === 'Earmarked'
      );
      setFieldValue('earmarkingType', {
        value: category[0],
        displayLabel: category[0].name,
      });
      setObjectsWithArray(
        publishedVersion,
        [
          'destinationPlans',
          'destinationLocations',
          'destinationGoverningEntities',
          'destinationGlobalClusters',
          'destinationOrganizations',
        ],
        [
          'plans',
          'locations',
          'governingEntities',
          'globalClusters',
          'organizations',
        ],
        setFieldValue,
        values
      );
    } else {
      setObjectsWithArray(
        publishedVersion,
        [
          'sourcePlans',
          'sourceLocations',
          'sourceGoverningEntities',
          'sourceGlobalClusters',
          'sourceOrganizations',
        ],
        [
          'plans',
          'locations',
          'governingEntities',
          'globalClusters',
          'organizations',
        ],
        setFieldValue,
        values
      );
    }
  };
  const fetchOrganizationDetails = async (
    objectType: string,
    organization: any,
    setFieldValue: any,
    values?: any
  ) => {
    const fetchedOrg =
      await environment.model.organizations.getOrganizationsById(
        organization[0].value
      );
    const isGovernment = (fetchedOrg[0].categories ?? []).some(
      function (category) {
        return (
          category.group === 'organizationType' &&
          [114, 123].includes(category.id)
        );
      }
    );
    if (isGovernment && objectType === 'sourceOrganizations') {
      objects.sourceLocations = checkIfExistingAndCopy(
        objects.location,
        fetchedOrg[0],
        'locations'
      );
      setObjectsWithArray(
        objects,
        ['sourceLocations'],
        ['locations'],
        setFieldValue,
        values
      );
    }
  };
  const fetchAssociatedGoverningEntity = async (
    objectType: string,
    globalCluster: any,
    setFieldValue: any,
    values?: any
  ) => {
    if (
      (values.sourcePlans.length === 0 &&
        objectType === 'sourceGlobalClusters') ||
      (values.destinationPlans.length === 0 &&
        objectType === 'destinationGlobalClusters')
    ) {
      return;
    }
    let plan = null;
    let targetGoverningEntities: any = null;
    if (objectType === 'sourceGlobalClusters') {
      plan = values.sourcePlans[0];
      targetGoverningEntities = values.sourceGoverningEntities;
    } else {
      plan = values.destinationPlans[0];
      targetGoverningEntities = values.destinationGoverningEntities;
    }
    const fetchedGoverningEntities =
      await environment.model.governingEntities.getAllPlanGoverningEntities(
        plan.value
      );
    const hasGoverningEntitiesWithoutGlobalCluster =
      Array.isArray(targetGoverningEntities) &&
      fetchedGoverningEntities
        .filter(function (fetchedGe) {
          return targetGoverningEntities.find(function (selectedGe: any) {
            return fetchedGe.id === selectedGe.value;
          });
        })
        .some(function (fetchedGe) {
          return (
            Array.isArray(fetchedGe.globalClusterIds) &&
            !fetchedGe.globalClusterIds.length
          );
        });

    if (hasGoverningEntitiesWithoutGlobalCluster) {
      return;
    }
    const governingEntities = fetchedGoverningEntities.filter(
      function (governingEntity) {
        return (
          governingEntity.globalClusterIds.indexOf(
            globalCluster[globalCluster.length - 1].value
          ) > -1
        );
      }
    );

    if (governingEntities.length) {
      governingEntities.forEach(function (governingEntity) {
        setObjectsWithArray(
          { governingEntities: governingEntity },
          [
            objectType === 'sourceGlobalClusters'
              ? 'sourceGoverningEntities'
              : 'destinationGoverningEntities',
          ],
          ['governingEntities'],
          setFieldValue,
          values
        );
      });
    }
  };

  const fetchKeywords = async (
    objectType: string,
    usageYears: any,
    setFieldValue: any,
    values?: any
  ) => {
    if (usageYears.length === 2) {
      const fetchedCategories =
        await environment.model.categories.getCategories({
          query: 'keywords',
        });
      const category = fetchedCategories.filter(
        (item) => item.name === 'Multiyear'
      );

      const mergedKeywords = [
        ...values.keywords,
        ...[
          {
            value: category[0].id,
            displayLabel: category[0].name,
          },
        ].filter(
          (item2) =>
            !values.keywords.some((item1: any) => item1.value === item2.value)
        ),
      ];

      setFieldValue('keywords', mergedKeywords);
    } else if (usageYears.length === 1) {
      const filteredKeywords = values.keywords.filter(
        (item: any) => item.displayLabel !== 'Multiyear'
      );
      setFieldValue('keywords', filteredKeywords);
    }
  };

  const handleCompareCheck = (
    checkedVersion: VersionDataType,
    isChecked: boolean
  ) => {
    setComparingVersions((prev: VersionDataType[]) => {
      if (isChecked) {
        return [...prev, checkedVersion];
      } else {
        return prev.filter(
          (version: VersionDataType) =>
            version.versionId !== checkedVersion.versionId
        );
      }
    });
  };

  const fetchDownload = async (index: number) => {
    const fileAssetID =
      initialValue.reportDetails[index]?.reportFiles[0]?.fileAssetID;
    const name = initialValue.reportDetails[index]?.reportFiles[0]?.fileName;
    if (fileAssetID) {
      try {
        const responseData =
          await environment?.model.fileUpload.fileDownloadModel(fileAssetID);
        if (responseData) {
          const data = new Blob([responseData]);
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name ? name : 'downloaded_file'}`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 0);
        } else {
          console.error('No data received for download');
        }
      } catch (error) {
        console.error(error, 'error');
      }
    }
  };

  const fetchCategory = useCallback(
    (category: string) => {
      return async () => {
        const response = await environment.model.categories.getCategories({
          query: category,
        });
        return response.map(
          (responseValue): categoryType => ({
            displayLabel: responseValue.name,
            value: responseValue.id.toString(),
            parentID: responseValue.parentID,
          })
        );
      };
    },
    [environment]
  );
  const extractUniqueFromArray = (array1: string[], array2: string[]) => {
    return array1.filter((item: string) => !array2.includes(item));
  };

  const compareVersions = (versions: VersionDataType[]) => {
    const version1 = versions[0];
    const version2 = versions[1];
    const newVersion1 = {
      ...version1,
      uniqueSources: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version1.source[type],
            version2.source[type]
          );
          return acc;
        },
        {}
      ),
      uniqueDestinations: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version1.destination[type],
            version2.destination[type]
          );
          return acc;
        },
        {}
      ),
      uniqueCategories: extractUniqueFromArray(
        version1.categories,
        version2.categories
      ),
    };

    const newVersion2 = {
      ...version2,
      uniqueSources: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version2.source[type],
            version1.source[type]
          );
          return acc;
        },
        {}
      ),
      uniqueDestinations: objectTypes.reduce<Record<string, string[]>>(
        (acc, type) => {
          acc[type] = extractUniqueFromArray(
            version2.destination[type],
            version1.destination[type]
          );
          return acc;
        },
        {}
      ),
      uniqueCategories: extractUniqueFromArray(
        version2.categories,
        version1.categories
      ),
    };
    return [newVersion1, newVersion2];
  };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setUploadFlag(true);
    try {
      const setFile: File | undefined = (event.target as HTMLInputElement)
        .files?.[0];
      if (setFile instanceof File) {
        const responseData =
          await environment.model.fileUpload.fileUploadModel(setFile);
        setUploadedFileArray((prevUploadedFile) => {
          const updateUploadedFile = [...prevUploadedFile];
          updateUploadedFile[index] = responseData;
          return updateUploadedFile;
        });
        console.log(uploadedFileArray, 'uploadedFileArray');
      } else {
        console.error('No file selected for upload.');
      }
    } catch (error) {
      console.log(error, 'error');
    }
  };
  useEffect(() => {
    if (comparingVersions.length === 2) {
      const compared = compareVersions(comparingVersions);
      setComparedVersions(compared);
    }
  }, [comparingVersions]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChange) {
        const message =
          'You have unsaved changes! Are you sure you want to leave?';
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChange]);

  useEffect(() => {
    const valuesObject: Record<string, any[]> = {
      sourceOrganizations: initialValue.sourceOrganizations,
      sourceLocations: initialValue.sourceLocations,
      sourceUsageYears: initialValue.sourceUsageYears,
      sourceProjects: initialValue.sourceProjects,
      sourcePlans: initialValue.sourcePlans,
      sourceGoverningEntities: initialValue.sourceGoverningEntities,
      sourceGlobalClusters: initialValue.sourceGlobalClusters,
      sourceEmergencies: initialValue.sourceEmergencies,
      destinationOrganizations: initialValue.destinationOrganizations,
      destinationLocations: initialValue.destinationLocations,
      destinationUsageYears: initialValue.destinationUsageYears,
      destinationProjects: initialValue.destinationProjects,
      destinationPlans: initialValue.destinationPlans,
      destinationGoverningEntities: initialValue.destinationGoverningEntities,
      destinationGlobalClusters: initialValue.destinationGlobalClusters,
      destinationEmergencies: initialValue.destinationEmergencies,
    };
    setObjects(valuesObject);
  }, []);

  unstable_usePrompt({
    message: 'You have unsaved changes! Are you sure you want to leave?',
    when: unsavedChange,
  });
  const dictExecutedForEachObject: Record<
    string,
    (
      objectType: string,
      flowObject: any,
      setFieldValue: any,
      values: any
    ) => Promise<any>
  > = {
    sourcePlans: fetchPlanDetails,
    destinationPlans: fetchPlanDetails,
    destinationEmergencies: fetchEmergencyDetails,
    sourceProjects: fetchProjectDetails,
    destinationProjects: fetchProjectDetails,
    sourceOrganizations: fetchOrganizationDetails,
    sourceGlobalClusters: fetchAssociatedGoverningEntity,
    destinationGlobalClusters: fetchAssociatedGoverningEntity,
    sourceUsageYears: fetchKeywords,
    destinationUsageYears: fetchKeywords,
  };

  const params: DeleteFlowParams = {
    VersionID: currentVersionID ?? 0,
    FlowID: currentFlowID ?? 0,
  };

  const deleteFlow = async () => {
    if (linkCheck || isShowParentFlow || isShowChildFlow > 0) {
      window.confirm(
        'All linked flows must be unlinked before this flow can be deleted. Unlink flows and choose Delete flow again.'
      );
      return;
    }

    try {
      const response = await env.model.flows.deleteFlow(params);
      const path = flows();
      window.open(path, '_self');
    } catch (err: any) {
      setOpenAlerts([...openAlerts, { message: err.message, id: alertId }]);
      setAlertId((prevId) => prevId + 1);
    }
  };
  const updateFlowObjects = async (
    objectType: string,
    flowObject: any,
    setFieldValue: any,
    values?: any
  ) => {
    if (flowObject.length > 0 && dictExecutedForEachObject[objectType]) {
      flowObject.sort(
        (
          a: { displayLabel: string; value: number },
          b: { displayLabel: string; value: number }
        ) => {
          return a.displayLabel.localeCompare(b.displayLabel);
        }
      );
      await dictExecutedForEachObject[objectType](
        objectType,
        flowObject,
        setFieldValue,
        values
      );
    }
    if (objectType === 'sourcePlans') {
      handleShowSourceGoverningEntities(flowObject.length !== 0);
    }
    if (objectType === 'destinationPlans') {
      handleShowDestinationGoverningEntities(flowObject.length !== 0);
    }
  };
  const handleParentLinkedFlow = (
    values: any,
    setFieldValue: any,
    index: number
  ) => {
    setFieldValue(
      'parentFlow',
      values['parentFlow'].filter((_item: any, ind: number) => ind !== index)
    );
  };
  const handleChildFlow = (values: any, setFieldValue: any, index: number) => {
    setFieldValue(
      'childFlow',
      values['childFlow'].filter((_item: any, ind: number) => ind !== index)
    );
  };
  const validateForm = (values: FormValues) => {
    setUnsavedChange(JSON.stringify(values) !== JSON.stringify(initialValue));
    const valuesObject: Record<string, any[]> = {
      sourceOrganizations: values.sourceOrganizations,
      sourceLocations: values.sourceLocations,
      sourceUsageYears: values.sourceUsageYears,
      sourceProjects: values.sourceProjects,
      sourcePlans: values.sourcePlans,
      sourceGoverningEntities: values.sourceGoverningEntities,
      sourceGlobalClusters: values.sourceGlobalClusters,
      sourceEmergencies: values.sourceEmergencies,
      destinationOrganizations: values.destinationOrganizations,
      destinationLocations: values.destinationLocations,
      destinationUsageYears: values.destinationUsageYears,
      destinationProjects: values.destinationProjects,
      destinationPlans: values.destinationPlans,
      destinationGoverningEntities: values.destinationGoverningEntities,
      destinationGlobalClusters: values.destinationGlobalClusters,
      destinationEmergencies: values.destinationEmergencies,
    };
    setObjects(valuesObject);
    const result = validationSchema.decode(values);
    if (isRight(result)) {
      setValidationFlag(false);
      return {};
    } else {
      const errors: Record<string, string | Record<string, string>[]> = {};
      Object.keys(values).forEach((key) => {
        const value = values[key as keyof FormValues];
        if (
          result.left.some((err) => err.context.find((ctx) => ctx.key === key))
        ) {
          const errorKey = key as keyof FormikErrors<FormValues>;
          if (!value) {
            errors[errorKey] = 'This field is required.';
          } else if (Array.isArray(value) && value.length === 0) {
            errors[errorKey] = 'This field is required.';
          }
        }
        if (
          key === 'amountUSD' &&
          (value === 0 || (value && (value === '0' || (value as number) < 0)))
        ) {
          errors['amountUSD'] = 'The amount must be greater than zero.';
        }
        if (key === 'flowType' && !value) {
          errors['flowType'] = 'This field is required.';
        }
        if (key === 'method' && !value) {
          errors['method'] = 'This field is required.';
        }
        if (key === 'reportDetails') {
          const res = result.left.filter((err) =>
            err.context.find((ctx) => ctx.key === key)
          )[0].value;
          if (res && Array.isArray(res)) {
            const reportDetailError: Record<string, string>[] = [];
            res.forEach((_, index) => {
              const error: Record<string, string> = {};
              if (res[index].reportChannel === '') {
                error['reportChannel'] = 'This field is required.';
              } else {
                error['reportChannel'] = '';
              }
              if (!res[index].reportedDate) {
                error['reportedDate'] = 'This field is required.';
              } else {
                error['reportedDate'] = '';
              }
              console.log(res[index], '-------------->');
              if (
                (res[index].reportFileTitle === '' ||
                  res[index].reportFileTitle === undefined) &&
                (uploadedFileArray[index] &&
                (uploadedFileArray[index] as { id?: number })?.id
                  ? true
                  : false)
              ) {
                error['reportFileTitle'] = 'This field is required.';
              } else {
                error['reportFileTitle'] = '';
              }
              if (
                res[index].reportedOrganization === null ||
                res[index].reportedOrganization.displayLabel === ''
              ) {
                error['reportedOrganization'] = 'This field is required.';
              } else {
                error['reportedOrganization'] = '';
              }

              if (Object.keys(error).length > 0) {
                (reportDetailError as Record<string, string>[]).push(error);
              }
            });

            if (reportDetailError.length >= res.length) {
              res.forEach((_, index) => {
                if (
                  res[index].reportChannel !== '' &&
                  res[index].reportedOrganization !== '' &&
                  res[index].reportedDate !== ''
                ) {
                  if (
                    (res[index].reportFileTitle === undefined ||
                      res[index].reportFileTitle === '') &&
                    (uploadedFileArray[index] &&
                    (uploadedFileArray[index] as { id?: number })?.id
                      ? false
                      : true)
                  ) {
                    return {};
                  } else if (
                    res[index].reportFileTitle !== undefined &&
                    res[index].reportFileTitle !== '' &&
                    uploadedFileArray[index]
                  ) {
                    return {};
                  } else {
                    errors['reportDetails'] = reportDetailError;
                  }
                } else {
                  errors['reportDetails'] = reportDetailError;
                }
              });
            }
          }
        }
      });
      console.log(errors, 'errors');
      if (Object.keys(errors).length === 0) setValidationFlag(false);
      return errors;
    }
  };
  const handleParentFlow = (
    values: any,
    parentValueString: string,
    setValues: any
  ) => {
    parentValue = parentValueString;
    const defaultValueParent: flowsResponse.GetFlowResult =
      JSON.parse(parentValueString);

    const indexOrgs = defaultValueParent.organizations
      .map((org, index) => {
        return org.flowObject?.refDirection === 'destination'
          ? index
          : undefined;
      })
      .filter((index) => index !== undefined);

    const indexYears = defaultValueParent.usageYears
      .map((org, index) => {
        return org.flowObject?.refDirection === 'destination'
          ? index
          : undefined;
      })
      .filter((index) => index !== undefined);

    const indexLocs = defaultValueParent.locations
      .map((org, index) => {
        return org.flowObject?.refDirection === 'destination'
          ? index
          : undefined;
      })
      .filter((index) => index !== undefined);

    const indexEmrs = defaultValueParent.emergencies
      ?.map((org, index) => {
        return org.flowObject?.refDirection === 'destination'
          ? index
          : undefined;
      })
      .filter((index) => index !== undefined);

    const indexGlos = defaultValueParent.globalClusters
      ?.map((org, index) => {
        return org.flowObject?.refDirection === 'destination'
          ? index
          : undefined;
      })
      .filter((index) => index !== undefined);

    const indexPlns = defaultValueParent.plans
      ?.map((org, index) => {
        return org.flowObject?.refDirection === 'destination'
          ? index
          : undefined;
      })
      .filter((index) => index !== undefined);

    // const indexEnt = defaultValueParent.governingEntities?.findIndex((org) => org.flowObject?.refDirection === 'destination') ?? -1;

    const indexPros = defaultValueParent.projects
      ?.map((org, index) => {
        return org.flowObject?.refDirection === 'destination'
          ? index
          : undefined;
      })
      .filter((index) => index !== undefined);

    const _sourceOrganizations = indexOrgs.map((index: number | undefined) => {
      if (index === 0 || index) {
        return {
          displayLabel: `${defaultValueParent.organizations[index].name} [${defaultValueParent.organizations[index].abbreviation}]`,
          value: defaultValueParent.organizations[index].id,
        };
      }
    });
    const _sourceUsageYears = indexYears.map((index: number | undefined) => {
      if (index === 0 || index) {
        return {
          displayLabel: `${defaultValueParent.usageYears[index].year}`,
          value: defaultValueParent.usageYears[index].id,
        };
      }
    });
    const _sourceLocations = indexLocs.map((index: number | undefined) => {
      if (index === 0 || index) {
        return {
          displayLabel: `${defaultValueParent.locations[index].name}`,
          value: defaultValueParent.locations[index].id,
        };
      }
    });

    const _sourceEmergencies = indexEmrs?.map((index: number | undefined) => {
      if (index === 0 || index) {
        return {
          displayLabel:
            defaultValueParent.emergencies &&
            `${defaultValueParent.emergencies[index].name}`,
          value:
            defaultValueParent.emergencies &&
            defaultValueParent.emergencies[index].id,
        };
      }
    });
    const _sourceGlobalClusters = indexGlos?.map(
      (index: number | undefined) => {
        if (index === 0 || index) {
          return {
            displayLabel:
              defaultValueParent.globalClusters &&
              `${defaultValueParent.globalClusters[index].name}`,
            value:
              defaultValueParent.globalClusters &&
              defaultValueParent.globalClusters[index].id,
          };
        }
      }
    );
    const _sourcePlans = indexPlns?.map((index: number | undefined) => {
      if (index === 0 || index) {
        return {
          displayLabel:
            defaultValueParent.plans &&
            `${defaultValueParent.plans[index].planVersion.name}`,
          value: defaultValueParent.plans && defaultValueParent.plans[index].id,
        };
      }
    });
    const _sourceProjects = indexPros?.map((index: number | undefined) => {
      if (index === 0 || index) {
        return {
          displayLabel:
            defaultValueParent.projects &&
            `${defaultValueParent.projects[index].projectVersions[index].name}`,
          value:
            defaultValueParent.projects &&
            defaultValueParent.projects[index].id,
        };
      }
    });

    setValues({
      ...values,
      sourceOrganizations: _sourceOrganizations,
      sourceUsageYears: _sourceUsageYears,
      sourceLocations: _sourceLocations,
      sourceEmergencies: _sourceEmergencies,
      sourceGlobalClusters: _sourceGlobalClusters,
      sourcePlans: _sourcePlans,
      // sourceGoverningEntities: _sourceGoverningEntities ? [_sourceGoverningEntities] : [],
      sourceProjects: _sourceProjects,
    });
  };
  return (
    <Formik
      initialValues={initialValue}
      onSubmit={(values, { setSubmitting }) =>
        handleSubmit(values, values.submitAction)
      }
      validate={(values) => validateForm(values)}
      enableReinitialize
      validateOnChange={false}
      style={{ zIndex: 1 }}
    >
      {({ values, setFieldValue, setValues }) => {
        if (values.parentFlow && values.parentFlow[0]) {
          const parentValueString = String(
            values.parentFlow &&
              values.parentFlow[0] &&
              values.parentFlow[0].value
          );
          if (parentValue !== parentValueString) {
            handleParentFlow(values, parentValueString, setValues);
          }
        }
        return (
          <Form>
            <StyledDiv style={{ position: 'sticky', top: '70px' }}>
              {!readOnly && !isPending && (
                <>
                  <C.ButtonSubmit
                    color="primary"
                    text={
                      isCancelled || canReactive
                        ? 'Reactive'
                        : isEdit
                        ? 'Save & View All'
                        : 'Create & View All'
                    }
                    name="submitAction"
                    value="saveall"
                    onClick={() => {
                      handleAlert(values);
                      setApproveFlag(false);
                      setRejectFlag(false);
                      setFieldValue('submitAction', 'save');
                    }}
                  />
                  <C.ButtonSubmit
                    color="primary"
                    text={
                      isCancelled || canReactive
                        ? 'Reactive'
                        : isEdit
                        ? 'Save'
                        : 'Create'
                    }
                    name="submitAction"
                    value="save"
                    onClick={() => {
                      handleAlert(values);
                      setApproveFlag(false);
                      setRejectFlag(false);
                      setFieldValue('submitAction', 'save');
                    }}
                  />
                  <C.ButtonSubmit
                    color="primary"
                    text={'Set as inactive'}
                    name="submitAction"
                    value="inactive"
                    onClick={async () => {
                      window.confirm(
                        'Are you sure you want to set this flow as inactive? Any parent or child flows linked to this flow must be unlinked before the flow can be set as inactive.'
                      );
                      handleAlert(values);
                      setApproveFlag(false);
                      setRejectFlag(false);
                      setFieldValue('submitAction', 'inactive');
                    }}
                  />
                </>
              )}
              {isPending && (
                <>
                  <C.ButtonSubmit
                    color="primary"
                    text={'Save & Approve'}
                    name="submitAction"
                    value="approve"
                    onClick={() => {
                      setApproveFlag(true);
                      setFieldValue('submitAction', 'approve');
                    }}
                  />
                  <C.ButtonSubmit
                    color="primary"
                    text={'Mark As Rejected'}
                    name="submitAction"
                    value="rejected"
                    onClick={() => {
                      setRejectFlag(true);
                      setApproveFlag(true);
                      setFieldValue('submitAction', 'rejected');
                    }}
                  />
                </>
              )}
              {currentVersionID ? (
                <Stack direction="row" spacing={2}>
                  {isEdit && (
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          window.confirm(
                            'Are you sure you want to delete this version of this flow? Any parent or child flows linked to this flow must be unlinked before the flow can be deleted. Only this version will be deleted.'
                          )
                        ) {
                          deleteFlow();
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(values)}
                  >
                    COPY
                  </Button>
                </Stack>
              ) : (
                <></>
              )}
            </StyledDiv>
            {openAlerts.map((alert) => (
              <Alert
                key={alert.id}
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => handleClose(alert.id)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
                onClose={() => handleClose(alert.id)}
              >
                {alert.message}
              </Alert>
            ))}
            <div>
              {inactiveFlag && isEdit && (
                <MuiAlert
                  severity="error"
                  style={{ marginBottom: '20px' }}
                  onClose={() => {
                    setInactiveFlag(false);
                  }}
                >
                  <AlertTitle>Set as inactive?</AlertTitle>
                  All linked flows must be unlinked before this flow can be
                  cancelled. Unlink flows and choose flow again.
                </MuiAlert>
              )}
            </div>
            <div>
              {validationFlag && (
                <MuiAlert
                  severity="error"
                  style={{ marginBottom: '20px' }}
                  onClose={() => {
                    setValidationFlag(false);
                  }}
                >
                  <AlertTitle>Validation</AlertTitle>
                  Please complete all required fields marked with an asterisk
                  (*) to proceed.
                </MuiAlert>
              )}
            </div>
            <div>
              {parentCurrencyFlag && (
                <MuiAlert
                  severity="error"
                  style={{ marginBottom: '20px' }}
                  onClose={() => {
                    setParentCurrencyFlag(false);
                  }}
                >
                  This flow's foreign currency must be the same as its parked
                  parent flow.
                </MuiAlert>
              )}
            </div>
            <div>
              {childCurrencyFlag && (
                <MuiAlert
                  severity="error"
                  style={{ marginBottom: '20px' }}
                  onClose={() => {
                    setChildCurrencyFlag(false);
                  }}
                >
                  The child flow must have the same currency as this parked
                  flow. Please update the child flow first before linking it to
                  this flow.
                </MuiAlert>
              )}
            </div>
            <div>
              {alertFlag && (
                <MuiAlert
                  severity="success"
                  style={{ marginBottom: '20px' }}
                  onClose={() => {
                    setAlertFlag(false);
                  }}
                >
                  <AlertTitle>Success</AlertTitle>
                  Flow
                  <a href={sharePath} style={{ textDecoration: 'underline' }}>
                    {' '}
                    {currentFlowID} ,V{sharePath.split('/').pop()}{' '}
                  </a>
                  {`"${values.flowDescription}" updated`}
                </MuiAlert>
              )}
            </div>
            <StyledLayoutRow
              style={{
                pointerEvents: readOnly ? 'none' : 'auto',
                opacity: readOnly ? 0.6 : 1,
              }}
            >
              <StyledHalfSection>
                <StyledFullSection id="parentDiv">
                  <C.FormSection title="Funding Source(s)" isLeftSection>
                    {values.parentFlow && values.parentFlow.length ? (
                      <StyledParentInfo
                        style={{
                          pointerEvents: 'auto',
                        }}
                      >
                        Source associated with Parent Destination. To edit these
                        fields, remove the Parent flow or make changes directly
                        to the Parent flow at&nbsp;(
                        {values.parentFlow.map((item) => (
                          <StyledAnchor
                            href={`flows/edit/${
                              JSON.parse(
                                item?.value ? item?.value.toString() : ''
                              ).id
                            }/version/${
                              JSON.parse(
                                item?.value ? item?.value.toString() : ''
                              ).versionID
                            }`}
                            target="_blank"
                          >
                            {
                              JSON.parse(
                                item?.value ? item?.value.toString() : ''
                              ).id
                            }
                          </StyledAnchor>
                        ))}
                        )
                      </StyledParentInfo>
                    ) : (
                      ''
                    )}

                    {initialValue.isParkedParent && initialValue.sources ? (
                      <StyledParentInfo>
                        The parent to this flow is "parked", here are its
                        sources:
                        <ul>
                          {Object.entries(initialValue.sources).map(
                            ([objectType, objects]) => (
                              <StyledList key={objectType}>
                                <StyledStrong>{objectType}</StyledStrong>
                                {objects.map((object, index) => (
                                  <span key={index}>
                                    {object.year || object.name}&nbsp;&nbsp;
                                  </span>
                                ))}
                              </StyledList>
                            )
                          )}
                        </ul>
                      </StyledParentInfo>
                    ) : (
                      ''
                    )}

                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Organization(s)*"
                      name="sourceOrganizations"
                      fnPromise={
                        environment.model.organizations
                          .getAutocompleteOrganizations
                      }
                      behavior={FORM_SETTINGS.organization.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      isMulti
                      entryInfo={inputEntries.sourceOrganizations}
                      rejectInputEntry={rejectInputEntry}
                      isDisabled={isShowParentFlow}
                    />
                    <StyledRow>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelectFTSAdmin
                          label="Usage Year(s)*"
                          name="sourceUsageYears"
                          fnPromise={environment.model.usageYears.getUsageYears}
                          isMulti
                          behavior={FORM_SETTINGS.usageYear.behavior}
                          onChange={(event, value) => {
                            updateFlowObjects(
                              event,
                              value,
                              setFieldValue,
                              values
                            );
                          }}
                          isAutocompleteAPI={false}
                          entryInfo={inputEntries.sourceUsageYears}
                          rejectInputEntry={rejectInputEntry}
                          isDisabled={isShowParentFlow}
                        />
                      </StyledHalfSection>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelectFTSAdmin
                          label="Country(ies) (Admin level 0)"
                          name="sourceLocations"
                          fnPromise={
                            environment.model.locations.getAutocompleteLocations
                          }
                          behavior={FORM_SETTINGS.location.behavior}
                          isMulti
                          entryInfo={inputEntries.sourceLocations}
                          rejectInputEntry={rejectInputEntry}
                          isDisabled={isShowParentFlow}
                        />
                      </StyledHalfSection>
                    </StyledRow>
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Emergency(ies)"
                      name="sourceEmergencies"
                      fnPromise={
                        environment.model.emergencies.getAutocompleteEmergencies
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      behavior={FORM_SETTINGS.emergency.behavior}
                      isMulti
                      entryInfo={inputEntries.sourceEmergencies}
                      rejectInputEntry={rejectInputEntry}
                      isDisabled={isShowParentFlow}
                    />
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Global Cluster(s)"
                      name="sourceGlobalClusters"
                      fnPromise={
                        environment.model.globalClusters.getGlobalClusters
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      behavior={FORM_SETTINGS.globalCluster.behavior}
                      isMulti
                      isAutocompleteAPI={false}
                      entryInfo={inputEntries.sourceGlobalClusters}
                      rejectInputEntry={rejectInputEntry}
                      isDisabled={isShowParentFlow}
                    />
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Plan"
                      name="sourcePlans"
                      fnPromise={environment.model.plans.getAutocompletePlans}
                      isMulti
                      behavior={FORM_SETTINGS.plan.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      entryInfo={inputEntries.sourcePlans}
                      rejectInputEntry={rejectInputEntry}
                      isDisabled={isShowParentFlow}
                    />
                    {showSourceGoverningEntities && (
                      <C.AsyncAutocompleteSelectFTSAdmin
                        label="Field Cluster(s)"
                        name="sourceGoverningEntities"
                        optionsData={sourceGoverningEntities}
                        // fnPromise={environment.model.governingEntities.getAllPlanGoverningEntities}
                        isMulti
                        behavior={FORM_SETTINGS.governingEntity.behavior}
                        isAutocompleteAPI={false}
                        entryInfo={inputEntries.sourceGoverningEntities}
                        rejectInputEntry={rejectInputEntry}
                        isDisabled={isShowParentFlow}
                      />
                    )}
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Project"
                      name="sourceProjects"
                      fnPromise={
                        environment.model.projects.getAutocompleteProjects
                      }
                      behavior={FORM_SETTINGS.project.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      isMulti
                      entryInfo={inputEntries.sourceProjects}
                      rejectInputEntry={rejectInputEntry}
                      isDisabled={isShowParentFlow}
                    />
                  </C.FormSection>
                </StyledFullSection>
              </StyledHalfSection>
              <StyledHalfSection>
                <StyledFullSection>
                  <C.FormSection title="Funding Destination(s)" isRightSection>
                    {showWarningMessage && (
                      <StyledAddChildWarning>
                        <StyledAddChildWarningIconDiv>
                          <GppMaybeIcon
                            style={{
                              fontSize: '40px',
                              fill: '#D18E00',
                            }}
                          />
                        </StyledAddChildWarningIconDiv>
                        <StyledAddChildWarningText>
                          You have added a Child flow for this flow. Updating
                          the Funding Destination(s) for this flow will update
                          the Funding Source(s) for the child flows. If you
                          don't want to update the Child flow's funding sources,
                          unlink it first.
                        </StyledAddChildWarningText>
                      </StyledAddChildWarning>
                    )}
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Organization(s)*"
                      name="destinationOrganizations"
                      fnPromise={
                        environment.model.organizations
                          .getAutocompleteOrganizations
                      }
                      behavior={FORM_SETTINGS.organization.behavior}
                      isMulti
                      entryInfo={inputEntries.destinationOrganizations}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <StyledRow>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelectFTSAdmin
                          label="Usage Year(s)*"
                          name="destinationUsageYears"
                          fnPromise={environment.model.usageYears.getUsageYears}
                          isMulti
                          behavior={FORM_SETTINGS.usageYear.behavior}
                          onChange={(event, value) => {
                            updateFlowObjects(
                              event,
                              value,
                              setFieldValue,
                              values
                            );
                          }}
                          isAutocompleteAPI={false}
                          entryInfo={inputEntries.destinationUsageYears}
                          rejectInputEntry={rejectInputEntry}
                        />
                      </StyledHalfSection>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelectFTSAdmin
                          label="Country(ies) (Admin level 0)"
                          name="destinationLocations"
                          fnPromise={
                            environment.model.locations.getAutocompleteLocations
                          }
                          behavior={FORM_SETTINGS.location.behavior}
                          isMulti
                          entryInfo={inputEntries.destinationLocations}
                          rejectInputEntry={rejectInputEntry}
                        />
                      </StyledHalfSection>
                    </StyledRow>
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Global Cluster(s)"
                      name="destinationGlobalClusters"
                      fnPromise={
                        environment.model.globalClusters.getGlobalClusters
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      behavior={FORM_SETTINGS.globalCluster.behavior}
                      isMulti
                      isAutocompleteAPI={false}
                      entryInfo={inputEntries.destinationGlobalClusters}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Plan"
                      name="destinationPlans"
                      fnPromise={environment.model.plans.getAutocompletePlans}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      behavior={FORM_SETTINGS.plan.behavior}
                      isMulti
                      entryInfo={inputEntries.destinationPlans}
                      rejectInputEntry={rejectInputEntry}
                    />
                    {showDestinationGoverningEntities && (
                      <C.AsyncAutocompleteSelectFTSAdmin
                        label="Field Cluster(s)"
                        name="destinationGoverningEntities"
                        optionsData={destinationGoverningEntities}
                        isMulti
                        behavior={FORM_SETTINGS.governingEntity.behavior}
                        isAutocompleteAPI={false}
                        entryInfo={inputEntries.destinationGoverningEntities}
                        rejectInputEntry={rejectInputEntry}
                      />
                    )}
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Emergency(ies)"
                      name="destinationEmergencies"
                      fnPromise={
                        environment.model.emergencies.getAutocompleteEmergencies
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      isMulti
                      entryInfo={inputEntries.destinationEmergencies}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Project"
                      name="destinationProjects"
                      fnPromise={
                        environment.model.projects.getAutocompleteProjects
                      }
                      behavior={FORM_SETTINGS.project.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue, values);
                      }}
                      isMulti
                      entryInfo={inputEntries.destinationProjects}
                      rejectInputEntry={rejectInputEntry}
                    />
                  </C.FormSection>
                </StyledFullSection>
              </StyledHalfSection>
            </StyledLayoutRow>
            <StyledFullSection
              style={{
                pointerEvents: readOnly ? 'none' : 'auto',
                opacity: readOnly ? 0.6 : 1,
              }}
            >
              <C.FormSection title="Flow">
                <StyledRow>
                  <StyledHalfSection>
                    <C.CheckBox
                      label="Is this flow new money?"
                      name="includeChildrenOfParkedFlows"
                      size="small"
                      disabled={
                        readOnly
                          ? true
                          : isShowParentFlow && isEdit
                          ? true
                          : false
                      }
                    />
                    <StyledFormRow>
                      <C.TextFieldWrapper
                        label="Funding Amount in USD*"
                        name="amountUSD"
                        type="currency"
                        thousandSeparator
                        entryInfo={inputEntries.amountUSD}
                        rejectInputEntry={rejectInputEntry}
                      />
                    </StyledFormRow>
                    <C.Section title="Original Currency" type="secondary" noGap>
                      <StyledRow>
                        <C.TextFieldWrapper
                          label="Funding Amount (original currency)"
                          name="amountOriginal"
                          type="number"
                          thousandSeparator
                          entryInfo={inputEntries.amountOriginal}
                          rejectInputEntry={rejectInputEntry}
                        />
                        <StyledCurrencyRow>
                          <C.AsyncAutocompleteSelectFTSAdmin
                            label="Currency"
                            name="origCurrency"
                            fnPromise={
                              environment.model.currencies.getCurrencies
                            }
                            entryInfo={
                              inputEntries.origCurrency
                                ? [inputEntries.origCurrency]
                                : []
                            }
                            rejectInputEntry={rejectInputEntry}
                            isAutocompleteAPI={false}
                          />
                        </StyledCurrencyRow>
                      </StyledRow>
                      <C.TextFieldWrapper
                        label="Exchange Rate Used"
                        name="exchangeRateUsed"
                        type="number"
                        thousandSeparator
                        entryInfo={inputEntries.exchangeRateUsed}
                        rejectInputEntry={rejectInputEntry}
                      />
                      <StyledAnchorDiv>
                        <StyledAnchor
                          href="https://treasury.un.org/operationalrates/OperationalRates.php"
                          target="_blank"
                        >
                          UN Treasury rates
                        </StyledAnchor>
                      </StyledAnchorDiv>
                      <C.Button
                        onClick={() => {
                          handleCalculateExchangeRate(values, setFieldValue);
                        }}
                        color="primary"
                        text={buttonText}
                      ></C.Button>
                    </C.Section>
                    <C.TextFieldWrapper
                      label="Funding Flow Description*"
                      placeholder="1-2 sentences for flow name"
                      name="flowDescription"
                      multiline
                      rows={2}
                      type="text"
                      entryInfo={inputEntries.flowDescription}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <StyledFormRow>
                      <C.DatePicker
                        name="firstReported"
                        label="First Reported*"
                      />
                      <C.DatePicker
                        name="decisionDate"
                        label="Decision Dateⓢ"
                      />
                      <C.TextFieldWrapper
                        label="Donor Budget Year"
                        name="budgetYear"
                        type="text"
                      />
                    </StyledFormRow>
                  </StyledHalfSection>
                  <StyledHalfSection>
                    <C.AsyncSingleSelect
                      label="Flow Type*"
                      name="flowType"
                      fnPromise={fetchCategory('flowType')}
                      returnObject
                      entryInfo={inputEntries.flowType}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncSingleSelect
                      label="Flow Status*"
                      name="flowStatus"
                      fnPromise={fetchCategory('flowStatus')}
                      returnObject
                      entryInfo={inputEntries.flowStatus}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.DatePicker name="flowDate" label="Flow Date*" />
                    <C.AsyncSingleSelect
                      label="Contribution Type"
                      name="contributionType"
                      fnPromise={fetchCategory('contributionType')}
                      returnObject
                      entryInfo={inputEntries.contributionType}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncSingleSelect
                      label="GB Earmarking"
                      name="earmarkingType"
                      fnPromise={fetchCategory('earmarkingType')}
                      returnObject
                      entryInfo={inputEntries.earmarkingType}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncSingleSelect
                      label="Aid Modality*"
                      name="method"
                      fnPromise={fetchCategory('method')}
                      returnObject
                      entryInfo={inputEntries.method}
                      rejectInputEntry={rejectInputEntry}
                    />
                    {(values.method as categoryType).displayLabel ===
                      'Cash transfer programming (CTP)' && (
                      <C.AsyncSingleSelect
                        label="Cash Transfer Programming(CTP)"
                        name="cashTransfer"
                        fnPromise={fetchCategory('method')}
                        returnObject
                        entryInfo={inputEntries.method}
                        rejectInputEntry={rejectInputEntry}
                      />
                    )}
                    <C.AsyncAutocompleteSelectFTSAdmin
                      label="Keywords"
                      name="keywords"
                      fnPromise={environment.model.categories.getCategories}
                      category="keywords"
                      isMulti
                      isAutocompleteAPI={false}
                      entryInfo={
                        inputEntries.keywords ? [inputEntries.keywords] : []
                      }
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncSingleSelect
                      label="Beneficiary Group"
                      name="beneficiaryGroup"
                      fnPromise={fetchCategory('beneficiaryGroup')}
                      returnObject
                      entryInfo={inputEntries.beneficiaryGroup}
                      rejectInputEntry={rejectInputEntry}
                    />
                  </StyledHalfSection>
                </StyledRow>
                <C.TextFieldWrapper
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  type="text"
                  entryInfo={inputEntries.notes}
                  rejectInputEntry={rejectInputEntry}
                />
              </C.FormSection>
            </StyledFullSection>
            <StyledFullSection
              style={{
                pointerEvents: readOnly ? 'none' : 'auto',
                opacity: readOnly ? 0.6 : 1,
              }}
            >
              <C.FormSection title="Linked Flows">
                <StyledLabel>Parent Flow</StyledLabel>
                {isShowParentFlow && (
                  <StyledRow>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableBody>
                          {values.parentFlow &&
                            values.parentFlow.map((item, index) => (
                              <TableRow
                                sx={{
                                  '&:last-child td, &:last-child th': {
                                    border: 0,
                                  },
                                }}
                              >
                                <TableCell>
                                  <a
                                    href={`/flows/edit/${
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).id
                                    }/version/${
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).versionID
                                    }`}
                                    style={{ textDecoration: 'underline' }}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    #
                                    {
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).id
                                    }
                                  </a>
                                </TableCell>
                                <TableCell>
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).description
                                  }
                                </TableCell>
                                <TableCell>
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).src_org_name
                                  }{' '}
                                  |{' '}
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).src_org_abbreviation
                                  }{' '}
                                  |{' '}
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).budgetYear
                                  }
                                </TableCell>
                                <TableCell>
                                  {dayjs(
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    )
                                  ).format('DD/MM/YYYY')}
                                </TableCell>
                                <TableCell>
                                  US$
                                  {parseFloat(
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).amountUSD
                                  ).toLocaleString('en-US')}
                                </TableCell>
                                <TableCell>
                                  {JSON.parse(
                                    item?.value ? item?.value.toString() : ''
                                  ).origAmount &&
                                    'EUR' +
                                      parseFloat(
                                        JSON.parse(
                                          item?.value
                                            ? item?.value.toString()
                                            : ''
                                        ).origAmount
                                      ).toLocaleString('en-US')}
                                </TableCell>
                                <TableCell>
                                  <C.Button
                                    onClick={() => {
                                      handleParentLinkedFlow(
                                        values,
                                        setFieldValue,
                                        index
                                      );
                                      setShowParentFlow(false);
                                      setFieldValue(
                                        'includeChildrenOfParkedFlows',
                                        true
                                      );
                                      setLinkCheck(false);
                                      setNewMoneyCheckboxDisabled(
                                        !newMoneyCheckboxDisabled
                                      );
                                    }}
                                    color="secondary"
                                    text="unlink"
                                    startIcon={MdRemove}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </StyledRow>
                )}
                <StyledLabel>Child Flow</StyledLabel>
                <StyledRow>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        {values.childFlow &&
                          values.childFlow.map(
                            (item, index) =>
                              isShowChildFlow > index && (
                                <TableRow
                                  key={index}
                                  sx={{
                                    '&:last-child td, &:last-child th': {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell>
                                    <a
                                      href={`/flows/edit/${
                                        JSON.parse(
                                          item?.value
                                            ? item?.value.toString()
                                            : ''
                                        ).id
                                      }/version/${
                                        JSON.parse(
                                          item?.value
                                            ? item?.value.toString()
                                            : ''
                                        ).versionID
                                      }`}
                                      style={{ textDecoration: 'underline' }}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      #
                                      {
                                        JSON.parse(
                                          item?.value
                                            ? item?.value.toString()
                                            : ''
                                        ).id
                                      }
                                    </a>
                                  </TableCell>
                                  <TableCell>
                                    {
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).description
                                    }
                                  </TableCell>
                                  <TableCell>
                                    {
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).dest_org_name
                                    }{' '}
                                    |{' '}
                                    {
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).dest_org_abbreviation
                                    }{' '}
                                    |{' '}
                                    {
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).dest_loc_name
                                    }{' '}
                                    |{' '}
                                    {
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).budgetYear
                                    }
                                  </TableCell>
                                  <TableCell>
                                    {dayjs(
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).flowDate
                                    ).format('DD/MM/YYYY')}
                                  </TableCell>
                                  <TableCell>
                                    US$
                                    {parseFloat(
                                      JSON.parse(
                                        item?.value
                                          ? item?.value.toString()
                                          : ''
                                      ).amountUSD
                                    ).toLocaleString('en-US')}
                                  </TableCell>
                                  <TableCell>
                                    {JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).origAmount &&
                                      'EUR' +
                                        parseFloat(
                                          JSON.parse(
                                            item?.value
                                              ? item?.value.toString()
                                              : ''
                                          ).origAmount
                                        ).toLocaleString('en-US')}
                                  </TableCell>
                                  <TableCell>
                                    <C.Button
                                      onClick={() => {
                                        handleChildFlow(
                                          values,
                                          setFieldValue,
                                          index
                                        );
                                        setShowChildFlow(isShowChildFlow - 1);
                                        setLinkCheck(false);
                                        setShowWarningMessage(false);
                                      }}
                                      color="secondary"
                                      text="unlink"
                                      startIcon={MdRemove}
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                          )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </StyledRow>
                <StyledLinkedFlowRow>
                  <StyledRow>
                    {!isShowParentFlow && (
                      <C.Button
                        onClick={() => {
                          dialogs.openDialog({
                            type: 'custom',
                            title: 'Add Flow Link',
                            width: '700',
                            buttonCancel: 'Cancel',
                            buttonConfirm: 'Add Flow Link',
                            content: (
                              <C.AsyncAutocompleteSelectFTSAdmin
                                label="Flow"
                                name="parentFlow"
                                fnPromise={
                                  environment.model.flows.getAutocompleteFlows
                                }
                                withoutFormik
                                values={values}
                                setFieldValue={setFieldValue}
                              />
                            ),
                            callback: (_value: any) => {
                              setShowParentFlow(true);
                              setFieldValue(
                                'includeChildrenOfParkedFlows',
                                false
                              );
                              setLinkCheck(true);
                              setNewMoneyCheckboxDisabled(
                                !newMoneyCheckboxDisabled
                              );
                            },
                          });
                        }}
                        color="primary"
                        text="Add Parent Flow"
                        startIcon={MdAdd}
                      />
                    )}
                    <C.Button
                      onClick={() => {
                        dialogs.openDialog({
                          type: 'custom',
                          title: 'Add Flow Link',
                          width: '700',
                          buttonCancel: 'Cancel',
                          buttonConfirm: 'Add Flow Link',
                          content: (
                            <C.AsyncAutocompleteSelectFTSAdmin
                              label="Flow"
                              name="childFlow"
                              fnPromise={
                                environment.model.flows.getAutocompleteFlows
                              }
                              withoutFormik
                              values={values}
                              setFieldValue={setFieldValue}
                            />
                          ),
                          callback: () => {
                            setShowWarningMessage(true);
                            setLinkCheck(true);
                            setShowChildFlow(isShowChildFlow + 1);
                          },
                        });
                      }}
                      color="primary"
                      text="Add Child Flow"
                      startIcon={MdAdd}
                    />
                  </StyledRow>
                </StyledLinkedFlowRow>
              </C.FormSection>
            </StyledFullSection>
            <FieldArray name="reportDetails">
              {({ remove, push }) => (
                <>
                  {values.reportDetails.length > 0 &&
                    values.reportDetails.map((_, index) => (
                      <StyledFullSection
                        key={index}
                        style={{
                          pointerEvents: readOnly ? 'none' : 'auto',
                          opacity: readOnly ? 0.6 : 1,
                        }}
                      >
                        <C.FormSection title="Reporting Details*">
                          <StyledRow>
                            <StyledHalfSection>
                              <C.RadioGroup
                                name={`reportDetails[${index}].reportSource`}
                                options={[
                                  { value: 'primary', label: 'Primary' },
                                  { value: 'secondary', label: 'Secondary' },
                                ]}
                                label="Report Source*"
                                row
                              />
                              <C.AsyncAutocompleteSelectFTSAdmin
                                label="Reported By Organization*"
                                name={`reportDetails[${index}].reportedOrganization`}
                                placeholder="Reported by Organization"
                                fnPromise={
                                  environment.model.organizations
                                    .getAutocompleteOrganizations
                                }
                              />
                              {values.sourceOrganizations.length > 0 &&
                                values.destinationOrganizations.length > 0 && (
                                  <StyledRepOrgLink>
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                      }}
                                    >
                                      {values.sourceOrganizations.map(
                                        (org, indexKey) => (
                                          <Link
                                            href="#"
                                            underline="hover"
                                            onClick={(event) => {
                                              event.preventDefault();
                                              SourceLink(
                                                setFieldValue,
                                                values,
                                                indexKey,
                                                index
                                              );
                                            }}
                                            key={indexKey}
                                          >
                                            {org.displayLabel}
                                          </Link>
                                        )
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginLeft: '15px',
                                      }}
                                    >
                                      {values.destinationOrganizations.map(
                                        (org, indexKey) => (
                                          <Link
                                            href="#"
                                            underline="hover"
                                            onClick={(event) => {
                                              event.preventDefault();
                                              DestinationLink(
                                                setFieldValue,
                                                values,
                                                indexKey,
                                                index
                                              );
                                            }}
                                            key={indexKey}
                                          >
                                            {`${org.displayLabel}`}
                                          </Link>
                                        )
                                      )}
                                    </div>
                                  </StyledRepOrgLink>
                                )}
                              <C.AsyncSingleSelect
                                label="Reported Channel*"
                                name={`reportDetails[${index}].reportChannel`}
                                fnPromise={fetchCategory('reportChannel')}
                                returnObject
                              />
                              <C.TextFieldWrapper
                                label="Source System Record Id"
                                name={`reportDetails[${index}].sourceSystemRecordId`}
                                type="text"
                              />
                              <StyledFieldset>
                                <div style={{ fontWeight: 'bold' }}>
                                  Report file:
                                </div>
                                <C.TextFieldWrapper
                                  label="Title"
                                  name={`reportDetails[${index}].reportFileTitle`}
                                  type="text"
                                />
                                <C.FileUpload
                                  name={
                                    initialValue.reportDetails[index]
                                      ?.reportFiles &&
                                    initialValue.reportDetails[index]
                                      .reportFiles[0]?.fileName
                                  }
                                  label=""
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>,
                                    index: number
                                  ) => {
                                    return handleFileChange(event, index);
                                  }}
                                  fnPromise={fetchDownload}
                                  value={
                                    uploadFlag ||
                                    (initialValue.reportDetails[index]
                                      ?.reportFiles &&
                                      initialValue.reportDetails[index]
                                        .reportFiles[0]?.UploadFileUrl)
                                  }
                                  index={index}
                                  id={
                                    initialValue.reportDetails[index]
                                      ?.reportFiles[0]?.fileAssetID
                                  }
                                  deleteFunction={() => {
                                    handleRemove(index, values);
                                  }}
                                />
                                <div
                                  style={{
                                    fontWeight: 'bold',
                                    marginTop: '10px',
                                  }}
                                >
                                  Report url:
                                </div>
                                <C.TextFieldWrapper
                                  label="Title"
                                  name={`reportDetails[${index}].reportUrlTitle`}
                                  type="text"
                                />
                                <C.TextFieldWrapper
                                  label="URL"
                                  name={`reportDetails[${index}].reportUrl`}
                                  type="text"
                                />
                              </StyledFieldset>
                              {values.reportDetails.length > 1 && (
                                <C.Button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        'Click OK if you are sure you want to remove this reporting detail.'
                                      )
                                    ) {
                                      remove(index);
                                    }
                                  }}
                                  color="secondary"
                                  text="Remove Reporting Detail"
                                  startIcon={MdRemove}
                                />
                              )}
                            </StyledHalfSection>
                            <StyledHalfSection>
                              <StyledRadioDiv>
                                <C.RadioGroup
                                  name={`reportDetails[${index}].verified`}
                                  options={[
                                    { value: 'verified', label: 'Verified' },
                                    {
                                      value: 'unverified',
                                      label: 'Unverified',
                                    },
                                  ]}
                                  label="Verified*"
                                  row
                                />
                              </StyledRadioDiv>
                              <C.DatePicker
                                name={`reportDetails[${index}].reportedDate`}
                                label="Date Reported*"
                              />
                              <C.TextFieldWrapper
                                label="Reporter Reference Code"
                                name={`reportDetails[${index}].reporterReferenceCode`}
                                type="text"
                              />
                              <C.TextFieldWrapper
                                label="Reporter Contact Information"
                                name={`reportDetails[${index}].reporterContactInformation`}
                                multiline
                                rows={4}
                                type="text"
                              />
                            </StyledHalfSection>
                          </StyledRow>
                        </C.FormSection>
                      </StyledFullSection>
                    ))}
                  {!readOnly && (
                    <StyledFormButton
                      onClick={() => {
                        push(initialReportDetail);
                        setAddReportFlag(true);
                        setUploadedFileArray([...uploadedFileArray, {}]);
                      }}
                      color="primary"
                      text="Add Reporting Detail"
                      startIcon={MdAdd}
                    />
                  )}
                </>
              )}
            </FieldArray>
            {isEdit && prevDetails && prevDetails.length > 0 && (
              <StyledFullSection>
                <C.FormSection title="Previous Reporting Details">
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Version</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Organization</TableCell>
                          <TableCell>Date Reported</TableCell>
                          <TableCell>Channel</TableCell>
                          <TableCell>Record ID</TableCell>
                          <TableCell>Contact</TableCell>
                          <TableCell>Ref Code</TableCell>
                          <TableCell>Verified?</TableCell>
                          <TableCell>Docs</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prevDetails.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.versionId}
                            </TableCell>
                            <TableCell>{row.reportSource}</TableCell>
                            <TableCell>
                              {typeof row.reportedOrganization === 'string'
                                ? row.reportedOrganization
                                : row.reportedOrganization.displayLabel}
                            </TableCell>
                            <TableCell>{row.reportedDate}</TableCell>
                            <TableCell>
                              {(row.reportChannel as AutoCompleteSelectionType)
                                .displayLabel ?? ''}
                            </TableCell>
                            <TableCell>{row.sourceSystemRecordId}</TableCell>
                            <TableCell>
                              {row.reporterContactInformation}
                            </TableCell>
                            <TableCell>{row.reporterReferenceCode}</TableCell>
                            <TableCell>
                              {row.verified === 'verified' ? 'Yes' : 'No'}
                            </TableCell>
                            <TableCell>
                              {row.reportFiles
                                .map((file) => file.title)
                                .join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </C.FormSection>
              </StyledFullSection>
            )}
            {isEdit && versionData && versionData.length > 0 && (
              <StyledFullSection>
                <C.FormSection title="Flow Versions">
                  {versionData.map((version, index) => (
                    <div key={index}>
                      <C.CheckBox
                        key={`${version.flowId}-${version.versionId}`}
                        name={`${version.flowId}-${version.versionId}`}
                        value={version}
                        label={
                          <>
                            <a
                              href={`flows/edit/${version.flowId}/version/${version.versionId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {version.flowId}-{version.versionId}
                            </a>
                            {version.active ? ' [Active] ' : ' '}
                            {version.pending ? ' [Pending] ' : ' '}
                            {version.viewing ? '[Viewing]' : ''}
                            Created at {version.createdTime} by{' '}
                            {version.createdBy ?? 'FTS User'}, updated at{' '}
                            {version.updatedTime} by{' '}
                            {version.updatedBy ?? 'FTS User'}
                          </>
                        }
                        onChange={(e) => {
                          handleCompareCheck(version, e.target.checked);
                        }}
                        disabled={
                          comparingVersions.length === 2 &&
                          !comparingVersions.some(
                            (v) => v.versionId === version.versionId
                          )
                        }
                        withoutFormik
                      />
                    </div>
                  ))}
                  {comparingVersions.length === 2 && (
                    <div>
                      Comparing versions{' '}
                      {comparedVersions.map((version, index) => (
                        <span key={version.versionId}>
                          {version.versionId}
                          {index < comparedVersions.length - 1 ? ',' : ''}
                        </span>
                      ))}{' '}
                      differences:
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell></TableCell>
                              {comparedVersions.map((version) => (
                                <TableCell
                                  key={version.versionId}
                                >{`${version.flowId} ${version.versionId}`}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>Sources</TableCell>
                              {comparedVersions.map((version) => (
                                <TableCell key={version.versionId}>
                                  {objectTypes.map(
                                    (type) =>
                                      version.uniqueSources[type] &&
                                      version.uniqueSources[type].length >
                                        0 && (
                                        <div key={type}>
                                          {type}:{' '}
                                          {version.uniqueSources[type].join(
                                            ', '
                                          )}
                                        </div>
                                      )
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              <TableCell>Destinations</TableCell>
                              {comparedVersions.map((version) => (
                                <TableCell key={version.versionId}>
                                  {objectTypes.map(
                                    (type) =>
                                      version.uniqueDestinations[type] &&
                                      version.uniqueDestinations[type].length >
                                        0 && (
                                        <div key={type}>
                                          {type}:{' '}
                                          {version.uniqueDestinations[
                                            type
                                          ].join(', ')}
                                        </div>
                                      )
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                            {(comparedVersions[0] &&
                              comparedVersions[0].uniqueCategories.length) >
                              0 ||
                            (comparedVersions[1] &&
                              comparedVersions[1].uniqueCategories.length >
                                0) ? (
                              <TableRow>
                                <TableCell>Categories</TableCell>
                                <TableCell>
                                  {comparedVersions[0].uniqueCategories.join(
                                    ', '
                                  )}
                                </TableCell>
                                <TableCell>
                                  {comparedVersions[1].uniqueCategories.join(
                                    ', '
                                  )}
                                </TableCell>
                              </TableRow>
                            ) : null}
                            {flowValuesForDisplay.map(
                              (value) =>
                                comparedVersions[0] &&
                                comparedVersions[1] &&
                                comparedVersions[0][value] !==
                                  comparedVersions[1][value] && (
                                  <TableRow key={value}>
                                    <TableCell>{value}</TableCell>
                                    {comparedVersions.map((version) => {
                                      let displayValue: React.ReactNode;
                                      const rawValue = version[value];

                                      if (rawValue instanceof Date) {
                                        displayValue =
                                          rawValue.toLocaleDateString('en-CA');
                                      } else if (Array.isArray(rawValue)) {
                                        displayValue = rawValue.join(', ');
                                      } else {
                                        displayValue = String(rawValue);
                                      }

                                      return (
                                        <TableCell key={version.versionId}>
                                          {displayValue}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  )}
                </C.FormSection>
              </StyledFullSection>
            )}
            {isPending && pendingVersionV1 && (
              <div style={{ float: 'right', marginRight: 25 }}>
                <StyledFormButton
                  onClick={() => {
                    Object.keys(inputEntries).forEach((key) => {
                      const specificKey = key as keyof InputEntriesType;
                      const value = inputEntries[specificKey];

                      if (value === null) {
                        return;
                      }
                      if (isRight(forms.INPUT_ENTRY_TYPE.decode(value))) {
                        setFieldValue(
                          key,
                          (value as forms.InputEntryType).value
                        );
                      }
                      if (Array.isArray(value)) {
                        setFieldValue(
                          key,
                          (value as forms.InputEntryType[]).find(
                            (inputEntry) =>
                              inputEntry.category ===
                              forms.InputEntryCategoriesEnum.ACTIVE_FLOW
                          )?.value ?? []
                        );
                      }
                    });
                    initializeInputEntries();
                  }}
                  color="greenLight"
                  text="Accept Remaining Changes"
                  startIcon={MdCheck}
                />
                <StyledFormButton
                  onClick={initializeInputEntries}
                  color="secondary"
                  text="Reject Remaining Changes"
                  startIcon={MdClose}
                />
              </div>
            )}
            <StyledDiv>
              {!readOnly && !isPending && (
                <>
                  <C.ButtonSubmit
                    color="primary"
                    text={
                      isCancelled || canReactive
                        ? 'Reactive'
                        : isEdit
                        ? 'Save & View All'
                        : 'Create & View All'
                    }
                    name="submitAction"
                    value="saveall"
                    onClick={() => {
                      handleAlert(values);
                      setApproveFlag(false);
                      setRejectFlag(false);
                      setFieldValue('submitAction', 'save');
                    }}
                  />
                  <C.ButtonSubmit
                    color="primary"
                    text={
                      isCancelled || canReactive
                        ? 'Reactive'
                        : isEdit
                        ? 'Save'
                        : 'Create'
                    }
                    name="submitAction"
                    value="save"
                    onClick={() => {
                      handleAlert(values);
                      setApproveFlag(false);
                      setRejectFlag(false);
                      setFieldValue('submitAction', 'save');
                    }}
                  />
                  <C.ButtonSubmit
                    color="primary"
                    text={'Set as inactive'}
                    name="submitAction"
                    value="inactive"
                    onClick={async () => {
                      window.confirm(
                        'Are you sure you want to set this flow as inactive? Any parent or child flows linked to this flow must be unlinked before the flow can be set as inactive.'
                      );
                      handleAlert(values);
                      setApproveFlag(false);
                      setRejectFlag(false);
                      setFieldValue('submitAction', 'inactive');
                    }}
                  />
                </>
              )}
              {isPending && (
                <>
                  <C.ButtonSubmit
                    color="primary"
                    text={'Save & Approve'}
                    name="submitAction"
                    value="approve"
                    onClick={() => {
                      setApproveFlag(true);
                      setFieldValue('submitAction', 'approve');
                    }}
                  />
                  <C.ButtonSubmit
                    color="primary"
                    text={'Mark As Rejected'}
                    name="submitAction"
                    value="rejected"
                    onClick={() => {
                      setRejectFlag(true);
                      setApproveFlag(true);
                      setFieldValue('submitAction', 'rejected');
                    }}
                  />
                </>
              )}
              {currentVersionID ? (
                <Stack direction="row" spacing={2}>
                  {isEdit && (
                    <Button
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          window.confirm(
                            'Are you sure you want to delete this version of this flow? Any parent or child flows linked to this flow must be unlinked before the flow can be deleted. Only this version will be deleted.'
                          )
                        ) {
                          deleteFlow();
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopy(values)}
                  >
                    COPY
                  </Button>
                </Stack>
              ) : (
                <></>
              )}
            </StyledDiv>
          </Form>
        );
      }}
    </Formik>
  );
};
export default FlowForm;
