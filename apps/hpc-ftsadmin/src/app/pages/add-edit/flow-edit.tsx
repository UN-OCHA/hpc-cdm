import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Tooltip, TooltipProps, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { isRight } from 'fp-ts/lib/Either';
import * as ts from 'io-ts';
import _, { values } from 'lodash';
import {
  C,
  CLASSES,
  combineClasses,
  useDataLoader,
  THEME,
} from '@unocha/hpc-ui';
import { categories, flows, forms, usageYears } from '@unocha/hpc-data';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext, getEnv } from '../../context';
import tw from 'twin.macro';
import FlowForm, {
  FormValues,
  ReportDetailType,
  VersionDataType,
  InputEntriesType,
  AutoCompleteSelectionType,
  ReportFileType,
} from '../../components/flow-form';
import {
  FLOWS_FILTER_INITIAL_VALUES,
  FlowsFilterValues,
} from '../../components/filters/filter-flows-table';
import { encodeFilters } from '../../utils/parse-filters';
import {
  getSearchKeyValues,
  getFormValueFromCategory,
  getFormValueFromFunding,
  getNameOfFundingValue,
  FundingSrcType,
  FundingObjectType,
  compareSelectValues,
  IndividualFormValueType,
  isArrayFieldOfInputEntries,
  enumInputEntryVsSrcObjType,
} from '../../utils/parse-form-values';

dayjs.extend(advancedFormat);

interface Props {
  className?: string;
  isEdit: boolean;
}

interface Participant {
  name?: string;
  email?: string;
}

const StyledLoader = tw(C.Loader)`
mx-auto
`;

const StyledAnchor = tw.a`
underline
`;

const StyledAnchorDiv = tw.div`
text-2xl
float-right
`;

const StyledSubTitle = tw.h3`
text-2xl
`;

const StyledInactiveTitle = tw.span`
text-gray-500
`;

const StyledTitle = tw.div`
flex
justify-between
`;
const StyledRestrictedCheckBox = tw.div`
inline-flex
items-center
justify-center
`;

const YellowTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#ffec1a',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

const initialFormData = {
  amountUSD: 0,
  amountOriginal: 0,
  exchangeRateUsed: 0,
  keywords: [],
  flowStatus: '',
  flowType: { value: 133, displayLabel: 'Standard' },
  flowDescription: '',
  firstReported: dayjs(),
  decisionDate: null,
  budgetYear: '',
  flowDate: '',
  contributionType: { value: 50, displayLabel: 'Financial' },
  earmarkingType: '',
  method: { value: 156, displayLabel: 'Traditional aid' },
  beneficiaryGroup: '',
  inactiveReason: '',
  notes: '',
  sourceOrganizations: [],
  sourceLocations: [],
  sourceUsageYears: [],
  sourceProjects: [],
  sourcePlans: [],
  sourceGoverningEntities: [],
  sourceGlobalClusters: [],
  sourceEmergencies: [],
  destinationOrganizations: [],
  destinationLocations: [],
  destinationUsageYears: [],
  destinationProjects: [],
  destinationPlans: [],
  destinationGoverningEntities: [],
  destinationGlobalClusters: [],
  destinationEmergencies: [],
  origCurrency: '',
  includeChildrenOfParkedFlows: true,
  reportDetails: [
    {
      verified: 'verified',
      reportSource: 'primary',
      reporterReferenceCode: '',
      reportChannel: '',
      reportedOrganization: { value: '', displayLabel: '' },
      reportedDate: '',
      reporterContactInformation: '',
      sourceSystemRecordId: '',
      reportFiles: [
        {
          title: '',
          fileName: '',
          UploadFileUrl: '',
          size: 0,
          type: '',
        },
      ],
      reportFileTitle: '',
      reportUrlTitle: '',
      reportUrl: '',
    },
  ],
  parentFlow: [],
  childFlow: [],
  isParkedParent: false,
  sources: {},
};

const initialInputEntries = {
  amountUSD: null,
  keywords: null,
  flowStatus: null,
  flowType: null,
  flowDescription: null,
  contributionType: null,
  earmarkingType: null,
  method: null,
  beneficiaryGroup: null,
  inactiveReason: null,
  amountOriginal: null,
  exchangeRateUsed: null,
  notes: null,
  sourceOrganizations: [],
  sourceLocations: [],
  sourceUsageYears: [],
  sourceProjects: [],
  sourcePlans: [],
  sourceGoverningEntities: [],
  sourceGlobalClusters: [],
  sourceEmergencies: [],
  destinationOrganizations: [],
  destinationLocations: [],
  destinationUsageYears: [],
  destinationProjects: [],
  destinationPlans: [],
  destinationGoverningEntities: [],
  destinationGlobalClusters: [],
  destinationEmergencies: [],
  parentFlow: [],
  childFlow: [],
  isParkedParent: false,
  sources: [],
};

export default (props: Props) => {
  const env = getEnv();
  const { flowId, versionId } = useParams<{
    flowId: string;
    versionId: string;
  }>();
  const [flowData, setFlowData] = useState<FormValues>(
    JSON.parse(JSON.stringify(initialFormData))
  );
  const [inputEntries, setInputEntries] = useState<InputEntriesType>(
    JSON.parse(JSON.stringify(initialInputEntries))
  );
  const [previousReportDetails, setPreviousReportDetails] = useState<
    ReportDetailType[]
  >([]);
  const [versionData, setVersionData] = useState<VersionDataType[]>([]);
  const [isSetupInitialValue, setIsSetupInitialValue] = useState<boolean>(
    !props.isEdit
  );
  const [latestVersion, setLatestVersion] = useState<number>(
    parseInt(versionId as string)
  );
  const [currentVersionID, setCurrentVersionID] = useState<number>(0);
  const [currentFlowID, setCurrentFlowID] = useState<number>(0);
  const [currentVersionActiveStatus, setCurrentVersionActiveStatus] =
    useState<boolean>(true);
  const [flowDetail, setFlowDetail] = useState<flows.FlowREST | null>(null);
  const [activeVersionID, setActiveVersionID] = useState<number>(0);
  const [pendingVersionID, setPendingVersionID] = useState<number>();
  const [pendingVersionV1, setPendingVersionV1] = useState<boolean>(false);
  const [isPendingFlow, setIsPendingFlow] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isCancellation, setIsCancellation] = useState<boolean>(false);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const [isSuperseded, setIsSuperseded] = useState<boolean>(false);
  const [isNewPending, setIsNewPending] = useState<boolean>(false);
  const [isUpdatePending, setIsUpdatePending] = useState<boolean>(false);
  const [canReactive, setCanReactive] = useState<boolean>(false);
  const [pendingFieldsallApplied, setPendingFieldsallApplied] =
    useState<boolean>(false);
  const [allFieldsReviewed, setAllFieldsReviewed] = useState<boolean>(false);
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [parentFlow, setParentFlow] = useState<AutoCompleteSelectionType[]>([]);
  const [childFlow, setChildFlow] = useState<AutoCompleteSelectionType[]>([]);
  const [parentIds, setParentIds] = useState<number[]>([]);
  const [childIds, setChildIds] = useState<number[]>([]);
  // const [isParkedParent, setIsParkedParent] = useState<boolean>(false);
  // const [sources, setSources] = useState<Record<string, any[]>>({});

  function displayUserName(participant: Participant | null): string {
    if (participant?.name) {
      return participant.name;
    }
    if (participant?.email) {
      return participant.email;
    }
    return 'FTS user';
  }

  const [state] = useDataLoader([flowId, versionId], () => {
    if (props.isEdit && parseInt(versionId as string) === latestVersion) {
      const versionIds = new Array(latestVersion).fill(0);
      return Promise.all(
        versionIds.map((_, index) =>
          env.model.flows.getFlowREST({
            id: parseInt(flowId as string),
            versionId: index + 1,
          })
        )
      );
    } else {
      return Promise.resolve([]);
    }
  });

  const [fullState] = useDataLoader([flowId, latestVersion], () => {
    if (props.isEdit && parseInt(versionId as string) !== latestVersion) {
      const versionIds = new Array(
        latestVersion - parseInt(versionId as string)
      ).fill(0);
      return Promise.all(
        versionIds.map((_, index) =>
          env.model.flows.getFlowREST({
            id: parseInt(flowId as string),
            versionId: parseInt(versionId as string) + index + 1,
          })
        )
      );
    } else {
      return Promise.resolve([]);
    }
  });

  const handleSimilarFlowLink = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const paramsObject: Record<string, string> = {
        orderBy: 'flow.updatedAt',
        orderDir: 'DESC',
        page: '0',
        rowsPerPage: '50',
      };

      const flowsFilterInitialValues: FlowsFilterValues = {};
      if (flowData.sourceLocations.length > 0) {
        flowsFilterInitialValues.sourceLocations = getSearchKeyValues(
          flowData,
          'sourceLocations'
        );
      }

      if (flowData.sourceOrganizations.length > 0) {
        flowsFilterInitialValues.sourceOrganizations = getSearchKeyValues(
          flowData,
          'sourceOrganizations'
        );
      }

      if (flowData.destinationOrganizations.length > 0) {
        flowsFilterInitialValues.destinationOrganizations = getSearchKeyValues(
          flowData,
          'destinationOrganizations'
        );
      }

      if (flowData.destinationPlans.length > 0) {
        flowsFilterInitialValues.destinationPlans = getSearchKeyValues(
          flowData,
          'destinationPlans'
        );
      }
      paramsObject['filters'] = JSON.stringify(
        encodeFilters(flowsFilterInitialValues, FLOWS_FILTER_INITIAL_VALUES)
      );

      const params = new URLSearchParams(paramsObject);
      const newUrl = `/flows/?${params.toString()}`;
      window.open(newUrl, '_blank');
    },
    [flowData]
  );

  const handleRestricted = (isChecked: boolean) => {
    if (isChecked) {
      setIsRestricted(true);
    } else {
      setIsRestricted(false);
    }
  };

  const initializeInputEntries = () => {
    const tmpEntries = JSON.parse(JSON.stringify(initialInputEntries));
    Object.keys(inputEntries).forEach((key) => {
      const specificKey = key as keyof InputEntriesType;
      const value = inputEntries[specificKey];

      if (isRight(ts.array(forms.INPUT_ENTRY_TYPE).decode(value))) {
        tmpEntries[specificKey] = (value as forms.InputEntryType[]).filter(
          (inputEntry) =>
            inputEntry.category !== forms.InputEntryCategoriesEnum.ACTIVE_FLOW
        );
      }
    });
    setPendingFieldsallApplied(true);
    setInputEntries(tmpEntries);
  };

  const rejectInputEntry = (key: string) => {
    const tmpEntries = JSON.parse(JSON.stringify(inputEntries));
    const specificKey = key as keyof InputEntriesType;
    const value = inputEntries[specificKey];
    if (isRight(ts.array(forms.INPUT_ENTRY_TYPE).decode(value))) {
      tmpEntries[specificKey] = (value as forms.InputEntryType[]).filter(
        (inputEntry) =>
          inputEntry.category !== forms.InputEntryCategoriesEnum.ACTIVE_FLOW
      );
    } else {
      tmpEntries[specificKey] = null;
    }

    setInputEntries(tmpEntries);
  };

  const createInputEntryActiveFlow = (
    pendingData: IndividualFormValueType,
    currentData: IndividualFormValueType,
    key: keyof InputEntriesType
  ) => {
    const inputEntry = {
      category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
      value: pendingData,
      kind: !pendingData
        ? forms.InputEntryKindsEnum.DELETED
        : !currentData
        ? forms.InputEntryKindsEnum.NEW
        : forms.InputEntryKindsEnum.REVISED,
    } as forms.InputEntryType;

    if (compareSelectValues(pendingData, currentData)) {
      if (isArrayFieldOfInputEntries(key)) {
        (inputEntries[key] as forms.InputEntryType[]).push(inputEntry);
      } else {
        (inputEntries[key] as forms.InputEntryType) = inputEntry;
      }
    }
  };

  const createInputEntryExternal = (
    src: string,
    objType: string,
    externalData: string
  ) => {
    const srcInputEntryEnum =
      enumInputEntryVsSrcObjType[
        src as keyof typeof enumInputEntryVsSrcObjType
      ];
    const key = srcInputEntryEnum[
      objType as keyof typeof srcInputEntryEnum
    ] as keyof InputEntriesType;

    const inputEntry = {
      category: forms.InputEntryCategoriesEnum.EXTERNAL,
      value: externalData,
      kind: forms.InputEntryKindsEnum.UNMATCHED,
    };

    const tempEntries = (inputEntries[key] as forms.InputEntryType[]).filter(
      (entry) => entry.category !== forms.InputEntryCategoriesEnum.ACTIVE_FLOW
    );
    tempEntries.push(inputEntry);
    (inputEntries[key] as forms.InputEntryType[]) = tempEntries;
  };

  useEffect(() => {
    try {
      const fetchData = async () => {
        const parentResults = await Promise.all(
          parentIds.map((id) =>
            env.model.flows.getFlowREST({
              id,
            })
          )
        );

        let isParkedParent = false;
        const sources: Record<string, any[]> = {};

        if (parentResults && parentResults[0] && parentResults[0].categories) {
          const parent = parentResults[0];
          isParkedParent = parent.categories.some(function (category) {
            return (
              category.group === 'flowType' &&
              category.name.toLowerCase() === 'parked'
            );
          });

          parent.flowObjects
            .filter(function (flowObject) {
              return flowObject.refDirection === 'source';
            })
            .forEach(function (flowObject) {
              const objectType = flowObject.objectType;
              const objTypeTail = objectType[flowObject.objectType.length - 1];

              let objectTypePlural: string;
              if (objTypeTail === 'y') {
                objectTypePlural = objectType.replace('y', 'ies');
              } else {
                objectTypePlural = objectType + 's';
              }
              if (
                !sources[objectTypePlural] ||
                !sources[objectTypePlural].length
              ) {
                sources[objectTypePlural] = [];
              }

              const parentArray =
                parent[objectTypePlural as keyof typeof parent];
              if (parentArray && Array.isArray(parentArray)) {
                const foundObject = parentArray.find((obj: any) => {
                  return flowObject.objectID === obj.id;
                });
                if (foundObject) {
                  sources[objectTypePlural].push(foundObject);
                }
              }
            });

          const srcUsageYear: usageYears.UsageYear[] = [];
          const destUsageYear: usageYears.UsageYear[] = [];
          parent.usageYears.map((item: usageYears.UsageYear) => {
            if (item.flowObject && item.flowObject.refDirection === 'source') {
              srcUsageYear.push(item);
            }
            if (
              item.flowObject &&
              item.flowObject.refDirection === 'destination'
            ) {
              destUsageYear.push(item);
            }
          });
          if (
            isParkedParent &&
            Array.isArray(srcUsageYear) &&
            srcUsageYear.length > 1 &&
            Array.isArray(destUsageYear) &&
            destUsageYear.length === 1
          ) {
            sources.usageYears = destUsageYear;
          }
        } else {
          isParkedParent = false;
        }

        // setIsParkedParent(isParkedParent);
        // setSources(sources);

        const parentFlowData = parentResults.map((value) => {
          const refDirectionIndexSrc =
            value && value.organizations
              ? value.organizations.findIndex(
                  (org) => org.flowObject?.refDirection === 'source'
                )
              : -1;
          const refDirectionIndexDes =
            value && value.organizations
              ? value.organizations.findIndex(
                  (org) => org.flowObject?.refDirection === 'destination'
                )
              : -1;
          const refDirectionLocIndexDes =
            value && value.locations
              ? value.locations.findIndex(
                  (org) => org.flowObject?.refDirection === 'destination'
                )
              : -1;
          return {
            displayLabel: `Flow ${value.id}: ${value.description} Source: ${
              value.organizations && value.organizations[refDirectionIndexSrc]
                ? value.organizations[refDirectionIndexSrc].name
                : ''
            } | Destination: ${
              value.organizations && value.organizations[refDirectionIndexDes]
                ? value.organizations[refDirectionIndexDes].name
                : ''
            }`,
            value: JSON.stringify({
              src_org_name:
                value.organizations && value.organizations[refDirectionIndexSrc]
                  ? value.organizations[refDirectionIndexSrc].name
                  : '',
              src_org_abbreviation:
                value.organizations && value.organizations[refDirectionIndexSrc]
                  ? value.organizations[refDirectionIndexSrc].abbreviation
                  : '',
              dest_org_name:
                value.organizations && value.organizations[refDirectionIndexDes]
                  ? value.organizations[refDirectionIndexDes].name
                  : '',
              dest_org_abbreviation:
                value.organizations && value.organizations[refDirectionIndexDes]
                  ? value.organizations[refDirectionIndexDes].abbreviation
                  : '',
              dest_loc_name:
                value.locations &&
                value.locations[refDirectionLocIndexDes] &&
                refDirectionLocIndexDes > -1
                  ? value.locations[refDirectionLocIndexDes].name
                  : '',
              versionId: value.versionID,
              origCurrency: value.origCurrency,
              ...value,
            }),
          };
        });

        setFlowData({
          ...flowData,
          isParkedParent,
          sources,
          parentFlow: parentFlowData,
          includeChildrenOfParkedFlows: false,
        });
      };

      fetchData();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [parentIds, flowData?.childFlow]);
  useEffect(() => {
    try {
      const fetchData = async () => {
        const childResults = await Promise.all(
          childIds.map((id) =>
            env.model.flows.getFlowREST({
              id,
            })
          )
        );

        const childFlowData = childResults.map((value) => {
          const refDirectionIndexSrc =
            value && value.organizations
              ? value.organizations.findIndex(
                  (org) => org.flowObject?.refDirection === 'source'
                )
              : -1;
          const refDirectionIndexDes =
            value && value.organizations
              ? value.organizations.findIndex(
                  (org) => org.flowObject?.refDirection === 'destination'
                )
              : -1;
          const refDirectionLocIndexDes =
            value && value.locations
              ? value.locations.findIndex(
                  (org) => org.flowObject?.refDirection === 'destination'
                )
              : -1;
          return {
            displayLabel: `Flow ${value.id}: ${value.description} Source: ${
              value.organizations && value.organizations[refDirectionIndexSrc]
                ? value.organizations[refDirectionIndexSrc].name
                : ''
            } | Destination: ${
              value.organizations && value.organizations[refDirectionIndexDes]
                ? value.organizations[refDirectionIndexDes].name
                : ''
            }`,
            value: JSON.stringify({
              activeStatus: value.activeStatus,
              id: value.id,
              description: value.description,
              src_org_name:
                value.organizations && value.organizations[refDirectionIndexSrc]
                  ? value.organizations[refDirectionIndexSrc].name
                  : '',
              src_org_abbreviation:
                value.organizations && value.organizations[refDirectionIndexSrc]
                  ? value.organizations[refDirectionIndexSrc].abbreviation
                  : '',
              dest_org_name:
                value.organizations && value.organizations[refDirectionIndexDes]
                  ? value.organizations[refDirectionIndexDes].name
                  : '',
              dest_org_abbreviation:
                value.organizations && value.organizations[refDirectionIndexDes]
                  ? value.organizations[refDirectionIndexDes].abbreviation
                  : '',
              dest_loc_name:
                value.locations &&
                value.locations[refDirectionLocIndexDes] &&
                refDirectionLocIndexDes > -1
                  ? value.locations[refDirectionLocIndexDes].name
                  : '',
              budgetYear: value.budgetYear,
              flowDate: value.flowDate,
              amountUSD: value.amountUSD,
              origAmount: value.origAmount,
              versionID: value.versionID,
              origCurrency: value.origCurrency,
            }),
          };
        });
        setFlowData({
          ...flowData,
          childFlow: childFlowData,
        });
      };

      fetchData();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [childIds]);

  useEffect(() => {
    if (
      props.isEdit &&
      state.type === 'success' &&
      state.data.length > 0 &&
      ((parseInt(versionId as string) !== latestVersion &&
        fullState.type === 'success' &&
        fullState.data.length > 0) ||
        parseInt(versionId as string) === latestVersion)
    ) {
      const currentVersionData = state.data[parseInt(versionId as string) - 1];
      setFlowDetail(currentVersionData);
      setCurrentVersionID(currentVersionData.versionID);
      setCurrentFlowID(currentVersionData.id);
      if (
        currentVersionData.versions.length !== latestVersion ||
        fullState.type !== 'success'
      ) {
        setLatestVersion(currentVersionData.versions.length);
        return undefined;
      }
      const fullData = [...state.data, ...fullState.data];
      const inactiveReason = (
        getFormValueFromCategory(
          currentVersionData,
          'inactiveReason',
          false
        ) as AutoCompleteSelectionType
      ).displayLabel;
      setCurrentVersionActiveStatus(
        currentVersionData.activeStatus || inactiveReason === 'Pending review'
      );
      const isActiveVsPending =
        fullData.length > 1 && inactiveReason === 'Pending review';
      const data = isActiveVsPending
        ? fullData.find((flowDetailData) => flowDetailData.activeStatus) ??
          currentVersionData
        : currentVersionData;
      const checkExternalRef = (
        src: FundingSrcType,
        objType: FundingObjectType,
        id: number | string,
        refType: string
      ) => {
        const result = (
          (data.externalReferences ?? []) as flows.FlowExternalReference[]
        ).reduce((value: boolean | null | undefined, infoRef) => {
          if (value) {
            return true;
          } else {
            if (refType === 'inferred') {
              return infoRef?.importInformation?.inferred?.reduce(
                (val, inferredInfo) => {
                  if (val) {
                    return true;
                  } else {
                    return (
                      inferredInfo.key === `flowObjects.${src}.${objType}` &&
                      id === inferredInfo.valueId
                    );
                  }
                },
                false
              );
            }

            if (refType === 'transferred') {
              return infoRef?.importInformation?.transferred?.reduce(
                (val, transferredInfo) => {
                  if (val) {
                    return true;
                  } else {
                    return (
                      transferredInfo.key === `flowObjects.${src}.${objType}` &&
                      id === transferredInfo.valueId
                    );
                  }
                },
                false
              );
            }

            return false;
          }
        }, false);

        return !!result;
      };

      const amountUSD = parseFloat(data.amountUSD);
      const amountOriginal = parseFloat(data.origAmount ?? '') || null;
      const exchangeRateUsed = parseFloat(data.exchangeRate ?? '') || null;
      const origCurrency = data.origCurrency ?? '';
      // console.log(env.model.currencies)
      // const origCurrency = env.model.currencies.map(option => {
      //   if(option.code === data.origCurrency) {
      //     return {
      //       value: option.id,
      //       displayLabel: option.code,
      //     };
      //   }
      // })
      // console.log('origCurrency', origCurrency)
      const keywords = getFormValueFromCategory(
        data,
        'keywords',
        true
      ) as AutoCompleteSelectionType[];
      const earmarkingType = getFormValueFromCategory(
        data,
        'earmarkingType',
        false
      ) as AutoCompleteSelectionType;
      const sourceOrganizations = getFormValueFromFunding(
        data,
        'source',
        'organization',
        checkExternalRef
      );
      const destinationOrganizations = getFormValueFromFunding(
        data,
        'destination',
        'organization',
        checkExternalRef
      );
      const sourceLocations = getFormValueFromFunding(
        data,
        'source',
        'location',
        checkExternalRef
      );
      const destinationLocations = getFormValueFromFunding(
        data,
        'destination',
        'location',
        checkExternalRef
      );
      const sourceUsageYears = getFormValueFromFunding(
        data,
        'source',
        'usageYear',
        checkExternalRef
      );
      const destinationUsageYears = getFormValueFromFunding(
        data,
        'destination',
        'usageYear',
        checkExternalRef
      );
      const sourceGlobalClusters = getFormValueFromFunding(
        data,
        'source',
        'globalCluster',
        checkExternalRef
      );
      const destinationGlobalClusters = getFormValueFromFunding(
        data,
        'destination',
        'globalCluster',
        checkExternalRef
      );
      const sourceEmergencies = getFormValueFromFunding(
        data,
        'source',
        'emergency',
        checkExternalRef
      );
      const destinationEmergencies = getFormValueFromFunding(
        data,
        'destination',
        'emergency',
        checkExternalRef
      );
      const sourceProjects = getFormValueFromFunding(
        data,
        'source',
        'project',
        checkExternalRef
      );
      const destinationProjects = getFormValueFromFunding(
        data,
        'destination',
        'project',
        checkExternalRef
      );
      const sourcePlans = getFormValueFromFunding(
        data,
        'source',
        'plan',
        checkExternalRef
      );
      const sourceGoverningEntities = getFormValueFromFunding(
        data,
        'source',
        'governingEntity',
        checkExternalRef
      );
      const destinationPlans = getFormValueFromFunding(
        data,
        'destination',
        'plan',
        checkExternalRef
      );
      const destinationGoverningEntities = getFormValueFromFunding(
        data,
        'destination',
        'governingEntity',
        checkExternalRef
      );
      const flowDescription = data.description;
      const firstReported = dayjs(data.firstReportedDate).format('DD/MM/YYYY');
      const decisionDate = data.decisionDate
        ? dayjs(data.decisionDate).format('DD/MM/YYYY')
        : null;
      const budgetYear = data.budgetYear ?? '';
      const flowDate = dayjs(data.flowDate).format('DD/MM/YYYY');
      const notes = data.notes ?? '';
      const flowStatus = getFormValueFromCategory(
        data,
        'flowStatus',
        false
      ) as AutoCompleteSelectionType;
      const flowType = getFormValueFromCategory(
        data,
        'flowType',
        false
      ) as AutoCompleteSelectionType;
      const contributionType = getFormValueFromCategory(
        data,
        'contributionType',
        false
      ) as AutoCompleteSelectionType;
      const method = getFormValueFromCategory(
        data,
        'method',
        false
      ) as AutoCompleteSelectionType;
      const beneficiaryGroup = getFormValueFromCategory(
        data,
        'beneficiaryGroup',
        false
      ) as AutoCompleteSelectionType;

      const parentIds = data.parents.map((item) => item.parentID);
      const childIds = data.children.map((item) => item.childID);

      setParentIds(parentIds);
      setChildIds(childIds);

      const reportDetails = data.reportDetails.map((detail) => ({
        verified: detail.verified ? 'verified' : 'unverified',
        reportSource: detail.source === 'Primary' ? 'primary' : 'secondary',
        reporterReferenceCode: detail.refCode ?? '',
        reportChannel:
          (detail?.categories ?? [])
            .filter((category) => category.group === 'reportChannel')
            .map((category) => ({
              value: category.id,
              displayLabel: category.name,
            }))[0] ?? '',
        reportedOrganization: {
          value: detail?.organization?.id ?? 0,
          displayLabel: `${detail?.organization?.name} [${detail?.organization?.abbreviation}]`,
        },
        reportedDate: dayjs(detail.date).format('DD/MM/YYYY'),
        reporterContactInformation: detail.contactInfo ?? '',
        sourceSystemRecordId: detail.sourceID ?? '',
        reportFiles: (detail?.reportFiles ?? []).reduce(
          (refileData: ReportFileType[], fileData) => {
            if (fileData.type !== 'url') {
              refileData.push({
                title: fileData.title,
                fileName: fileData.fileAssetEntity.originalname,
                UploadFileUrl: fileData.fileAssetEntity.path,
                fileAssetID: fileData.fileAssetID,
                size: fileData.fileAssetEntity.size,
                type: fileData.fileAssetEntity.mimetype,
              });
            }
            return refileData;
          },
          []
        ),
        reportFileTitle:
          detail.reportFiles &&
          (detail.reportFiles.length > 1
            ? (detail.reportFiles as ReportFileType[]).filter(
                (fileData) => fileData.type !== 'url'
              )[0]?.title
            : detail.reportFiles.filter(
                (fileData) => fileData.type !== 'url'
              )[0]?.title),
        reportUrlTitle:
          detail.reportFiles &&
          (detail.reportFiles as ReportFileType[]).filter(
            (fileData) => fileData.type === 'url'
          )[0]?.title,
        reportUrl:
          detail.reportFiles &&
          (detail.reportFiles as ReportFileType[]).filter(
            (fileData) => fileData.type === 'url'
          )[0]?.url,
        fileAsset:
          detail.reportFiles &&
          (detail.reportFiles.length > 1
            ? (detail.reportFiles as ReportFileType[]).filter(
                (fileData) => fileData.type !== 'url'
              )[0]?.fileAssetEntity
            : detail.reportFiles.filter(
                (fileData) => fileData.type !== 'url'
              )[0]?.fileAssetEntity),
      }));
      const prevReportDetails = state.data.reduce(
        (details, flowItemData, index) => {
          if (index < parseInt(versionId as string) - 1) {
            details = [
              ...details,
              ...flowItemData.reportDetails.map((detail) => ({
                verified: detail.verified ? 'verified' : 'unverified',
                reportSource:
                  detail.source === 'Primary' ? 'primary' : 'secondary',
                reporterReferenceCode: detail.refCode ?? '',
                reportChannel:
                  (detail?.categories ?? [])
                    .filter((category) => category.group === 'reportChannel')
                    .map((category) => ({
                      value: category.id,
                      displayLabel: category.name,
                    }))[0] ?? '',
                reportedOrganization: {
                  value: detail?.organization?.id ?? 0,
                  displayLabel: `${detail?.organization?.name} [${detail?.organization?.abbreviation}]`,
                },
                reportedDate: dayjs(detail.date).format('DD/MM/YYYY'),
                reporterContactInformation: detail.contactInfo ?? '',
                sourceSystemRecordId: detail.sourceID ?? '',
                reportFiles: (detail?.reportFiles ?? []).reduce(
                  (refileData: ReportFileType[], fileData) => {
                    if (fileData.type !== 'url') {
                      refileData.push({
                        title: fileData.title,
                        fileName: fileData.fileAssetEntity.originalname,
                        UploadFileUrl: fileData.fileAssetEntity.path,
                        fileAssetID: fileData.fileAssetID,
                        size: fileData.fileAssetEntity.size,
                        type: fileData.fileAssetEntity.mimetype,
                      });
                    }
                    return refileData;
                  },
                  []
                ),
                reportFileTitle:
                  detail.reportFiles &&
                  (detail.reportFiles.length > 1
                    ? (detail.reportFiles as ReportFileType[]).filter(
                        (fileData) => fileData.type !== 'url'
                      )[0]?.title
                    : detail.reportFiles.filter(
                        (fileData) => fileData.type !== 'url'
                      )[0]?.title),
                reportUrlTitle:
                  detail.reportFiles &&
                  (detail.reportFiles as ReportFileType[]).filter(
                    (fileData) => fileData.type === 'url'
                  )[0]?.title,
                reportUrl:
                  detail.reportFiles &&
                  (detail.reportFiles as ReportFileType[]).filter(
                    (fileData) => fileData.type === 'url'
                  )[0]?.url,
              })),
            ];
          }
          return details;
        },
        [] as ReportDetailType[]
      );
      const versionDetails = fullData.map((flowItemData, index) => ({
        versionId: index + 1,
        flowId: parseInt(flowId as string),
        createdTime: dayjs(flowItemData.createdAt).format(
          'Do MMMM YYYY [at] h:mm:ss a'
        ),
        createdBy: flowItemData.createdBy?.name ?? '',
        updatedTime: dayjs(flowItemData.updatedAt).format(
          'Do MMMM YYYY [at] h:mm:ss a'
        ),
        updatedBy: flowItemData.lastUpdatedBy?.name ?? '',
        active: flowItemData.activeStatus,
        viewing: index + 1 === parseInt(versionId as string),
        pending:
          (
            getFormValueFromCategory(
              flowItemData,
              'inactiveReason',
              false
            ) as AutoCompleteSelectionType
          ).displayLabel === 'Pending review',
        cancellation:
          (
            getFormValueFromCategory(
              flowItemData,
              'pendingStatus',
              false
            ) as AutoCompleteSelectionType
          ).displayLabel === 'cancellation',
        cancelled:
          (
            getFormValueFromCategory(
              flowItemData,
              'inactiveReason',
              false
            ) as AutoCompleteSelectionType
          ).displayLabel === 'cancelled',
        superseded:
          (
            getFormValueFromCategory(
              flowItemData,
              'inactiveReason',
              false
            ) as AutoCompleteSelectionType
          ).displayLabel === 'superseded',
        source: {
          emergencies: getNameOfFundingValue(
            flowItemData,
            'source',
            'emergency'
          ),
          projects: getNameOfFundingValue(flowItemData, 'source', 'project'),
          usageYears: getNameOfFundingValue(
            flowItemData,
            'source',
            'usageYear'
          ),
          globalClusters: getNameOfFundingValue(
            flowItemData,
            'source',
            'globalCluster'
          ),
          locations: getNameOfFundingValue(flowItemData, 'source', 'location'),
          plans: getNameOfFundingValue(flowItemData, 'source', 'plan'),
          organizations: getNameOfFundingValue(
            flowItemData,
            'source',
            'organization'
          ),
        },
        destination: {
          emergencies: getNameOfFundingValue(
            flowItemData,
            'destination',
            'emergency'
          ),
          projects: getNameOfFundingValue(
            flowItemData,
            'destination',
            'project'
          ),
          usageYears: getNameOfFundingValue(
            flowItemData,
            'destination',
            'usageYear'
          ),
          globalClusters: getNameOfFundingValue(
            flowItemData,
            'destination',
            'globalCluster'
          ),
          locations: getNameOfFundingValue(
            flowItemData,
            'destination',
            'location'
          ),
          plans: getNameOfFundingValue(flowItemData, 'destination', 'plan'),
          organizations: getNameOfFundingValue(
            flowItemData,
            'destination',
            'organization'
          ),
        },
        categories: flowItemData.categories.map((category) => category.name),
        amountUSD: flowItemData.amountUSD,
        flowDate: flowItemData.flowDate,
        decisionDate: flowItemData.flowDate,
        firstReportedDate: flowItemData.firstReportedDate,
        budgetYear: flowItemData.budgetYear,
        origAmount: flowItemData.origAmount,
        origCurrency: flowItemData.origCurrency,
        exchangeRate: flowItemData.exchangeRate,
        activeStatus: flowItemData.activeStatus,
        restricted: flowItemData.restricted,
        newMoney: flowItemData.newMoney,
        description: flowItemData.description,
        notes: flowItemData.notes,
        uniqueSources: {},
        uniqueDestinations: {},
        uniqueCategories: [],
      }));

      if (isActiveVsPending) {
        const pendingAmountUSD = parseFloat(currentVersionData.amountUSD);
        createInputEntryActiveFlow(pendingAmountUSD, amountUSD, 'amountUSD');

        const pendingAmountOriginal =
          parseFloat(currentVersionData.origAmount ?? '') || null;
        createInputEntryActiveFlow(
          pendingAmountOriginal,
          amountOriginal,
          'amountOriginal'
        );

        const pendingExchangeRateUsed =
          parseFloat(currentVersionData.exchangeRate ?? '') || null;
        createInputEntryActiveFlow(
          pendingExchangeRateUsed,
          exchangeRateUsed,
          'exchangeRateUsed'
        );

        const pendingKeywords = getFormValueFromCategory(
          currentVersionData,
          'keywords',
          true
        ) as AutoCompleteSelectionType[];
        createInputEntryActiveFlow(pendingKeywords, keywords, 'keywords');

        const pendingEarmarkingType = getFormValueFromCategory(
          currentVersionData,
          'earmarkingType',
          false
        ) as AutoCompleteSelectionType;
        createInputEntryActiveFlow(
          pendingEarmarkingType,
          earmarkingType,
          'earmarkingType'
        );

        const pendingFlowDescription = currentVersionData.description ?? '';
        createInputEntryActiveFlow(
          pendingFlowDescription,
          flowDescription,
          'flowDescription'
        );

        const pendingNotes = currentVersionData.notes ?? '';
        createInputEntryActiveFlow(pendingNotes, notes, 'notes');

        const pendingFlowType = getFormValueFromCategory(
          currentVersionData,
          'flowType',
          false
        ) as AutoCompleteSelectionType;
        createInputEntryActiveFlow(pendingFlowType, flowType, 'flowType');

        const pendingFlowStatus = getFormValueFromCategory(
          currentVersionData,
          'flowStatus',
          false
        ) as AutoCompleteSelectionType;
        createInputEntryActiveFlow(pendingFlowStatus, flowStatus, 'flowStatus');

        const pendingContributionType = getFormValueFromCategory(
          currentVersionData,
          'contributionType',
          false
        ) as AutoCompleteSelectionType;
        createInputEntryActiveFlow(
          pendingContributionType,
          contributionType,
          'contributionType'
        );

        const pendingMethod = getFormValueFromCategory(
          currentVersionData,
          'method',
          false
        ) as AutoCompleteSelectionType;
        createInputEntryActiveFlow(pendingMethod, method, 'method');

        const pendingBeneficiaryGroup = getFormValueFromCategory(
          currentVersionData,
          'beneficiaryGroup',
          false
        ) as AutoCompleteSelectionType;
        createInputEntryActiveFlow(
          pendingBeneficiaryGroup,
          beneficiaryGroup,
          'beneficiaryGroup'
        );

        const pendingSourceOrganizations = getFormValueFromFunding(
          currentVersionData,
          'source',
          'organization',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingSourceOrganizations,
          sourceOrganizations,
          'sourceOrganizations'
        );

        const pendingDestinationOrganizations = getFormValueFromFunding(
          currentVersionData,
          'destination',
          'organization',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingDestinationOrganizations,
          destinationOrganizations,
          'destinationOrganizations'
        );

        const pendingSourceLocations = getFormValueFromFunding(
          currentVersionData,
          'source',
          'location',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingSourceLocations,
          sourceLocations,
          'sourceLocations'
        );

        const pendingDestinationLocations = getFormValueFromFunding(
          currentVersionData,
          'destination',
          'location',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingDestinationLocations,
          destinationLocations,
          'destinationLocations'
        );

        const pendingSourceUsageYears = getFormValueFromFunding(
          currentVersionData,
          'source',
          'usageYear',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingSourceUsageYears,
          sourceUsageYears,
          'sourceUsageYears'
        );

        const pendingDestinationUsageYears = getFormValueFromFunding(
          currentVersionData,
          'destination',
          'usageYear',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingDestinationUsageYears,
          destinationUsageYears,
          'destinationUsageYears'
        );

        const pendingSourceGlobalClusters = getFormValueFromFunding(
          currentVersionData,
          'source',
          'globalCluster',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingSourceGlobalClusters,
          sourceGlobalClusters,
          'sourceGlobalClusters'
        );

        const pendingDestinationGlobalClusters = getFormValueFromFunding(
          currentVersionData,
          'destination',
          'globalCluster',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingDestinationGlobalClusters,
          destinationGlobalClusters,
          'destinationGlobalClusters'
        );

        const pendingSourceEmergencies = getFormValueFromFunding(
          currentVersionData,
          'source',
          'emergency',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingSourceEmergencies,
          sourceEmergencies,
          'sourceEmergencies'
        );

        const pendingDestinationEmergencies = getFormValueFromFunding(
          currentVersionData,
          'destination',
          'emergency',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingDestinationEmergencies,
          destinationEmergencies,
          'destinationEmergencies'
        );

        const pendingSourceProjects = getFormValueFromFunding(
          currentVersionData,
          'source',
          'project',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingSourceProjects,
          sourceProjects,
          'sourceProjects'
        );

        const pendingDestinationProjects = getFormValueFromFunding(
          currentVersionData,
          'destination',
          'project',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingDestinationProjects,
          destinationProjects,
          'destinationProjects'
        );

        const pendingSourcePlans = getFormValueFromFunding(
          currentVersionData,
          'source',
          'plan',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingSourcePlans,
          sourcePlans,
          'sourcePlans'
        );

        const pendingDestinationPlans = getFormValueFromFunding(
          currentVersionData,
          'destination',
          'plan',
          checkExternalRef
        );
        createInputEntryActiveFlow(
          pendingDestinationPlans,
          destinationPlans,
          'destinationPlans'
        );

        // const pendingParentFlow = getFormValueFromCategory(
        //   currentVersionData,
        //   'parentFlow',
        //   false
        // ) as AutoCompleteSelectionType;
        // createInputEntryActiveFlow(pendingParentFlow, parentFlow, 'parentFlow');

        // const pendingChildFlow = getFormValueFromCategory(
        //   currentVersionData,
        //   'childFlow',
        //   false
        // ) as AutoCompleteSelectionType;
        // createInputEntryActiveFlow(pendingChildFlow, childFlow, 'childFlow');
      }

      if (data.externalData && inactiveReason === 'Pending review') {
        (data.externalData as flows.FlowExternalData[]).forEach(
          (externalValue) => {
            createInputEntryExternal(
              externalValue.refDirection,
              externalValue.objectType,
              externalValue.data
            );
          }
        );
      }
      const activeMatch = data.versions.filter(function (
        d: flows.FlowSearchResult
      ) {
        return d.activeStatus;
      })[0]?.versionID;

      const pendingId = versionDetails.findIndex((data) => data.pending) + 1;
      setPendingVersionID(pendingId);

      setIsPending(pendingId === currentVersionData.versionID);
      setIsCancellation(
        versionDetails.findIndex((data) => data.cancellation) > -1
      );
      setIsCancelled(versionDetails.findIndex((data) => data.cancelled) > -1);
      setIsSuperseded(versionDetails.findIndex((data) => data.superseded) > -1);
      setIsNewPending(!(activeMatch > -1));
      setIsUpdatePending(activeMatch > -1);
      if (isSuperseded) {
        const inactiveVersions = currentVersionData.versions
          .filter((data) => !data.activeStatus)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        const noActiveVersions =
          inactiveVersions.length === currentVersionData.versions.length;
        const isTheRightVersion =
          inactiveVersions &&
          inactiveVersions.length > 1 &&
          inactiveVersions[1].versionID === currentVersionData.versionID;
        const isLatestVersionDeleted =
          inactiveVersions &&
          inactiveVersions[0] &&
          !!inactiveVersions[0].deletedAt
            ? true
            : false;
        setCanReactive(
          noActiveVersions && isTheRightVersion && isLatestVersionDeleted
        );
      }

      setActiveVersionID(activeMatch);
      setFlowData({
        ...flowData,
        amountUSD,
        amountOriginal,
        exchangeRateUsed,
        keywords,
        flowStatus,
        flowType,
        flowDescription,
        firstReported,
        decisionDate,
        budgetYear,
        flowDate,
        contributionType,
        earmarkingType,
        method,
        beneficiaryGroup,
        inactiveReason,
        notes,
        sourceOrganizations,
        sourceLocations,
        sourceUsageYears,
        sourceProjects,
        sourcePlans,
        sourceGoverningEntities,
        sourceGlobalClusters,
        sourceEmergencies,
        destinationOrganizations,
        destinationLocations,
        destinationUsageYears,
        destinationProjects,
        destinationPlans,
        destinationGoverningEntities,
        destinationGlobalClusters,
        destinationEmergencies,
        origCurrency,
        reportDetails,
      });
      setInputEntries({ ...inputEntries });
      setIsSetupInitialValue(true);
      setPreviousReportDetails(prevReportDetails);
      setVersionData(versionDetails);
      setIsPendingFlow(versionDetails.some((detail) => detail.pending));
      setIsRestricted(
        versionDetails[parseInt(versionId as string)]?.restricted
      );
    } else {
      setFlowDetail(null);
    }
  }, [state, fullState, props.isEdit]);

  useEffect(() => {
    if (pendingVersionID && pendingVersionID > 1) {
      setPendingVersionV1(true);
    } else {
      setPendingVersionV1(false);
    }
  }, [pendingVersionID]);

  useEffect(() => {
    if (!props.isEdit) {
      setFlowData(JSON.parse(JSON.stringify(initialFormData)));
    }
  }, [props.isEdit]);

  useEffect(() => {
    if (inputEntries) {
      let isEmpty = true;
      Object.values(inputEntries).map((key) => {
        if (!_.isEmpty(key)) isEmpty = false;
      });
      if (isEmpty) {
        setAllFieldsReviewed(true);
      }
    }
  }, [inputEntries]);
  const location = useLocation();
  const copyValues = location.state;
  const [isTitleView, setisTitleView] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 0) {
        setisTitleView(true);
      } else {
        setisTitleView(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <StyledLoader
          loader={state}
          strings={{
            ...t.get(lang, (s) => s.components.loader),
            notFound: {
              ...t.get(lang, (s) => s.components.notFound),
            },
          }}
        >
          {() => {
            return (
              <div
                className={combineClasses(
                  CLASSES.CONTAINER.FLUID,
                  props.className
                )}
              >
                <PageMeta title={[t.t(lang, (s) => s.routes.newFlow.title)]} />
                <C.PageTitle
                  style={{
                    overflowY: 'scroll',
                    position: 'sticky',
                    top: '100px',
                  }}
                >
                  <StyledTitle>
                    <div style={{ opacity: isTitleView ? 0 : 1 }}>
                      {flowDetail
                        ? t.t(
                            lang,
                            (s) =>
                              s.routes.editFlow.title +
                              ' ' +
                              flowDetail.id +
                              ', v' +
                              flowDetail.versionID
                          )
                        : t.t(lang, (s) => s.routes.newFlow.title)}
                      {flowDetail &&
                        !flowDetail.activeStatus &&
                        !flowDetail.deletedAt &&
                        flowData.inactiveReason === 'Pending review' && (
                          <StyledInactiveTitle>{`[Inactive -Pending Review]`}</StyledInactiveTitle>
                        )}
                      {flowDetail && (
                        <>
                          <StyledSubTitle>
                            <StyledInactiveTitle>
                              <div>
                                {isRestricted && (
                                  <>
                                    This flow is marked as Restricted and will
                                    not be included in the funding totals on the
                                    FTS website.
                                  </>
                                )}
                              </div>
                              <div>
                                {isPendingFlow ? (
                                  flowDetail.versionID === pendingVersionID ? (
                                    pendingVersionV1 ? (
                                      <>This is a pending update.</>
                                    ) : (
                                      <>
                                        This flow is not active because it has
                                        been marked as {flowData.inactiveReason}
                                        .
                                      </>
                                    )
                                  ) : !flowDetail.activeStatus ? (
                                    <>
                                      <>
                                        This flow is not active because it has
                                        been marked as {flowData.inactiveReason}
                                        .
                                      </>
                                      <>
                                        See{' '}
                                        <a
                                          href={`flows/edit/${flowDetail.id}/version/${activeVersionID}`}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Flow {flowDetail.id}, v
                                          {activeVersionID}
                                        </a>{' '}
                                        for the current active version. and{' '}
                                        <a
                                          href={`flows/edit/${flowDetail.id}/version/${pendingVersionID}`}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Flow {flowDetail.id}, v
                                          {pendingVersionID}
                                        </a>{' '}
                                        for the current pending version.
                                      </>
                                    </>
                                  ) : (
                                    <>
                                      There is a pending update to this flow.
                                      Review pending{' '}
                                      <a
                                        href={`flows/edit/${flowDetail.id}/version/${pendingVersionID}`}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Flow {flowDetail.id}, v
                                        {pendingVersionID}
                                      </a>
                                      .
                                    </>
                                  )
                                ) : (
                                  ''
                                )}
                              </div>
                            </StyledInactiveTitle>
                          </StyledSubTitle>
                          <StyledSubTitle>
                            Updated{' '}
                            {dayjs(flowDetail.updatedAt).format(
                              'Do MMMM YYYY [at] h:mm:ss a'
                            )}{' '}
                            by {displayUserName(flowDetail.lastUpdatedBy)}
                          </StyledSubTitle>
                          <StyledSubTitle>
                            Created{' '}
                            {dayjs(flowDetail.createdAt).format(
                              'Do MMMM YYYY [at] h:mm:ss a'
                            )}{' '}
                            by {displayUserName(flowDetail.createdBy)}
                          </StyledSubTitle>
                        </>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        marginRight: '23px',
                        backgroundColor: 'white',
                        height: '50px',
                      }}
                    >
                      <StyledRestrictedCheckBox>
                        <C.CheckBox
                          name="restricted"
                          value={isRestricted}
                          label="Restricted to internal use"
                          onChange={(e) => {
                            handleRestricted(e.target.checked);
                          }}
                          withoutFormik
                          style={{ marginRight: 0 }}
                        />
                        <YellowTooltip title="The Restricted setting applies to this flow only. If linked parent or child flows should have the same Restricted setting, you must manually update those flows accordingly">
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: THEME.colors.secondary.dark1,
                              color: THEME.colors.panel.bg,
                              fontWeight: 500,
                              marginLeft: 6,
                              fontSize: 12,
                            }}
                          >
                            i
                          </span>
                        </YellowTooltip>
                      </StyledRestrictedCheckBox>
                      <div
                        style={{
                          alignItems: 'center',
                          display: 'flex',
                          marginLeft: 25,
                        }}
                      >
                        <StyledAnchorDiv>
                          <StyledAnchor
                            href="flows"
                            target="_blank"
                            onClick={handleSimilarFlowLink}
                          >
                            Find Similar Flows
                          </StyledAnchor>
                        </StyledAnchorDiv>
                      </div>
                    </div>
                  </StyledTitle>
                </C.PageTitle>
                {isSetupInitialValue && (
                  <FlowForm
                    currentVersionData={flowDetail}
                    environment={env}
                    isEdit={props.isEdit}
                    initialValue={copyValues?.isCopy ? copyValues : flowData}
                    prevDetails={previousReportDetails}
                    versionData={versionData}
                    isRestricted={isRestricted}
                    inputEntries={inputEntries}
                    flowId={flowId}
                    versionId={versionId}
                    initializeInputEntries={initializeInputEntries}
                    rejectInputEntry={rejectInputEntry}
                    currentVersionID={currentVersionID}
                    currentFlowID={currentFlowID}
                    currentVersionActiveStatus={currentVersionActiveStatus}
                    isPending={isPending}
                    isSuperseded={isSuperseded}
                    isCancellation={isCancellation}
                    isCancelled={isCancelled}
                    isNewPending={isNewPending}
                    isUpdatePending={isUpdatePending}
                    canReactive={canReactive}
                    pendingFieldsallApplied={pendingFieldsallApplied}
                    allFieldsReviewed={allFieldsReviewed}
                    pendingVersionV1={pendingVersionV1}
                  />
                )}
              </div>
            );
          }}
        </StyledLoader>
      )}
    </AppContext.Consumer>
  );
};
