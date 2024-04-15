import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import _ from 'lodash';
import useSharePath from './Hooks/SharePath';
import { C, dialogs, dataLoader } from '@unocha/hpc-ui';
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
  Collapse,
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
import { editFlowSetting } from '../paths';
import { flows } from '../paths';

export type AutoCompleteSeletionType = forms.InputSelectValueType;

const INPUT_SELECT_VALUE_TYPE = forms.INPUT_SELECT_VALUE_TYPE;

type UniqueDataType = {
  [key: string]: string[];
};

export interface DeleteFlowParams {
  VersionID: number;
  FlowID: number;
}

export interface ReportDetailType {
  verified: string;
  reportSource: string;
  reporterReferenceCode: string;
  reportChannel: AutoCompleteSeletionType | '';
  reportedOrganization: AutoCompleteSeletionType;
  reportedDate: string;
  reporterContactInformation: string;
  sourceSystemRecordId: string;
  reportFiles: {
    title: string;
  }[];
  reportFileTitle?: string;
  reportUrlTitle?: string;
  reportUrl?: string;
  versionId?: number;
}

export interface ParentFlowType {
  value: any;
}

export interface FormValues {
  amountUSD: number;
  keywords: AutoCompleteSeletionType[];
  flowStatus: AutoCompleteSeletionType | '';
  flowType: AutoCompleteSeletionType | '';
  flowDescription: string;
  firstReported: string;
  decisionDate: string | null;
  budgetYear: string;
  flowDate: string;
  contributionType: AutoCompleteSeletionType | '';
  earmarkingType: AutoCompleteSeletionType | '';
  method: AutoCompleteSeletionType | '';
  beneficiaryGroup: AutoCompleteSeletionType | '';
  inactiveReason: string;
  origCurrency: AutoCompleteSeletionType | string;
  amountOriginal: number | null;
  exchangeRateUsed: number | null;
  notes: string;
  sourceOrganizations: AutoCompleteSeletionType[];
  sourceLocations: AutoCompleteSeletionType[];
  sourceUsageYears: AutoCompleteSeletionType[];
  sourceProjects: AutoCompleteSeletionType[];
  sourcePlans: AutoCompleteSeletionType[];
  sourceGoverningEntities: AutoCompleteSeletionType[];
  sourceGlobalClusters: AutoCompleteSeletionType[];
  sourceEmergencies: AutoCompleteSeletionType[];
  destinationOrganizations: AutoCompleteSeletionType[];
  destinationLocations: AutoCompleteSeletionType[];
  destinationUsageYears: AutoCompleteSeletionType[];
  destinationProjects: AutoCompleteSeletionType[];
  destinationPlans: AutoCompleteSeletionType[];
  destinationGoverningEntities: AutoCompleteSeletionType[];
  destinationGlobalClusters: AutoCompleteSeletionType[];
  destinationEmergencies: AutoCompleteSeletionType[];
  reportDetails: ReportDetailType[];
  parentFlow?: AutoCompleteSeletionType[];
  childFlow?: AutoCompleteSeletionType[];
  isParkedParent?: boolean;
  includeChildrenOfParkedFlows: boolean;
  sources?: Record<string, any[]>;
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

const reportChannelSchema = t.type({
  value: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
  displayLabel: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
});

const reportDetailsSchema = t.type({
  reportedOrganization: INPUT_SELECT_VALUE_TYPE,
  reportedDate: t.intersection([codecs.NON_EMPTY_STRING, t.string]),
  reportChannel: t.intersection([codecs.NON_EMPTY_STRING, reportChannelSchema]),
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
  environment: Environment;
  isEdit: boolean;
  initialValue: FormValues;
  prevDetails?: ReportDetailType[];
  versionData?: VersionDataType[];
  flowId?: string;
  versionId?: string;
  isRestricted: boolean;
  inputEntries: InputEntriesType;
  initializeInputEntries: () => void;
  rejectInputEntry: (key: string) => void;
  currentVersionID?: number;
  currentFlowID?: number;
  currentVersionActiveStatus?: boolean;
}

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
lg:flex
justify-end
gap-x-4 
`;

const initialReportDetail = {
  verified: 'verified',
  reportSource: 'primary',
  reporterReferenceCode: '',
  reportChannel: '',
  reportedOrganization: { value: '', displayLabel: '' },
  reportedDate: dayjs().format('MM/DD/YYYY'),
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
    environment,
    initialValue,
    isEdit,
    prevDetails,
    versionData,
    isRestricted,
    inputEntries,
    flowId,
    versionId,
    initializeInputEntries,
    rejectInputEntry,
    currentVersionID,
    currentFlowID,
    currentVersionActiveStatus,
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

    return data;
  };

  const collapseCategories = (
    data: any
    // inactiveReasons: any,
    // isPending: any,
    // approvePending: any
  ) => {
    // const rejectedReasonCat = inactiveReasons.find(
    //   (reason: any) => reason.name === 'Rejected'
    // );
    // const cancelledReasonCat = inactiveReasons.find(
    //   (reason: any) => reason.name === 'Cancelled'
    // );

    // if (data.rejected) {
    //   data.inactiveReason.push(rejectedReasonCat);
    // } else if (data.cancelled) {
    //   data.inactiveReason.push(cancelledReasonCat);
    // }

    // if (isPending) {
    //     data = decideIfPendingReviewShouldBeSet(data, approvePending, inactiveReasons);
    // }

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
      data.earmarking,
    ].filter((category) => category !== undefined);

    data.categories = data.categories
      .map((value: any) => {
        if (value && value.id) {
          return value.id;
        }
      })
      .filter(function (value: any) {
        return value;
      });

    return data;
  };

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
      id: isEdit && flowId ? flowId : null,
      versionID: isEdit && versionId ? versionId : null,
      amountUSD: values.amountUSD,
      flowDate: values.flowDate,
      decisionDate: values.decisionDate,
      firstReportedDate: values.firstReported,
      budgetYear: values.budgetYear,
      origAmount: values.amountOriginal,
      origCurrency: (values.origCurrency as AutoCompleteSeletionType)
        .displayLabel,
      exchangeRate: values.exchangeRateUsed,
      activeStatus: true,
      restricted: false,
      newMoney: true,
      description: values.flowDescription,
      versionStartDate: '',
      versionEndDate: '',
      flowObjects: collapseFlowObjects(fundingObject),
      children: values.childFlow
        ? values.childFlow.map((item) => JSON.parse(item.value as string))
        : [],
      parents: values.parentFlow
        ? values.parentFlow.map((item) => JSON.parse(item.value as string))
        : [],
      reportDetails: values.reportDetails.map((item, index) => {
        return {
          // id: 587806,
          // flowID: 245996,
          // versionID: 1,
          contactInfo: item.reporterContactInformation,
          source: item.reportSource,
          date: item.reportedDate,
          sourceID: null,
          refCode: '7F-10073.04',
          verified: true,
          organizationID: item.reportedOrganization.value,
          categories: [],
          organization: {
            id: item.reportedOrganization.value,
            name: item.reportedOrganization.displayLabel,
          },
          reportFiles: [
            {
              type: 'url',
              title: item.reportUrlTitle,
              url: item.reportUrl,
            },
            {
              fileAssetID: uploadedFile && uploadedFile[index].id,
              reportFiles: [
                {
                  fieldType: 'file',
                  fileAssetId: uploadedFile && uploadedFile[index].id,
                  type: 'file',
                },
              ],
              title: item.reportFileTitle,
              type: 'file',
            },
          ],
          reportChannel: {
            id: item.reportChannel && item.reportChannel.value,
            name: item.reportChannel && item.reportChannel.displayLabel,
          },
        };
      }),
      flowType: {
        id: values.flowType && values.flowType.value,
        name: values.flowType && values.flowType.displayLabel,
      },
      keywords: values.keywords.map((item) => ({
        id: item.value,
        name: item.displayLabel,
      })),
      flowStatuses: {
        id: values.flowStatus && values.flowStatus.value,
        name: values.flowStatus && values.flowStatus.displayLabel,
      },
      contributionTypes: {
        id: values.contributionType && values.contributionType.value,
        name: values.contributionType && values.contributionType.displayLabel,
      },
      method: {
        id: values.method && values.method.value,
        name: values.method && values.method.displayLabel,
      },
      earmarking: values.earmarkingType
        ? {
            id: values.earmarkingType.value,
            name: values.earmarkingType.displayLabel,
          }
        : null,
      isCancellation: null,
      categories: [],
      ...fundingObject,
    };

    data = collapseCategories(data);
    return data;
  };

  const [alertflag, setAlertFlag] = useState<boolean>(false);
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
  const [isShowChildFlow, setShowChildFlow] = useState(
    initialValue.childFlow && initialValue.childFlow.length ? true : false
  );
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
    if (currentVersionActiveStatus) {
      setReadOnly(false);
    } else {
      setReadOnly(true);
    }
  }, []);
  useEffect(() => {
    if (initialValue.parentFlow && initialValue.parentFlow.length) {
      setShowParentFlow(true);
    }
  }, [initialValue.parentFlow]);
  useEffect(() => {
    if (initialValue.childFlow && initialValue.childFlow.length) {
      setShowChildFlow(true);
    }
  }, [initialValue.childFlow]);

  const handleSubmit = async (values: FormValues) => {
    const data = normalizeFlowData(values);
    const response = await env.model.flows.validateFlow(data, {
      adding: !isEdit,
      originalFlow: {},
    });
    let flag = true;
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

    if (flag) {
      if (!isEdit) {
        setAlertFlag(true);
        const response = await env.model.flows.createFlow({ flow: data });
        const path = editFlowSetting(response.id, response.versionID);
        window.open(path, '_self');
      } else {
        try {
          const response = await env.model.flows.updateFlow({ flow: data });
          if (response) {
            const path = editFlowSetting(response.id, response.versionID);
            setAlertFlag(true);
            setSharePath(path);
          }
        } catch (err: any) {
          setOpenAlerts([...openAlerts, { message: err.message, id: alertId }]);
          setAlertId((prevId) => prevId + 1);
          handleSave();
        }
      }
    }
  };

  const setObjectsWithArray = (
    fetchedObject: any,
    objectKeys: string[],
    settingArrayKeys: string[],
    setFieldValue: any
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
            displayLabel: (responseValue as usageYears.UsageYear).year,
            value: responseValue.id,
            isAutoFilled: true,
          };
        } else if (settingArrayKeys[i] === 'plans') {
          return {
            displayLabel: (
              responseValue.planVersion as { id: number; name: string }
            ).name,
            value: responseValue.planVersion.id,
            isAutoFilled: true,
          };
        } else if (settingArrayKeys[i] === 'governingEntities') {
          return {
            displayLabel: (
              responseValue.governingEntityVersion as {
                id: number;
                name: string;
              }
            ).name,
            value: responseValue.governingEntityVersion.id,
            isAutoFilled: true,
          };
        } else {
          return {
            displayLabel: (responseValue as { id: number; name: string }).name,
            value: responseValue.id,
            isAutoFilled: true,
          };
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
          return location.adminLevel === 0;
        });
      }
    }

    if (existingObjects && existingObjects.length) {
      const existingObjectsIds = existingObjects.map(function (o) {
        return o.id;
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
        setFieldValue
      );
      setSourceGoverningEntities(fetchedPlan.governingEntities);
    }
    if (objectType === 'destinationPlans') {
      setObjectsWithArray(
        fetchedPlan,
        ['destinationUsageYears', 'destinationEmergencies'],
        ['years', 'emergencies'],
        setFieldValue
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
            setFieldValue
          );
        }
        if (objectType === 'destinationPlans') {
          setObjectsWithArray(
            { locations: countries },
            ['destinationLocations'],
            ['locations'],
            setFieldValue
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
          setFieldValue
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
    } else {
      const fetchedProject = await environment.model.projects.getProject(
        project[0].value
      );
      const publishedVersion = fetchedProject.projectVersions.filter(
        function (version) {
          return version.id === fetchedProject.currentPublishedVersionId;
        }
      )[0];

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
        setFieldValue
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
        setFieldValue
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
          setFieldValue
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

  const fetchCategory = useCallback(
    (category: string) => {
      return async () => {
        const response = await environment.model.categories.getCategories({
          query: category,
        });
        return response.map(
          (responseValue): AutoCompleteSeletionType => ({
            displayLabel: responseValue.name,
            value: responseValue.id.toString(),
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
  const [uploadedFile, setUploadedFile] = useState<
    fileUpload.FileUploadResult[]
  >([]);
  const handleFileChange = async (event: any) => {
    try {
      const setfile: File = event.target.files[0];
      const responseData =
        await environment.model.fileUpload.fileUploadModel(setfile);
      uploadedFile.push(responseData);
      setUploadedFile([...uploadedFile]);
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
    if (linkCheck) {
      window.confirm(
        'All linked flows must be unlinked before this flow can be deleted. Unlink flows and choose Delete flow again.'
      );
      return;
    }

    // if (updateState) {
    //   window.confirm(
    //     'You have made changes to this flow but have selected to delete it. Click "ok" to confirm that any changes will not be saved and this flow will be deleted as is.'
    //   );
    // }

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
    console.log(values, 'asd');
    if (objectType === 'sourcePlans') {
      handleShowSourceGoverningEntities(flowObject.length !== 0);
    }
    if (objectType === 'destinationPlans') {
      handleShowDestinationGoverningEntities(flowObject.length !== 0);
    }
  };

  const handleChildFlow = (values: any, setFieldValue: any, index: number) => {
    setFieldValue(
      'childFlow',
      values['childFlow'].filter((item: any, ind: number) => ind !== index)
    );
  };

  const validateForm = (values: FormValues) => {
    const result = validationSchema.decode(values);
    if (isRight(result)) {
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
                  return {};
                } else {
                  errors['reportDetails'] = reportDetailError;
                }
              });
            }
          }
        }
      });
      return errors;
    }
  };

  if (alertflag) handleSave();

  const handleParentFlow = (
    values: any,
    parentValueString: string,
    setValues: any
  ) => {
    parentValue = parentValueString;
    const defaultValueParent: flowsResponse.GetFlowResult =
      JSON.parse(parentValueString);

    const indexOrg = defaultValueParent.organizations.findIndex(
      (org) => org.flowObject?.refDirection === 'destination'
    );
    const indexYear = defaultValueParent.usageYears.findIndex(
      (org) => org.flowObject?.refDirection === 'destination'
    );
    const indexLoc = defaultValueParent.locations.findIndex(
      (org) => org.flowObject?.refDirection === 'destination'
    );
    const indexEmr =
      defaultValueParent.emergencies?.findIndex(
        (org) => org.flowObject?.refDirection === 'destination'
      ) ?? -1;
    const indexGlo =
      defaultValueParent.globalClusters?.findIndex(
        (org) => org.flowObject?.refDirection === 'destination'
      ) ?? -1;
    const indexPln =
      defaultValueParent.plans?.findIndex(
        (org) => org.flowObject?.refDirection === 'destination'
      ) ?? -1;
    // const indexEnt = defaultValueParent.governingEntities?.findIndex((org) => org.flowObject?.refDirection === 'destination') ?? -1;
    const indexPro =
      defaultValueParent.projects?.findIndex(
        (org) => org.flowObject?.refDirection === 'destination'
      ) ?? -1;

    const _sourceOrganizations =
      indexOrg > -1
        ? {
            displayLabel: `${defaultValueParent.organizations[indexOrg].name} [${defaultValueParent.organizations[indexOrg].abbreviation}]`,
            value: defaultValueParent.organizations[indexOrg].id,
          }
        : null;
    const _sourceUsageYears =
      indexYear > -1
        ? {
            displayLabel: `${defaultValueParent.usageYears[indexYear].year}`,
            value: defaultValueParent.usageYears[indexYear].id,
          }
        : null;
    const _sourceLocations =
      indexLoc > -1
        ? {
            displayLabel: `${defaultValueParent.locations[indexLoc].name}`,
            value: defaultValueParent.locations[indexLoc].id,
          }
        : null;
    const _sourceEmergencies =
      indexEmr > -1 && defaultValueParent.emergencies
        ? {
            displayLabel: `${defaultValueParent.emergencies[indexEmr].name}`,
            value: defaultValueParent.emergencies[indexEmr].id,
          }
        : null;
    const _sourceGlobalClusters =
      indexGlo > -1 && defaultValueParent.globalClusters
        ? {
            displayLabel: `${defaultValueParent.globalClusters[indexGlo].name}`,
            value: defaultValueParent.globalClusters[indexGlo].id,
          }
        : null;
    const _sourcePlans =
      indexPln > -1 && defaultValueParent.plans
        ? {
            displayLabel: `${defaultValueParent.plans[indexPln].planVersion.name}`,
            value: defaultValueParent.plans[indexPln].id,
          }
        : null;
    // const _sourceGoverningEntities = indexEnt>-1 ? {
    //   displayLabel: `${defaultValueParent.governingEntities[indexEnt].name}`,
    //   value: defaultValueParent.governingEntities[indexEnt].id,
    // } : null
    const _sourceProjects =
      indexPro > -1 && defaultValueParent.projects
        ? {
            displayLabel: `${defaultValueParent.projects[indexPro].projectVersions[indexPro].name}`,
            value: defaultValueParent.projects[indexPro].id,
          }
        : null;
    setValues({
      ...values,
      sourceOrganizations: _sourceOrganizations ? [_sourceOrganizations] : [],
      sourceUsageYears: _sourceUsageYears ? [_sourceUsageYears] : [],
      sourceLocations: _sourceLocations ? [_sourceLocations] : [],
      sourceEmergencies: _sourceEmergencies ? [_sourceEmergencies] : [],
      sourceGlobalClusters: _sourceGlobalClusters
        ? [_sourceGlobalClusters]
        : [],
      sourcePlans: _sourcePlans ? [_sourcePlans] : [],
      // sourceGoverningEntities: _sourceGoverningEntities ? [_sourceGoverningEntities] : [],
      sourceProjects: _sourceProjects ? [_sourceProjects] : [],
    });
  };

  return (
    <Formik
      initialValues={initialValue}
      onSubmit={handleSubmit}
      validate={(values) => validateForm(values)}
      enableReinitialize
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
              {alertflag && (
                <MuiAlert
                  severity="success"
                  style={{ marginBottom: '20px' }}
                  onClose={() => {
                    setAlertFlag(false);
                  }}
                >
                  <AlertTitle>Success</AlertTitle>
                  Flow
                  <a
                    href={`${sharePath}`}
                    style={{ textDecoration: 'underline' }}
                  >
                    {' '}
                    {currentFlowID}{' '}
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
                <StyledFullSection
                  style={{
                    pointerEvents: isShowParentFlow ? 'none' : 'auto',
                  }}
                >
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
                                    {object.year || object.name}
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

                    <C.AsyncAutocompleteSelect
                      label="Organization(s)"
                      name="sourceOrganizations"
                      fnPromise={
                        environment.model.organizations
                          .getAutocompleteOrganizations
                      }
                      behavior={FORM_SETTINGS.organization.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      isMulti
                      entryInfo={inputEntries.sourceOrganizations}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <StyledRow>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelect
                          label="Usage Year(s)"
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
                        />
                      </StyledHalfSection>
                      <StyledHalfSection>
                        <C.AsyncAutocompleteSelect
                          label="Country(ies) (Admin level 0)"
                          name="sourceLocations"
                          fnPromise={
                            environment.model.locations.getAutocompleteLocations
                          }
                          behavior={FORM_SETTINGS.location.behavior}
                          isMulti
                          entryInfo={inputEntries.sourceLocations}
                          rejectInputEntry={rejectInputEntry}
                        />
                      </StyledHalfSection>
                    </StyledRow>
                    <C.AsyncAutocompleteSelect
                      label="Emergency(ies)"
                      name="sourceEmergencies"
                      fnPromise={
                        environment.model.emergencies.getAutocompleteEmergencies
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      behavior={FORM_SETTINGS.emergency.behavior}
                      isMulti
                      entryInfo={inputEntries.sourceEmergencies}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncAutocompleteSelect
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
                    />
                    <C.AsyncAutocompleteSelect
                      label="Plan"
                      name="sourcePlans"
                      fnPromise={environment.model.plans.getAutocompletePlans}
                      isMulti
                      behavior={FORM_SETTINGS.plan.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      entryInfo={inputEntries.sourcePlans}
                      rejectInputEntry={rejectInputEntry}
                    />
                    {showSourceGoverningEntities && (
                      <C.AsyncAutocompleteSelect
                        label="Field Cluster(s)"
                        name="sourceGoverningEntities"
                        optionsData={sourceGoverningEntities}
                        // fnPromise={environment.model.governingEntities.getAllPlanGoverningEntities}
                        isMulti
                        behavior={FORM_SETTINGS.governingEntity.behavior}
                        isAutocompleteAPI={false}
                        entryInfo={inputEntries.sourceGoverningEntities}
                        rejectInputEntry={rejectInputEntry}
                      />
                    )}
                    <C.AsyncAutocompleteSelect
                      label="Project"
                      name="sourceProjects"
                      fnPromise={
                        environment.model.projects.getAutocompleteProjects
                      }
                      behavior={FORM_SETTINGS.project.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      isMulti
                      entryInfo={inputEntries.sourceProjects}
                      rejectInputEntry={rejectInputEntry}
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
                    <C.AsyncAutocompleteSelect
                      label="Organization(s)"
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
                        <C.AsyncAutocompleteSelect
                          label="Usage Year(s)"
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
                        <C.AsyncAutocompleteSelect
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
                    <C.AsyncAutocompleteSelect
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
                    <C.AsyncAutocompleteSelect
                      label="Plan"
                      name="destinationPlans"
                      fnPromise={environment.model.plans.getAutocompletePlans}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      behavior={FORM_SETTINGS.plan.behavior}
                      isMulti
                      entryInfo={inputEntries.destinationPlans}
                      rejectInputEntry={rejectInputEntry}
                    />
                    {showDestinationGoverningEntities && (
                      <C.AsyncAutocompleteSelect
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
                    <C.AsyncAutocompleteSelect
                      label="Emergency(ies)"
                      name="destinationEmergencies"
                      fnPromise={
                        environment.model.emergencies.getAutocompleteEmergencies
                      }
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
                      }}
                      isMulti
                      entryInfo={inputEntries.destinationEmergencies}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncAutocompleteSelect
                      label="Project"
                      name="destinationProjects"
                      fnPromise={
                        environment.model.projects.getAutocompleteProjects
                      }
                      behavior={FORM_SETTINGS.project.behavior}
                      onChange={(event, value) => {
                        updateFlowObjects(event, value, setFieldValue);
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
                      disabled={isShowParentFlow}
                    />
                    <StyledFormRow>
                      <C.TextFieldWrapper
                        label="Funding Amount in USD"
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
                          <C.AsyncAutocompleteSelect
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
                      label="Funding Flow Description"
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
                        label="First Reported"
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
                      label="Flow Type"
                      name="flowType"
                      fnPromise={fetchCategory('flowType')}
                      returnObject
                      entryInfo={inputEntries.flowType}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncSingleSelect
                      label="Flow Status"
                      name="flowStatus"
                      fnPromise={fetchCategory('flowStatus')}
                      returnObject
                      entryInfo={inputEntries.flowStatus}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.DatePicker name="flowDate" label="Flow Date" />
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
                      label="Aid Modality"
                      name="method"
                      fnPromise={fetchCategory('method')}
                      returnObject
                      entryInfo={inputEntries.method}
                      rejectInputEntry={rejectInputEntry}
                    />
                    <C.AsyncAutocompleteSelect
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
                                  #
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).id
                                  }
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
                                    ).flowDate
                                  ).format('MM/DD/YYYY')}
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
                {isShowChildFlow && (
                  <StyledRow>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableBody>
                          {values.childFlow &&
                            values.childFlow.map((item, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  '&:last-child td, &:last-child th': {
                                    border: 0,
                                  },
                                }}
                              >
                                <TableCell>
                                  #
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).id
                                  }
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
                                    ).dest_org_name
                                  }{' '}
                                  |{' '}
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).dest_org_abbreviation
                                  }{' '}
                                  |{' '}
                                  {
                                    JSON.parse(
                                      item?.value ? item?.value.toString() : ''
                                    ).dest_loc_name
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
                                    ).flowDate
                                  ).format('MM/DD/YYYY')}
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
                                      handleChildFlow(
                                        values,
                                        setFieldValue,
                                        index
                                      );
                                      setLinkCheck(false);
                                      // setShowChildFlow(false);
                                      setShowWarningMessage(false);
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
                              <C.AsyncAutocompleteSelect
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
                            callback: (value: any) => {
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
                            <C.AsyncAutocompleteSelect
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
                          callback: (value: any) => {
                            setShowChildFlow(true);
                            setShowWarningMessage(true);
                            setLinkCheck(true);
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
                        <C.FormSection title="Reporting Details">
                          <StyledRow>
                            <StyledHalfSection>
                              <C.RadioGroup
                                name={`reportDetails[${index}].reportSource`}
                                options={[
                                  { value: 'primary', label: 'Primary' },
                                  { value: 'secondary', label: 'Secondary' },
                                ]}
                                label="Report Source"
                                row
                              />
                              <C.AsyncAutocompleteSelect
                                label="Reported By Organization"
                                name={`reportDetails[${index}].reportedOrganization`}
                                placeholder="Reported by Organization"
                                fnPromise={
                                  environment.model.organizations
                                    .getAutocompleteOrganizations
                                }
                              />
                              <C.AsyncSingleSelect
                                label="Reported Channel"
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
                                <C.TextFieldWrapper
                                  label="Title"
                                  name={`reportDetails[${index}].reportFileTitle`}
                                  type="text"
                                />
                                <C.FileUpload
                                  name=""
                                  label=""
                                  onChange={handleFileChange}
                                />
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
                                  label="Verified"
                                  row
                                />
                              </StyledRadioDiv>
                              <C.DatePicker
                                name={`reportDetails[${index}].reportedDate`}
                                label="Date Reported"
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
                              {(row.reportChannel as AutoCompleteSeletionType)
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
            {initialValue.inactiveReason === 'Pending review' && (
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
              {!readOnly && (
                <C.ButtonSubmit
                  color="primary"
                  text={isEdit ? 'Save' : 'Create'}
                />
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
                  <Button variant="outlined" startIcon={<ContentCopyIcon />}>
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
