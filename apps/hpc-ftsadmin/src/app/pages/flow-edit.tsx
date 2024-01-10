import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
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
} from '@unocha/hpc-data';
import { t } from '../../i18n';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import FlowForm, { FormValues } from '../components/flow-form';

interface Props {
  className?: string;
  isEdit: boolean;
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
    reportSource: 'primary',
    reportChannel: '',
    verified: 'verified',
    origCurrency: '',
    reportedOrganization: '',
    reportedDate: dayjs().format('MM/DD/YYYY'),
    reporterReferenceCode: '',
    reporterContactInformation: '',
  });
  const [isSetupedInitialValue, setIsSetupedInitialValue] = useState<boolean>(
    !props.isEdit
  );

  const [state] = useDataLoader([flowId, versionId], () =>
    props.isEdit
      ? env.model.flows.getFlow({
          id: parseInt(flowId as string),
          versionId: parseInt(versionId as string),
        })
      : Promise.resolve({})
  );

  useEffect(() => {
    if (props.isEdit && state.type === 'success') {
      const data = state.data;
      console.log('%%%%%%%%', data);
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
      const reportedOrganization = {
        id: data.reportDetails[0].organization.id,
        label: `${data.reportDetails[0].organization.name} [${data.reportDetails[0].organization.abbreviation}]`,
      };
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
            label: `${latestProject.name}[ [${latestProject.code}] ]`,
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
            label: `${latestProject.name}[ [${latestProject.code}] ]`,
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
      const reportSource =
        data.reportDetails[0].source === 'Primary' ? 'primary' : 'secondary';
      const verified = data.reportDetails[0].verified
        ? 'verified'
        : 'unverified';
      const reportedDate = dayjs(data.reportDetails[0].date).format(
        'MM/DD/YYYY'
      );
      const reporterReferenceCode = data.reportDetails[0].refCode ?? '';
      const reporterContactInformation =
        data.reportDetails[0].contactInfo ?? '';
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
      const reportChannel =
        data.reportDetails[0].categories.find(
          (category: categories.Category) => category.group === 'reportChannel'
        )?.name ?? '';

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
        reportSource,
        reportChannel,
        verified,
        origCurrency,
        reportedOrganization,
        reportedDate,
        reporterReferenceCode,
        reporterContactInformation,
      });
      setIsSetupedInitialValue(true);
    }
  }, [state, props.isEdit]);

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
          {() => (
            <div
              className={combineClasses(
                CLASSES.CONTAINER.FLUID,
                props.className
              )}
            >
              <PageMeta title={[t.t(lang, (s) => s.routes.newFlow.title)]} />
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.newFlow.title)}
                <StyledAnchorDiv>
                  <StyledAnchor href="flows" target="_blank">
                    Find Similar Flows
                  </StyledAnchor>
                </StyledAnchorDiv>
              </C.PageTitle>
              {isSetupedInitialValue && (
                <FlowForm
                  environment={env}
                  isEdit={props.isEdit}
                  initialValue={flowData}
                />
              )}
            </div>
          )}
        </StyledLoader>
      )}
    </AppContext.Consumer>
  );
};
