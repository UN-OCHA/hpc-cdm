import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import { useState } from 'react';
import { Route } from 'react-router-dom';
import FlowForm, { FormValues } from '../components/flow-form';
import SetupProcess from '../components/setup-process';

interface Props {
  className?: string;
}

const Container = tw.div`
flex
`;
const LandingContainer = tw.div`
w-3/4
`;

const SidebarContainer = tw.div`
w-1/4
`;

const StyledAnchor = tw.a`
underline
`;

const StyledAnchorDiv = tw.span`
text-2xl
float-right
`;
export default (props: Props) => {
  const filtersInitialValues: FormValues = {
    // flowId: '',
    amountUSD: '',
    keywords: [],
    flowStatus: '',
    flowType: '',
    flowDescription: '',
    firstReported: '',
    decisionDate: '',
    donorBudgetYear: '',
    flowDate: '',
    contributionType: '',
    reportSource: '',
    reportChannel: '',
    verified: '',
    earmarkingType: '',
    method: '',
    beneficiaryGroup: '',
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

  const env = getEnv();
  const [selectedStep, setSelectedStep] = useState('fundingSources');
  console.log(selectedStep);
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
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
          <Container>
            <SidebarContainer>
              <SetupProcess
                selectedStep={selectedStep}
                setSelectedStep={(s: string) => setSelectedStep(s)}
              />
            </SidebarContainer>
            <LandingContainer>
              <FlowForm environment={env} selectedStep={selectedStep} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
