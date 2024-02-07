import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Tooltip, TooltipProps, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { isRight } from 'fp-ts/lib/Either';
import * as ts from 'io-ts';
import {
  C,
  CLASSES,
  combineClasses,
  useDataLoader,
  THEME,
} from '@unocha/hpc-ui';
import {
  categories,
  organizations,
  locations,
  usageYears,
  globalClusters,
  emergencies,
  projects,
  plans,
  flows,
  forms,
} from '@unocha/hpc-data';
import { t } from '../../i18n';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import FlowForm, {
  FormValues,
  ReportDetailType,
  VersionDataType,
  InputEntriesType,
} from '../components/flow-form';
import { FLOWS_FILTER_INITIAL_VALUES } from '../components/filter-flows-table';
import { encodeFilters } from '../utils/parse-filters';

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

const defaultSelectValue = {
  id: '0',
  label: '',
};

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

const compareSelectValues = (
  active: forms.InputSelectValueType[],
  pending: forms.InputSelectValueType[]
) => {
  return !(
    JSON.stringify(active.map((value) => value.id).sort()) ===
    JSON.stringify(pending.map((value) => value.id).sort())
  );
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
  sourceCountries: [],
  sourceUsageYears: [],
  sourceProjects: [],
  sourcePlans: [],
  sourceGlobalClusters: [],
  sourceEmergencies: [],
  destinationOrganizations: [],
  destinationCountries: [],
  destinationUsageYears: [],
  destinationProjects: [],
  destinationPlans: [],
  destinationGlobalClusters: [],
  destinationEmergencies: [],
};

export default (props: Props) => {
  const env = getEnv();
  const { flowId, versionId } = useParams<{
    flowId: string;
    versionId: string;
  }>();
  const [flowData, setFlowData] = useState<FormValues>({
    amountUSD: 0,
    amountOriginal: 0,
    exchangeRateUsed: 0,
    keywords: [],
    flowStatus: '',
    flowType: 'Standard',
    flowDescription: '',
    firstReported: dayjs().format('MM/DD/YYYY'),
    decisionDate: null,
    budgetYear: '',
    flowDate: '',
    contributionType: 'Financial',
    earmarkingType: '',
    method: 'Traditional aid',
    beneficiaryGroup: '',
    inactiveReason: '',
    notes: '',
    sourceOrganizations: [],
    sourceCountries: [],
    sourceUsageYears: [],
    sourceProjects: [],
    sourcePlans: [],
    sourceGlobalClusters: [],
    sourceEmergencies: [],
    destinationOrganizations: [],
    destinationCountries: [],
    destinationUsageYears: [],
    destinationProjects: [],
    destinationPlans: [],
    destinationGlobalClusters: [],
    destinationEmergencies: [],
    origCurrency: '',
    reportDetails: [
      {
        verified: 'verified',
        reportSource: 'primary',
        reporterReferenceCode: '',
        reportChannel: '',
        reportedOrganization: '',
        reportedDate: dayjs().format('MM/DD/YYYY'),
        reporterContactInformation: '',
        sourceSystemRecordId: '',
        reportFiles: [
          {
            title: '',
          },
        ],
      },
    ],
  });
  const [inputEntries, setInputEntries] = useState<InputEntriesType>(
    JSON.parse(JSON.stringify(initialInputEntries))
  );
  const [previousReportDetails, setPreviousReportDetails] = useState<
    ReportDetailType[]
  >([]);
  const [versionData, setVersionData] = useState<VersionDataType[]>([]);
  const [isSetupedInitialValue, setIsSetupedInitialValue] = useState<boolean>(
    !props.isEdit
  );
  const [latestVersion, setLatestVersion] = useState<number>(
    parseInt(versionId as string)
  );
  const [flowDetail, setFlowDetail] = useState<flows.Flow | null>(null);
  const [activeVersionID, setActiveVersionID] = useState<number>(0);
  const [isPendingFlow, setIsPendingFlow] = useState<boolean>(false);
  const [isRestricted, setIsRestricted] = useState<boolean>(false);

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
          env.model.flows.getFlow({
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
          env.model.flows.getFlow({
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

      const flowsFilterInitialValues = JSON.parse(
        JSON.stringify(FLOWS_FILTER_INITIAL_VALUES)
      );
      if (flowData.sourceCountries.length > 0) {
        flowsFilterInitialValues.sourceCountries = flowData.sourceCountries.map(
          (location) => {
            if (typeof location !== 'string') {
              return {
                id: location.id,
                label: location.label,
              };
            }
            return defaultSelectValue;
          }
        );
      }

      if (flowData.sourceOrganizations.length > 0) {
        flowsFilterInitialValues.sourceOrganizations =
          flowData.sourceOrganizations.map((organization) => {
            if (typeof organization !== 'string') {
              return {
                id: organization.id,
                label: organization.label,
              };
            }
            return defaultSelectValue;
          });
      }

      if (flowData.destinationOrganizations.length > 0) {
        flowsFilterInitialValues.destinationOrganizations =
          flowData.destinationOrganizations.map((organization) => {
            if (typeof organization !== 'string') {
              return {
                id: organization.id,
                label: organization.label,
              };
            }
            return defaultSelectValue;
          });
      }

      if (flowData.destinationPlans.length > 0) {
        flowsFilterInitialValues.destinationPlans =
          flowData.destinationPlans.map((plan) => {
            if (typeof plan !== 'string') {
              return {
                id: plan.id,
                label: plan.label,
              };
            }
            return defaultSelectValue;
          });
      }
      paramsObject['filters'] = JSON.stringify(
        encodeFilters(flowsFilterInitialValues)
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
      if (
        currentVersionData.versions.length !== latestVersion ||
        fullState.type !== 'success'
      ) {
        setLatestVersion(currentVersionData.versions.length);
        return undefined;
      }
      const fullData = [...state.data, ...fullState.data];
      const inactiveReason =
        currentVersionData.categories.find(
          (category: categories.Category) => category.group === 'inactiveReason'
        )?.name ?? '';
      const isActiveVsPending =
        fullData.length > 1 && inactiveReason === 'Pending review';
      const data = isActiveVsPending
        ? fullData.find((flowDetailData) => flowDetailData.activeStatus)
        : currentVersionData;

      const checkExternalRef = (
        src: string,
        objType: string,
        id: number,
        refType: string
      ) => {
        return (
          data.externalReferences as flows.FlowExternalReference[]
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
      };

      const amountUSD = parseFloat(data.amountUSD);
      const amountOriginal = parseFloat(data.origAmount) || null;
      const exchangeRateUsed = parseFloat(data.exchangeRate) || null;
      const origCurrency = data.origCurrency;
      const keywords = data.categories
        .filter(
          (category: categories.Category) => category.group === 'keywords'
        )
        .map((category: categories.Category) => ({
          id: category.id,
          label: category.name,
        }));
      const earmarkingType =
        data.categories
          .filter(
            (category: categories.Category) =>
              category.group === 'earmarkingType'
          )
          .map((category: categories.Category) => ({
            id: category.id,
            label: category.name,
          }))[0] ?? '';
      const sourceOrganizations = data.organizations
        .filter(
          (organization: organizations.Organization) =>
            organization?.flowObject?.refDirection === 'source'
        )
        .map((organization: organizations.Organization) => ({
          id: organization.id,
          label: `${organization.name} [${organization.abbreviation}]`,
          isInferred: checkExternalRef(
            'source',
            'organization',
            organization.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'source',
            'organization',
            organization.id,
            'transferred'
          ),
        }));
      const destinationOrganizations = data.organizations
        .filter(
          (organization: organizations.Organization) =>
            organization?.flowObject?.refDirection === 'destination'
        )
        .map((organization: organizations.Organization) => ({
          id: organization.id,
          label: `${organization.name} [${organization.abbreviation}]`,
          isInferred: checkExternalRef(
            'destination',
            'organization',
            organization.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'destination',
            'organization',
            organization.id,
            'transferred'
          ),
        }));
      const sourceCountries = data.locations
        .filter(
          (location: locations.LocationREST) =>
            location?.flowObject?.refDirection === 'source'
        )
        .map((location: locations.LocationREST) => ({
          id: location.id,
          label: location.name,
          isInferred: checkExternalRef(
            'source',
            'location',
            location.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'source',
            'location',
            location.id,
            'transferred'
          ),
        }));
      const destinationCountries = data.locations
        .filter(
          (location: locations.LocationREST) =>
            location?.flowObject?.refDirection === 'destination'
        )
        .map((location: locations.LocationREST) => ({
          id: location.id,
          label: location.name,
          isInferred: checkExternalRef(
            'destination',
            'location',
            location.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'destination',
            'location',
            location.id,
            'transferred'
          ),
        }));
      const sourceUsageYears = data.usageYears
        .filter(
          (usageYear: usageYears.UsageYear) =>
            usageYear?.flowObject?.refDirection === 'source'
        )
        .map((usageYear: usageYears.UsageYear) => ({
          id: usageYear.id,
          label: usageYear.year,
          isInferred: checkExternalRef(
            'source',
            'usageYear',
            usageYear.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'source',
            'usageYear',
            usageYear.id,
            'transferred'
          ),
        }));
      const destinationUsageYears = data.usageYears
        .filter(
          (usageYear: usageYears.UsageYear) =>
            usageYear?.flowObject?.refDirection === 'destination'
        )
        .map((usageYear: usageYears.UsageYear) => ({
          id: usageYear.id,
          label: usageYear.year,
          isInferred: checkExternalRef(
            'destination',
            'usageYear',
            usageYear.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'destination',
            'usageYear',
            usageYear.id,
            'transferred'
          ),
        }));
      const sourceGlobalClusters = data.globalClusters
        .filter(
          (globalCluster: globalClusters.GlobalCluster) =>
            globalCluster?.flowObject?.refDirection === 'source'
        )
        .map((globalCluster: globalClusters.GlobalCluster) => ({
          id: globalCluster.id,
          label: globalCluster.name,
          isInferred: checkExternalRef(
            'source',
            'globalCluster',
            globalCluster.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'source',
            'globalCluster',
            globalCluster.id,
            'transferred'
          ),
        }));
      const destinationGlobalClusters = data.globalClusters
        .filter(
          (globalCluster: globalClusters.GlobalCluster) =>
            globalCluster?.flowObject?.refDirection === 'destination'
        )
        .map((globalCluster: globalClusters.GlobalCluster) => ({
          id: globalCluster.id,
          label: globalCluster.name,
          isInferred: checkExternalRef(
            'destination',
            'globalCluster',
            globalCluster.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'destination',
            'globalCluster',
            globalCluster.id,
            'transferred'
          ),
        }));
      const sourceEmergencies = data.emergencies
        .filter(
          (emergency: emergencies.Emergency) =>
            emergency?.flowObject?.refDirection === 'source'
        )
        .map((emergency: emergencies.Emergency) => ({
          id: emergency.id,
          label: emergency.name,
          isInferred: checkExternalRef(
            'source',
            'emergency',
            emergency.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'source',
            'emergency',
            emergency.id,
            'transferred'
          ),
        }));
      const destinationEmergencies = data.emergencies
        .filter(
          (emergency: emergencies.Emergency) =>
            emergency?.flowObject?.refDirection === 'destination'
        )
        .map((emergency: emergencies.Emergency) => ({
          id: emergency.id,
          label: emergency.name,
          isInferred: checkExternalRef(
            'destination',
            'emergency',
            emergency.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'destination',
            'emergency',
            emergency.id,
            'transferred'
          ),
        }));
      const sourceProjects = data.projects
        .filter(
          (project: projects.GetProjectResult) =>
            project?.flowObject?.refDirection === 'source'
        )
        .map((project: projects.GetProjectResult) => {
          const latestProject = project.projectVersions.filter(
            (projectVersion) => projectVersion.id === project.latestVersionId
          )[0];
          return {
            id: project.id,
            label: `${latestProject.name} [${latestProject.code}]`,
            isInferred: checkExternalRef(
              'source',
              'project',
              project.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'source',
              'project',
              project.id,
              'transferred'
            ),
          };
        });
      const destinationProjects = data.projects
        .filter(
          (project: projects.GetProjectResult) =>
            project?.flowObject?.refDirection === 'destination'
        )
        .map((project: projects.GetProjectResult) => {
          const latestProject = project.projectVersions.filter(
            (projectVersion) => projectVersion.id === project.latestVersionId
          )[0];
          return {
            id: project.id,
            label: `${latestProject.name} [${latestProject.code}]`,
            isInferred: checkExternalRef(
              'destination',
              'project',
              project.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'destination',
              'project',
              project.id,
              'transferred'
            ),
          };
        });
      const sourcePlans = data.plans
        .filter(
          (plan: plans.GetPlanResult) =>
            plan?.flowObject?.refDirection === 'source'
        )
        .map((plan: plans.GetPlanResult) => ({
          id: plan.id,
          label: plan.planVersion.name,
          isInferred: checkExternalRef('source', 'plan', plan.id, 'inferred'),
          isTransferred: checkExternalRef(
            'source',
            'plan',
            plan.id,
            'transferred'
          ),
        }));
      const destinationPlans = data.plans
        .filter(
          (plan: plans.GetPlanResult) =>
            plan?.flowObject?.refDirection === 'destination'
        )
        .map((plan: plans.GetPlanResult) => ({
          id: plan.id,
          label: plan.planVersion.name,
          isInferred: checkExternalRef(
            'destination',
            'plan',
            plan.id,
            'inferred'
          ),
          isTransferred: checkExternalRef(
            'destination',
            'plan',
            plan.id,
            'transferred'
          ),
        }));
      const flowDescription = data.description;
      const firstReported = dayjs(data.firstReportedDate).format('MM/DD/YYYY');
      const decisionDate = data.decisionDate
        ? dayjs(data.decisionDate).format('MM/DD/YYYY')
        : null;
      const budgetYear = data.budgetYear ?? '';
      const flowDate = dayjs(data.flowDate).format('MM/DD/YYYY');
      const notes = data.notes ?? '';
      const flowStatus =
        data.categories.find(
          (category: categories.Category) => category.group === 'flowStatus'
        )?.name ?? '';
      const flowType =
        data.categories.find(
          (category: categories.Category) => category.group === 'flowType'
        )?.name ?? '';
      const contributionType =
        data.categories.find(
          (category: categories.Category) =>
            category.group === 'contributionType'
        )?.name ?? '';
      const method =
        data.categories.find(
          (category: categories.Category) => category.group === 'method'
        )?.name ?? '';
      const beneficiaryGroup =
        data.categories.find(
          (category: categories.Category) =>
            category.group === 'beneficiaryGroup'
        )?.name ?? '';

      const activeMatch = data.versions.filter(function (
        d: flows.FlowSearchResult
      ) {
        return d.activeStatus;
      })[0]?.versionID;

      setActiveVersionID(activeMatch);
      const reportDetails = data.reportDetails.map(
        (detail: flows.FlowReportDetail) => ({
          verified: detail.verified ? 'verified' : 'unverified',
          reportSource: detail.source === 'Primary' ? 'primary' : 'secondary',
          reporterReferenceCode: detail.refCode ?? '',
          reportChannel:
            detail?.categories?.find(
              (category: categories.Category) =>
                category.group === 'reportChannel'
            )?.name ?? '',
          reportedOrganization: {
            id: detail?.organization?.id,
            label: `${detail?.organization?.name} [${detail?.organization?.abbreviation}]`,
          },
          reportedDate: dayjs(detail.date).format('MM/DD/YYYY'),
          reporterContactInformation: detail.contactInfo ?? '',
          sourceSystemRecordId: detail.sourceID ?? '',
          reportFiles: detail?.reportFiles?.map((fileData) => ({
            title: fileData.title,
          })),
        })
      );
      const prevReportDetails = state.data.reduce(
        (details, flowItemData, index) => {
          if (index < parseInt(versionId as string) - 1) {
            details = [
              ...details,
              ...flowItemData.reportDetails.map(
                (detail: flows.FlowReportDetail) => ({
                  verified: detail.verified ? 'verified' : 'unverified',
                  reportSource:
                    detail.source === 'Primary' ? 'primary' : 'secondary',
                  reporterReferenceCode: detail.refCode ?? '',
                  reportChannel:
                    detail?.categories?.find(
                      (category: categories.Category) =>
                        category.group === 'reportChannel'
                    )?.name ?? '',
                  reportedOrganization: {
                    id: detail?.organization?.id,
                    label: `${detail?.organization?.name} [${detail?.organization?.abbreviation}]`,
                  },
                  reportedDate: dayjs(detail.date).format('MM/DD/YYYY'),
                  reporterContactInformation: detail.contactInfo ?? '',
                  sourceSystemRecordId: detail.sourceID ?? '',
                  reportFiles: detail?.reportFiles?.map((fileData) => ({
                    title: fileData.title,
                  })),
                  versionId: index + 1,
                })
              ),
            ];
          }
          return details;
        },
        []
      );
      const versionDetails = fullData.map((flowItemData, index) => ({
        versionId: index + 1,
        flowId: parseInt(flowId as string),
        createdTime: dayjs(flowItemData.createdAt).format(
          'Do MMMM YYYY [at] h:mm:ss a'
        ),
        createdBy: flowItemData.createdBy?.name,
        updatedTime: dayjs(flowItemData.updated).format(
          'Do MMMM YYYY [at] h:mm:ss a'
        ),
        updatedBy: flowItemData.lastUpdatedBy?.name,
        active: flowItemData.activeStatus,
        viewing: index + 1 === parseInt(versionId as string),
        pending:
          flowItemData.categories.find(
            (category: categories.Category) =>
              category.group === 'inactiveReason'
          )?.name === 'Pending review',
        source: {
          emergencies: flowItemData.emergencies
            .filter(
              (emergency: emergencies.Emergency) =>
                emergency?.flowObject?.refDirection === 'source'
            )
            .map((emergency: emergencies.Emergency) => emergency.name),
          projects: flowItemData.projects
            .filter(
              (project: projects.GetProjectResult) =>
                project?.flowObject?.refDirection === 'source'
            )
            .map((project: projects.GetProjectResult) => {
              const latestProject = project.projectVersions.filter(
                (projectVersion) =>
                  projectVersion.id === project.latestVersionId
              )[0];
              return `${latestProject.name} [${latestProject.code}]`;
            }),
          usageYears: flowItemData.usageYears
            .filter(
              (usageYear: usageYears.UsageYear) =>
                usageYear?.flowObject?.refDirection === 'source'
            )
            .map((usageYear: usageYears.UsageYear) => usageYear.year),
          globalClusters: flowItemData.globalClusters
            .filter(
              (globalCluster: globalClusters.GlobalCluster) =>
                globalCluster?.flowObject?.refDirection === 'source'
            )
            .map(
              (globalCluster: globalClusters.GlobalCluster) =>
                globalCluster.name
            ),
          locations: flowItemData.locations
            .filter(
              (location: locations.LocationREST) =>
                location?.flowObject?.refDirection === 'source'
            )
            .map((location: locations.LocationREST) => location.name),
          plans: flowItemData.plans
            .filter(
              (plan: plans.GetPlanResult) =>
                plan?.flowObject?.refDirection === 'source'
            )
            .map((plan: plans.GetPlanResult) => plan.planVersion.name),
          organizations: data.organizations
            .filter(
              (organization: organizations.Organization) =>
                organization?.flowObject?.refDirection === 'source'
            )
            .map(
              (organization: organizations.Organization) =>
                `${organization.name} [${organization.abbreviation}]`
            ),
        },
        destination: {
          emergencies: flowItemData.emergencies
            .filter(
              (emergency: emergencies.Emergency) =>
                emergency?.flowObject?.refDirection === 'destination'
            )
            .map((emergency: emergencies.Emergency) => emergency.name),
          projects: flowItemData.projects
            .filter(
              (project: projects.GetProjectResult) =>
                project?.flowObject?.refDirection === 'destination'
            )
            .map((project: projects.GetProjectResult) => {
              const latestProject = project.projectVersions.filter(
                (projectVersion) =>
                  projectVersion.id === project.latestVersionId
              )[0];
              return `${latestProject.name} [${latestProject.code}]`;
            }),
          usageYears: flowItemData.usageYears
            .filter(
              (usageYear: usageYears.UsageYear) =>
                usageYear?.flowObject?.refDirection === 'destination'
            )
            .map((usageYear: usageYears.UsageYear) => usageYear.year),
          globalClusters: flowItemData.globalClusters
            .filter(
              (globalCluster: globalClusters.GlobalCluster) =>
                globalCluster?.flowObject?.refDirection === 'destination'
            )
            .map(
              (globalCluster: globalClusters.GlobalCluster) =>
                globalCluster.name
            ),
          locations: flowItemData.locations
            .filter(
              (location: locations.LocationREST) =>
                location?.flowObject?.refDirection === 'destination'
            )
            .map((location: locations.LocationREST) => location.name),
          plans: flowItemData.plans
            .filter(
              (plan: plans.GetPlanResult) =>
                plan?.flowObject?.refDirection === 'destination'
            )
            .map((plan: plans.GetPlanResult) => plan.planVersion.name),
          organizations: data.organizations
            .filter(
              (organization: organizations.Organization) =>
                organization?.flowObject?.refDirection === 'destination'
            )
            .map(
              (organization: organizations.Organization) =>
                `${organization.name} [${organization.abbreviation}]`
            ),
        },
        categories: flowItemData.categories.map(
          (category: categories.Category) => category.name
        ),
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
        if (pendingAmountUSD !== amountUSD) {
          inputEntries.amountUSD = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingAmountUSD,
            kind: forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingAmountOriginal =
          parseFloat(currentVersionData.origAmount) || null;
        if (pendingAmountUSD !== amountUSD) {
          inputEntries.amountOriginal = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingAmountOriginal,
            kind:
              pendingAmountOriginal === null
                ? forms.InputEntryKindsEnum.DELETED
                : amountOriginal === null
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingExchangeRateUsed =
          parseFloat(currentVersionData.exchangeRate) || null;
        if (pendingExchangeRateUsed !== exchangeRateUsed) {
          inputEntries.exchangeRateUsed = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingExchangeRateUsed,
            kind:
              pendingExchangeRateUsed === null
                ? forms.InputEntryKindsEnum.DELETED
                : exchangeRateUsed === null
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingKeywords = currentVersionData.categories
          .filter(
            (category: categories.Category) => category.group === 'keywords'
          )
          .map((category: categories.Category) => ({
            id: category.id,
            label: category.name,
          }));
        if (compareSelectValues(keywords, pendingKeywords)) {
          inputEntries.keywords = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingKeywords,
            kind:
              pendingKeywords.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : keywords.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingEarmarkingType =
          currentVersionData.categories
            .filter(
              (category: categories.Category) =>
                category.group === 'earmarkingType'
            )
            .map((category: categories.Category) => ({
              id: category.id,
              label: category.name,
            }))[0] ?? '';
        if (
          (pendingEarmarkingType && !earmarkingType) ||
          (!pendingEarmarkingType && earmarkingType) ||
          (pendingEarmarkingType &&
            earmarkingType &&
            pendingEarmarkingType.id !== earmarkingType.id)
        ) {
          inputEntries.earmarkingType = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingEarmarkingType,
            kind:
              pendingEarmarkingType === ''
                ? forms.InputEntryKindsEnum.DELETED
                : earmarkingType === ''
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingFlowDescription = currentVersionData.description ?? '';
        if (pendingFlowDescription !== flowDescription) {
          inputEntries.flowDescription = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingFlowDescription,
            kind: !pendingFlowDescription
              ? forms.InputEntryKindsEnum.DELETED
              : !flowDescription
              ? forms.InputEntryKindsEnum.NEW
              : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingNotes = currentVersionData.notes ?? '';
        if (pendingNotes !== notes) {
          inputEntries.notes = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingNotes,
            kind: !pendingNotes
              ? forms.InputEntryKindsEnum.DELETED
              : !notes
              ? forms.InputEntryKindsEnum.NEW
              : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingFlowType =
          currentVersionData.categories.find(
            (category: categories.Category) => category.group === 'flowType'
          )?.name ?? '';
        if (pendingFlowType !== flowType) {
          inputEntries.flowType = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingFlowType,
            kind: !pendingFlowType
              ? forms.InputEntryKindsEnum.DELETED
              : !flowType
              ? forms.InputEntryKindsEnum.NEW
              : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingFlowStatus =
          currentVersionData.categories.find(
            (category: categories.Category) => category.group === 'flowStatus'
          )?.name ?? '';
        if (pendingFlowStatus !== flowStatus) {
          inputEntries.flowStatus = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingFlowStatus,
            kind: !pendingFlowStatus
              ? forms.InputEntryKindsEnum.DELETED
              : !flowStatus
              ? forms.InputEntryKindsEnum.NEW
              : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingContributionType =
          currentVersionData.categories.find(
            (category: categories.Category) =>
              category.group === 'contributionType'
          )?.name ?? '';
        if (pendingContributionType !== contributionType) {
          inputEntries.contributionType = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingContributionType,
            kind: !pendingContributionType
              ? forms.InputEntryKindsEnum.DELETED
              : !contributionType
              ? forms.InputEntryKindsEnum.NEW
              : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingMethod =
          currentVersionData.categories.find(
            (category: categories.Category) => category.group === 'method'
          )?.name ?? '';
        if (pendingMethod !== method) {
          inputEntries.method = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingMethod,
            kind: !pendingMethod
              ? forms.InputEntryKindsEnum.DELETED
              : !method
              ? forms.InputEntryKindsEnum.NEW
              : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingBeneficiaryGroup =
          currentVersionData.categories.find(
            (category: categories.Category) =>
              category.group === 'beneficiaryGroup'
          )?.name ?? '';
        if (pendingBeneficiaryGroup !== beneficiaryGroup) {
          inputEntries.beneficiaryGroup = {
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingBeneficiaryGroup,
            kind: !pendingBeneficiaryGroup
              ? forms.InputEntryKindsEnum.DELETED
              : !beneficiaryGroup
              ? forms.InputEntryKindsEnum.NEW
              : forms.InputEntryKindsEnum.REVISED,
          };
        }

        const pendingSourceOrganizations = currentVersionData.organizations
          .filter(
            (organization: organizations.Organization) =>
              organization?.flowObject?.refDirection === 'source'
          )
          .map((organization: organizations.Organization) => ({
            id: organization.id,
            label: `${organization.name} [${organization.abbreviation}]`,
            isInferred: checkExternalRef(
              'source',
              'organization',
              organization.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'source',
              'organization',
              organization.id,
              'transferred'
            ),
          }));
        if (
          compareSelectValues(sourceOrganizations, pendingSourceOrganizations)
        ) {
          inputEntries.sourceOrganizations.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingSourceOrganizations,
            kind:
              pendingSourceOrganizations.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : sourceOrganizations.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingDestinationOrganizations = currentVersionData.organizations
          .filter(
            (organization: organizations.Organization) =>
              organization?.flowObject?.refDirection === 'destination'
          )
          .map((organization: organizations.Organization) => ({
            id: organization.id,
            label: `${organization.name} [${organization.abbreviation}]`,
            isInferred: checkExternalRef(
              'destination',
              'organization',
              organization.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'destination',
              'organization',
              organization.id,
              'transferred'
            ),
          }));
        if (
          compareSelectValues(
            destinationOrganizations,
            pendingDestinationOrganizations
          )
        ) {
          inputEntries.destinationOrganizations.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingDestinationOrganizations,
            kind:
              pendingDestinationOrganizations.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : destinationOrganizations.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingSourceCountries = currentVersionData.locations
          .filter(
            (location: locations.LocationREST) =>
              location?.flowObject?.refDirection === 'source'
          )
          .map((location: locations.LocationREST) => ({
            id: location.id,
            label: location.name,
            isInferred: checkExternalRef(
              'source',
              'location',
              location.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'source',
              'location',
              location.id,
              'transferred'
            ),
          }));
        if (compareSelectValues(sourceCountries, pendingSourceCountries)) {
          inputEntries.sourceCountries.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingSourceCountries,
            kind:
              pendingSourceCountries.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : sourceCountries.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingDestinationCountries = currentVersionData.locations
          .filter(
            (location: locations.LocationREST) =>
              location?.flowObject?.refDirection === 'destination'
          )
          .map((location: locations.LocationREST) => ({
            id: location.id,
            label: location.name,
            isInferred: checkExternalRef(
              'destination',
              'location',
              location.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'destination',
              'location',
              location.id,
              'transferred'
            ),
          }));
        if (
          compareSelectValues(destinationCountries, pendingDestinationCountries)
        ) {
          inputEntries.destinationCountries.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingDestinationCountries,
            kind:
              pendingDestinationCountries.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : destinationCountries.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingSourceUsageYears = currentVersionData.usageYears
          .filter(
            (usageYear: usageYears.UsageYear) =>
              usageYear?.flowObject?.refDirection === 'source'
          )
          .map((usageYear: usageYears.UsageYear) => ({
            id: usageYear.id,
            label: usageYear.year,
            isInferred: checkExternalRef(
              'source',
              'usageYear',
              usageYear.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'source',
              'usageYear',
              usageYear.id,
              'transferred'
            ),
          }));
        if (compareSelectValues(sourceUsageYears, pendingSourceUsageYears)) {
          inputEntries.sourceUsageYears.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingSourceUsageYears,
            kind:
              pendingSourceUsageYears.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : sourceUsageYears.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingDestinationUsageYears = currentVersionData.usageYears
          .filter(
            (usageYear: usageYears.UsageYear) =>
              usageYear?.flowObject?.refDirection === 'destination'
          )
          .map((usageYear: usageYears.UsageYear) => ({
            id: usageYear.id,
            label: usageYear.year,
            isInferred: checkExternalRef(
              'destination',
              'usageYear',
              usageYear.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'destination',
              'usageYear',
              usageYear.id,
              'transferred'
            ),
          }));
        if (
          compareSelectValues(
            destinationUsageYears,
            pendingDestinationUsageYears
          )
        ) {
          inputEntries.destinationUsageYears.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingDestinationUsageYears,
            kind:
              pendingDestinationUsageYears.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : destinationUsageYears.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingSourceGlobalClusters = currentVersionData.globalClusters
          .filter(
            (globalCluster: globalClusters.GlobalCluster) =>
              globalCluster?.flowObject?.refDirection === 'source'
          )
          .map((globalCluster: globalClusters.GlobalCluster) => ({
            id: globalCluster.id,
            label: globalCluster.name,
            isInferred: checkExternalRef(
              'source',
              'globalCluster',
              globalCluster.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'source',
              'globalCluster',
              globalCluster.id,
              'transferred'
            ),
          }));
        if (
          compareSelectValues(sourceGlobalClusters, pendingSourceGlobalClusters)
        ) {
          inputEntries.sourceGlobalClusters.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingSourceGlobalClusters,
            kind:
              pendingSourceGlobalClusters.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : sourceGlobalClusters.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingDestinationGlobalClusters =
          currentVersionData.globalClusters
            .filter(
              (globalCluster: globalClusters.GlobalCluster) =>
                globalCluster?.flowObject?.refDirection === 'destination'
            )
            .map((globalCluster: globalClusters.GlobalCluster) => ({
              id: globalCluster.id,
              label: globalCluster.name,
              isInferred: checkExternalRef(
                'destination',
                'globalCluster',
                globalCluster.id,
                'inferred'
              ),
              isTransferred: checkExternalRef(
                'destination',
                'globalCluster',
                globalCluster.id,
                'transferred'
              ),
            }));
        if (
          compareSelectValues(
            destinationGlobalClusters,
            pendingDestinationGlobalClusters
          )
        ) {
          inputEntries.destinationGlobalClusters.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingDestinationGlobalClusters,
            kind:
              pendingDestinationGlobalClusters.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : destinationGlobalClusters.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingSourceEmergencies = currentVersionData.emergencies
          .filter(
            (emergency: emergencies.Emergency) =>
              emergency?.flowObject?.refDirection === 'source'
          )
          .map((emergency: emergencies.Emergency) => ({
            id: emergency.id,
            label: emergency.name,
            isInferred: checkExternalRef(
              'source',
              'emergency',
              emergency.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'source',
              'emergency',
              emergency.id,
              'transferred'
            ),
          }));
        if (compareSelectValues(sourceEmergencies, pendingSourceEmergencies)) {
          inputEntries.sourceEmergencies.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingSourceEmergencies,
            kind:
              pendingSourceEmergencies.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : sourceEmergencies.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingDestinationEmergencies = currentVersionData.emergencies
          .filter(
            (emergency: emergencies.Emergency) =>
              emergency?.flowObject?.refDirection === 'destination'
          )
          .map((emergency: emergencies.Emergency) => ({
            id: emergency.id,
            label: emergency.name,
            isInferred: checkExternalRef(
              'destination',
              'emergency',
              emergency.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'destination',
              'emergency',
              emergency.id,
              'transferred'
            ),
          }));
        if (
          compareSelectValues(
            destinationEmergencies,
            pendingDestinationEmergencies
          )
        ) {
          inputEntries.destinationEmergencies.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingDestinationEmergencies,
            kind:
              pendingDestinationEmergencies.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : destinationEmergencies.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingSourceProjects = currentVersionData.projects
          .filter(
            (project: projects.GetProjectResult) =>
              project?.flowObject?.refDirection === 'source'
          )
          .map((project: projects.GetProjectResult) => {
            const latestProject = project.projectVersions.filter(
              (projectVersion) => projectVersion.id === project.latestVersionId
            )[0];
            return {
              id: project.id,
              label: `${latestProject.name} [${latestProject.code}]`,
              isInferred: checkExternalRef(
                'source',
                'project',
                project.id,
                'inferred'
              ),
              isTransferred: checkExternalRef(
                'source',
                'project',
                project.id,
                'transferred'
              ),
            };
          });
        if (compareSelectValues(sourceProjects, pendingSourceProjects)) {
          inputEntries.sourceProjects.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingSourceProjects,
            kind:
              pendingSourceProjects.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : sourceProjects.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingDestinationProjects = currentVersionData.projects
          .filter(
            (project: projects.GetProjectResult) =>
              project?.flowObject?.refDirection === 'destination'
          )
          .map((project: projects.GetProjectResult) => {
            const latestProject = project.projectVersions.filter(
              (projectVersion) => projectVersion.id === project.latestVersionId
            )[0];
            return {
              id: project.id,
              label: `${latestProject.name} [${latestProject.code}]`,
              isInferred: checkExternalRef(
                'destination',
                'project',
                project.id,
                'inferred'
              ),
              isTransferred: checkExternalRef(
                'destination',
                'project',
                project.id,
                'transferred'
              ),
            };
          });
        if (
          compareSelectValues(destinationProjects, pendingDestinationProjects)
        ) {
          inputEntries.destinationProjects.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingDestinationProjects,
            kind:
              pendingDestinationProjects.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : destinationProjects.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingSourcePlans = currentVersionData.plans
          .filter(
            (plan: plans.GetPlanResult) =>
              plan?.flowObject?.refDirection === 'source'
          )
          .map((plan: plans.GetPlanResult) => ({
            id: plan.id,
            label: plan.planVersion.name,
            isInferred: checkExternalRef('source', 'plan', plan.id, 'inferred'),
            isTransferred: checkExternalRef(
              'source',
              'plan',
              plan.id,
              'transferred'
            ),
          }));
        if (compareSelectValues(sourcePlans, pendingSourcePlans)) {
          inputEntries.sourcePlans.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingSourcePlans,
            kind:
              pendingSourcePlans.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : sourcePlans.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }

        const pendingDestinationPlans = currentVersionData.plans
          .filter(
            (plan: plans.GetPlanResult) =>
              plan?.flowObject?.refDirection === 'destination'
          )
          .map((plan: plans.GetPlanResult) => ({
            id: plan.id,
            label: plan.planVersion.name,
            isInferred: checkExternalRef(
              'destination',
              'plan',
              plan.id,
              'inferred'
            ),
            isTransferred: checkExternalRef(
              'destination',
              'plan',
              plan.id,
              'transferred'
            ),
          }));
        if (compareSelectValues(destinationPlans, pendingDestinationPlans)) {
          inputEntries.destinationPlans.push({
            category: forms.InputEntryCategoriesEnum.ACTIVE_FLOW,
            value: pendingDestinationPlans,
            kind:
              pendingDestinationPlans.length === 0
                ? forms.InputEntryKindsEnum.DELETED
                : destinationPlans.length === 0
                ? forms.InputEntryKindsEnum.NEW
                : forms.InputEntryKindsEnum.REVISED,
          });
        }
      }

      if (data.externalData) {
        (data.externalData as flows.FlowExternalData[]).forEach(
          (externalValue) => {
            if (
              externalValue.objectType === 'organization' &&
              externalValue.refDirection === 'source'
            ) {
              inputEntries.sourceOrganizations.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'organization' &&
              externalValue.refDirection === 'destination'
            ) {
              inputEntries.destinationOrganizations.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'location' &&
              externalValue.refDirection === 'source'
            ) {
              inputEntries.sourceCountries.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'location' &&
              externalValue.refDirection === 'destination'
            ) {
              inputEntries.destinationCountries.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'usageYear' &&
              externalValue.refDirection === 'source'
            ) {
              inputEntries.sourceUsageYears.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'usageYear' &&
              externalValue.refDirection === 'destination'
            ) {
              inputEntries.destinationUsageYears.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'globalCluster' &&
              externalValue.refDirection === 'source'
            ) {
              inputEntries.sourceGlobalClusters.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'globalCluster' &&
              externalValue.refDirection === 'destination'
            ) {
              inputEntries.destinationGlobalClusters.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'emergency' &&
              externalValue.refDirection === 'source'
            ) {
              inputEntries.sourceEmergencies.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'emergency' &&
              externalValue.refDirection === 'destination'
            ) {
              inputEntries.destinationEmergencies.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'project' &&
              externalValue.refDirection === 'source'
            ) {
              inputEntries.sourceProjects.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'project' &&
              externalValue.refDirection === 'destination'
            ) {
              inputEntries.destinationProjects.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'plan' &&
              externalValue.refDirection === 'source'
            ) {
              inputEntries.sourcePlans.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
            if (
              externalValue.objectType === 'plan' &&
              externalValue.refDirection === 'destination'
            ) {
              inputEntries.destinationPlans.push({
                category: forms.InputEntryCategoriesEnum.EXTERNAL,
                value: externalValue.data,
                kind: forms.InputEntryKindsEnum.UNMATCHED,
              });
            }
          }
        );
      }

      setFlowData({
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
        sourceCountries,
        sourceUsageYears,
        sourceProjects,
        sourcePlans,
        sourceGlobalClusters,
        sourceEmergencies,
        destinationOrganizations,
        destinationCountries,
        destinationUsageYears,
        destinationProjects,
        destinationPlans,
        destinationGlobalClusters,
        destinationEmergencies,
        origCurrency,
        reportDetails,
      });
      setInputEntries({ ...inputEntries });
      setIsSetupedInitialValue(true);
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
                <C.PageTitle>
                  <StyledTitle>
                    <div>
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
                              {isRestricted ? (
                                <>
                                  This flow is marked as Restricted and will not
                                  be included in the funding totals on the FTS
                                  website.
                                </>
                              ) : (
                                !flowDetail.activeStatus &&
                                !isPendingFlow && (
                                  <>
                                    This flow is not active because it has been
                                    marked as {flowData.inactiveReason}.
                                  </>
                                )
                              )}
                              {isPendingFlow ? (
                                flowData.inactiveReason === 'Pending review' ? (
                                  <>This is a pending update.</>
                                ) : (
                                  <>
                                    There is a pending update to this flow.
                                    Review pending{' '}
                                    <a
                                      href={`flows/edit/${flowDetail.id}/version/${activeVersionID}`}
                                      target="_blank"
                                    >
                                      Flow {flowDetail.id}, v{activeVersionID}
                                    </a>
                                    .
                                  </>
                                )
                              ) : (
                                !flowDetail.activeStatus && (
                                  <>
                                    See{' '}
                                    <a
                                      href={`flows/edit/${flowDetail.id}/version/${activeVersionID}`}
                                      target="_blank"
                                    >
                                      Flow {flowDetail.id}, v{activeVersionID}
                                    </a>{' '}
                                    for the current active version.
                                  </>
                                )
                              )}
                            </StyledInactiveTitle>
                          </StyledSubTitle>
                          <StyledSubTitle>
                            Updated{' '}
                            {dayjs(flowDetail.updatedAtDisplay).format(
                              'Do MMMM YYYY [at] h:mm:ss a'
                            )}{' '}
                            by {displayUserName(flowDetail.lastUpdatedBy)}
                          </StyledSubTitle>
                          <StyledSubTitle>
                            Created{' '}
                            {dayjs(flowDetail.createdAtDisplay).format(
                              'Do MMMM YYYY [at] h:mm:ss a'
                            )}{' '}
                            by {displayUserName(flowDetail.createdBy)}
                          </StyledSubTitle>
                        </>
                      )}
                    </div>
                    <div>
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
                      <div>
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
                {isSetupedInitialValue && (
                  <FlowForm
                    environment={env}
                    isEdit={props.isEdit}
                    initialValue={flowData}
                    prevDetails={previousReportDetails}
                    versionData={versionData}
                    isRestricted={isRestricted}
                    inputEntries={inputEntries}
                    initializeInputEntries={initializeInputEntries}
                    rejectInputEntry={rejectInputEntry}
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
