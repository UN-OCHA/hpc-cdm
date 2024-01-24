import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { C, CLASSES, combineClasses, useDataLoader } from '@unocha/hpc-ui';
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
} from '@unocha/hpc-data';
import { t } from '../../i18n';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import FlowForm, {
  FormValues,
  ReportDetailType,
  VersionDataType,
} from '../components/flow-form';
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

const StyledAnchorDiv = tw.span`
text-2xl
float-right
`;

const StyledSubTitle = tw.h3`
text-2xl
`;

const StyledTitle = tw.div`
flex
justify-between
`;

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
      const data = state.data[parseInt(versionId as string) - 1];
      setFlowDetail(data);
      if (
        data.versions.length !== latestVersion ||
        fullState.type !== 'success'
      ) {
        setLatestVersion(data.versions.length);
        return undefined;
      }
      const fullData = [...state.data, ...fullState.data];

      const amountUSD = parseFloat(data.amountUSD);
      const amountOriginal = parseFloat(data.origAmount);
      const exchangeRateUsed = parseFloat(data.exchangeRate);
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
        }));
      const destinationOrganizations = data.organizations
        .filter(
          (organization: organizations.Organization) =>
            organization?.flowObject?.refDirection === 'destination'
        )
        .map((organization: organizations.Organization) => ({
          id: organization.id,
          label: `${organization.name} [${organization.abbreviation}]`,
        }));
      const sourceCountries = data.locations
        .filter(
          (location: locations.LocationREST) =>
            location?.flowObject?.refDirection === 'source'
        )
        .map((location: locations.LocationREST) => ({
          id: location.id,
          label: location.name,
        }));
      const destinationCountries = data.locations
        .filter(
          (location: locations.LocationREST) =>
            location?.flowObject?.refDirection === 'destination'
        )
        .map((location: locations.LocationREST) => ({
          id: location.id,
          label: location.name,
        }));
      const sourceUsageYears = data.usageYears
        .filter(
          (usageYear: usageYears.UsageYear) =>
            usageYear?.flowObject?.refDirection === 'source'
        )
        .map((usageYear: usageYears.UsageYear) => ({
          id: usageYear.id,
          label: usageYear.year,
        }));
      const destinationUsageYears = data.usageYears
        .filter(
          (usageYear: usageYears.UsageYear) =>
            usageYear?.flowObject?.refDirection === 'destination'
        )
        .map((usageYear: usageYears.UsageYear) => ({
          id: usageYear.id,
          label: usageYear.year,
        }));
      const sourceGlobalClusters = data.globalClusters
        .filter(
          (globalCluster: globalClusters.GlobalCluster) =>
            globalCluster?.flowObject?.refDirection === 'source'
        )
        .map((globalCluster: globalClusters.GlobalCluster) => ({
          id: globalCluster.id,
          label: globalCluster.name,
        }));
      const destinationGlobalClusters = data.globalClusters
        .filter(
          (globalCluster: globalClusters.GlobalCluster) =>
            globalCluster?.flowObject?.refDirection === 'destination'
        )
        .map((globalCluster: globalClusters.GlobalCluster) => ({
          id: globalCluster.id,
          label: globalCluster.name,
        }));
      const sourceEmergencies = data.emergencies
        .filter(
          (emergency: emergencies.Emergency) =>
            emergency?.flowObject?.refDirection === 'source'
        )
        .map((emergency: emergencies.Emergency) => ({
          id: emergency.id,
          label: emergency.name,
        }));
      const destinationEmergencies = data.emergencies
        .filter(
          (emergency: emergencies.Emergency) =>
            emergency?.flowObject?.refDirection === 'destination'
        )
        .map((emergency: emergencies.Emergency) => ({
          id: emergency.id,
          label: emergency.name,
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
        }));
      const destinationPlans = data.plans
        .filter(
          (plan: plans.GetPlanResult) =>
            plan?.flowObject?.refDirection === 'destination'
        )
        .map((plan: plans.GetPlanResult) => ({
          id: plan.id,
          label: plan.planVersion.name,
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
      const inactiveReason =
        data.categories.find(
          (category: categories.Category) => category.group === 'inactiveReason'
        )?.name ?? '';
      const activeMatch = data.versions.filter(function (d: any) {
        return d.activeStatus;
      })[0].versionID;
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
        uniqueSources: {},
        uniqueDestinations: {},
        uniqueCategories: {},
      }));
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
      setIsSetupedInitialValue(true);
      setPreviousReportDetails(prevReportDetails);
      setVersionData(versionDetails);
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
                      {flowDetail ? (
                        <>
                          {!flowDetail.activeStatus &&
                          !flowDetail.deletedAt &&
                          flowData.inactiveReason !== 'Pending' ? (
                            <StyledSubTitle>
                              <p>
                                This flow is not active because it has been
                                marked as {flowData.inactiveReason}. See{' '}
                                <a>
                                  Flow {flowDetail.id}, v{activeVersionID}
                                </a>{' '}
                                for the current active version.
                              </p>
                            </StyledSubTitle>
                          ) : (
                            ''
                          )}
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
                      ) : (
                        ''
                      )}
                    </div>
                    <StyledAnchorDiv>
                      <StyledAnchor href="flows" target="_blank">
                        Find Similar Flows
                      </StyledAnchor>
                    </StyledAnchorDiv>
                  </StyledTitle>
                </C.PageTitle>
                {isSetupedInitialValue && (
                  <FlowForm
                    environment={env}
                    isEdit={props.isEdit}
                    initialValue={flowData}
                    prevDetails={previousReportDetails}
                    versionData={versionData}
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
