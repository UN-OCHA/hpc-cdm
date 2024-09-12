import { AppContext, getEnv } from '../context';
import type { FormObjectValue } from '@unocha/hpc-data';
import { Form, Formik } from 'formik';
import { parseFlowForm } from '../utils/parse-flow-form';

interface FlowFormProps {
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSuccess: React.Dispatch<React.SetStateAction<string | undefined>>;
}

type ReportingDetail = {
  report: FormObjectValue | null;
  reportedByOrganization: FormObjectValue | null;
  reportChannel: FormObjectValue | null;
  sourceSystemRecordId: string;
  verified: FormObjectValue | null;
  dateReported: Date | null;
  reporterReferenceCode: string;
  reporterContactInfo: string;
  reportFileTitle: string;
  file: unknown; // TODO: Add Blob type
  reportURLTitle: string;
  url: string;
};

export type FlowFormType = {
  fundingSourceOrganizations: FormObjectValue[];
  fundingSourceUsageYears: FormObjectValue[];
  fundingSourceLocations: FormObjectValue[];
  fundingSourceEmergencies: FormObjectValue[];
  fundingSourceGlobalClusters: FormObjectValue[];
  fundingSourceFieldClusters: FormObjectValue[];
  fundingSourceProject: FormObjectValue | null;
  fundingSourcePlan: FormObjectValue | null;

  fundingDestinationOrganizations: FormObjectValue[];
  fundingDestinationUsageYears: FormObjectValue[];
  fundingDestinationLocations: FormObjectValue[];
  fundingDestinationEmergencies: FormObjectValue[];
  fundingDestinationGlobalClusters: FormObjectValue[];
  fundingDestinationFieldClusters: FormObjectValue[];
  fundingDestinationProject: FormObjectValue | null;
  fundingDestinationPlan: FormObjectValue | null;

  isNewMoney: boolean;
  amountUSD: string;
  amountOriginalCurrency: string;
  exchangeRate: string;
  flowDescription: string;
  firstReported: Date | null;
  decisionDate: Date | null;
  donorBudgetYear: string;
  flowType: FormObjectValue | null;
  flowStatus: FormObjectValue | null;
  flowDate: Date | null;
  contributionType: FormObjectValue | null;
  earmarking: FormObjectValue | null;
  aidModality: FormObjectValue | null;
  keywords: FormObjectValue[];
  beneficiaryGroup: FormObjectValue | null;
  notes: string;

  parentFlow: FormObjectValue | null;
  childFlows: FormObjectValue[];

  reportingDetails: ReportingDetail[];
};

const INITIAL_FORM_VALUES: FlowFormType = {
  fundingSourceOrganizations: [],
  fundingSourceUsageYears: [],
  fundingSourceLocations: [],
  fundingSourceEmergencies: [],
  fundingSourceGlobalClusters: [],
  fundingSourceFieldClusters: [],
  fundingSourceProject: null,
  fundingSourcePlan: null,

  fundingDestinationOrganizations: [],
  fundingDestinationUsageYears: [],
  fundingDestinationLocations: [],
  fundingDestinationEmergencies: [],
  fundingDestinationGlobalClusters: [],
  fundingDestinationFieldClusters: [],
  fundingDestinationProject: null,
  fundingDestinationPlan: null,

  isNewMoney: false,
  amountUSD: '',
  amountOriginalCurrency: '',
  exchangeRate: '',
  flowDescription: '',
  firstReported: null,
  decisionDate: null,
  donorBudgetYear: '',
  flowType: null,
  flowStatus: null,
  flowDate: null,
  contributionType: null,
  earmarking: null,
  aidModality: null,
  keywords: [],
  beneficiaryGroup: null,
  notes: '',

  parentFlow: null,
  childFlows: [],

  reportingDetails: [],
};

export const FlowForm = (props: FlowFormProps) => {
  const env = getEnv();
  const { setError, setSuccess } = props;
  const handleSubmit = (values: FlowFormType) => {
    //  TODO: Add form validation at this point

    env.model.flows
      .createFlow(parseFlowForm(values))
      .then(() => {
        setSuccess('success message');
      })
      .catch((err) => {
        console.error(err);
        setError('error message');
      });
  };
  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Formik initialValues={INITIAL_FORM_VALUES} onSubmit={handleSubmit}>
          <Form></Form>
        </Formik>
      )}
    </AppContext.Consumer>
  );
};
