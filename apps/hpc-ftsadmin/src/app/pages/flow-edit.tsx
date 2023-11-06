import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../i18n';
import PageMeta from '../components/page-meta';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import { useState } from 'react';
import FlowForm, { FormValues } from '../components/flow-form';

interface Props {
  className?: string;
}

const Container = tw.div`
flex
`;
const LandingContainer = tw.div`
w-full
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

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.newFlow.title)]} />
          <Container>
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.newFlow.title)}
              </C.PageTitle>
              <FlowForm environment={env} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
