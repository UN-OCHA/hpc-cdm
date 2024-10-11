import { AppContext, getEnv } from '../../context';
import * as io from 'io-ts';
import { type FormObjectValue, util as codecs, flows } from '@unocha/hpc-data';
import { Form, Formik, FormikHelpers } from 'formik';
import { parseFlowForm } from '../../utils/parse-flow-form';
import { Box, Grow, Paper, Snackbar, SxProps, Theme } from '@mui/material';
import tw from 'twin.macro';
import AsyncAutocompleteSelectReview from './inputs/async-autocomplete-pending-review';
import {
  fnCategories,
  fnCurrencies,
  fnEmergencies,
  fnFlowStatusId,
  fnFlowTypeId,
  fnGlobalClusters,
  fnLocations,
  fnOrganizations,
  fnPlans,
  fnProjects,
  fnUsageYears,
} from '../../utils/fn-promises';
import AutocompleteSelectReview from './inputs/autocomplete-pending-review';
import { C } from '@unocha/hpc-ui';
import NumberFieldReview from './inputs/number-field-pending-review';
import TextFieldReview from './inputs/text-field-pending-review';
import { MdAdd, MdClose } from 'react-icons/md';
import validateForm from '../../utils/form-validation';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../paths';
import FlowLink, { FlowLinkProps } from './flow-link';
import FlowSearch from './flow-search';
import FlowLinkWarning from './flow-link-warning';
import {
  currencyToInteger,
  integerToCurrency,
  valueToInteger,
} from '../../utils/map-functions';
import ReportingDetail, {
  REPORTING_DETAIL_INITIAL_VALUES,
  ReportingDetailProps,
} from '../reporting-detail';
import { Dayjs } from 'dayjs';

type FlowFormProps = {
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  load: () => void;
  initialValues?: FlowFormType;
  flow?: flows.GetFlowResult;
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
  currency: FormObjectValue | null;
  exchangeRate: string;
  flowDescription: string;
  firstReported: Dayjs | null;
  decisionDate: Dayjs | null;
  donorBudgetYear: string;
  flowType: FormObjectValue | null;
  flowStatus: FormObjectValue | null;
  flowDate: Dayjs | null;
  contributionType: FormObjectValue | null;
  earmarkingType: FormObjectValue | null;
  method: FormObjectValue | null;
  keywords: FormObjectValue[];
  beneficiaryGroup: FormObjectValue | null;
  notes: string;

  parentFlow: FlowLinkProps | null;
  childFlows: FlowLinkProps[];

  reportingDetails: ReportingDetailProps[];

  restricted: boolean;
  isErrorCorrection: boolean;
  isInactive: boolean;
};

export type FlowFormTypeValidated = Omit<
  FlowFormType,
  'firstReported' | 'flowDate' | 'flowStatus'
> & {
  firstReported: NonNullable<FlowFormType['firstReported']>;
  flowDate: NonNullable<FlowFormType['flowDate']>;
  flowStatus: NonNullable<FlowFormType['flowStatus']>;
};

export const INITIAL_FORM_VALUES: FlowFormType = {
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

  isNewMoney: true,
  amountUSD: '',
  amountOriginalCurrency: '',
  currency: null,
  exchangeRate: '',
  flowDescription: '',
  firstReported: null,
  decisionDate: null,
  donorBudgetYear: '',
  flowType: null,
  flowStatus: null,
  flowDate: null,
  contributionType: null,
  earmarkingType: null,
  method: null,
  keywords: [],
  beneficiaryGroup: null,
  notes: '',

  parentFlow: null,
  childFlows: [],

  reportingDetails: [REPORTING_DETAIL_INITIAL_VALUES],

  restricted: false,
  isErrorCorrection: false,
  isInactive: false,
};

const FORM_VALIDATION_SCHEMA = io.type({
  amountUSD: codecs.CURRENCY_INTEGER_GREATER_THAN_0_FROM_STRING,
  flowStatus: codecs.NON_NULL_VALUE,
  flowDescription: codecs.NON_EMPTY_STRING,
  firstReported: codecs.VALID_DAYJS_DATE,
  flowDate: codecs.VALID_DAYJS_DATE,
  fundingSourceOrganizations: codecs.NON_EMPTY_ARRAY,
  fundingSourceUsageYears: codecs.NON_EMPTY_ARRAY,
  fundingDestinationOrganizations: codecs.NON_EMPTY_ARRAY,
  fundingDestinationUsageYears: codecs.NON_EMPTY_ARRAY,
});

export const FormGroup = ({
  title,
  children,
  styles,
  closeButtonAction,
}: {
  title: string;
  children?: React.ReactNode;
  styles?: SxProps<Theme>;
  closeButtonAction?: () => void;
}) => {
  return (
    <Paper elevation={3} sx={styles}>
      <Box sx={tw`flex items-center justify-between`}>
        <h2>{title}</h2>
        {closeButtonAction && (
          <MdClose onClick={closeButtonAction} style={{ cursor: 'pointer' }} />
        )}
      </Box>
      {children}
    </Paper>
  );
};

const FlowAmountButton = ({
  amountUSD,
  amountOriginalCurrency,
  exchangeRate,
  setFieldValue,
}: {
  amountUSD: FlowFormType['amountUSD'];
  amountOriginalCurrency: FlowFormType['amountOriginalCurrency'];
  exchangeRate: FlowFormType['exchangeRate'];
  setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'];
}) => {
  const amountUSDInt = currencyToInteger(amountUSD);
  const amountOriginalCurrencyInt = currencyToInteger(amountOriginalCurrency);
  const exchangeRateFloat = parseFloat(exchangeRate);

  if (amountUSDInt && amountOriginalCurrencyInt && !exchangeRateFloat) {
    const buttonProps = {
      onClick: () =>
        setFieldValue('exchangeRate', amountOriginalCurrencyInt / amountUSDInt),
      text: 'Calculate the exchange rate',
    };
    return <C.Button color="primary" {...buttonProps} className="text-end" />;
  } else if (amountUSDInt && !amountOriginalCurrencyInt && exchangeRateFloat) {
    const buttonProps = {
      onClick: () =>
        setFieldValue(
          'amountOriginalCurrency',
          valueToInteger(amountUSDInt * exchangeRateFloat)
        ),
      text: 'Calculate the original amount',
    };
    return <C.Button color="primary" {...buttonProps} className="text-end" />;
  } else if (!amountUSDInt && amountOriginalCurrencyInt && exchangeRateFloat) {
    const buttonProps = {
      onClick: () =>
        setFieldValue(
          'amountUSD',
          valueToInteger(amountOriginalCurrencyInt / exchangeRateFloat)
        ),
      text: 'Calculate the USD amount',
    };
    return <C.Button color="primary" {...buttonProps} className="text-end" />;
  }
  return;
};

export const FlowForm = (props: FlowFormProps) => {
  const env = getEnv();
  const navigate = useNavigate();

  const { setError, initialValues } = props;

  const handleSubmit = (values: FlowFormTypeValidated) => {
    //  TODO: Add form validation at this point
    if (props.flow?.id) {
      env.model.flows
        .updateFlow({
          flow: {
            ...parseFlowForm(values, props.flow?.id).flow,
            id: props.flow.id,
            versionID: props.flow.versionID,
          },
        })
        .then(() => {
          props.load();
        })
        .catch((err) => {
          setError(err.json.message);
        });
    } else {
      env.model.flows
        .createFlow(parseFlowForm(values, props.flow?.id))
        .then((res) => {
          navigate(paths.flow(res.id), {
            state: { successMessage: 'success message' },
          });
        })
        .catch((err) => {
          console.error(err);
          setError(err.json.message);
        });
    }
  };
  const handleChangeFirstReported = (
    newValue: Dayjs | null,
    setFieldValue: FormikHelpers<FlowFormType>['setFieldValue'],
    values: FlowFormType
  ) => {
    // Create a deep copy of the reportingDetails array
    const newReportingDetails = values.reportingDetails.map((reportingDetail) =>
      // Only update if dateReported is null/undefined
      !reportingDetail.dateReported
        ? { ...reportingDetail, dateReported: newValue }
        : reportingDetail
    );

    // Update both reportingDetails and firstReported fields in Formik's state
    setFieldValue('reportingDetails', newReportingDetails);
    setFieldValue('firstReported', newValue);
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <Formik
          initialValues={initialValues || INITIAL_FORM_VALUES}
          onSubmit={(values) => handleSubmit(values as FlowFormTypeValidated)}
          validate={(values) => validateForm(values, FORM_VALIDATION_SCHEMA)}
        >
          {({ values, isValid, setFieldValue }) => (
            <Form>
              <C.CheckBox
                name="restricted"
                label="Restricted to internal use"
              />
              {initialValues && (
                <>
                  <C.CheckBox
                    name="isErrorCorrection"
                    label="As error correction"
                  />
                  <C.CheckBox name="isInactive" label="Set as inactive" />
                </>
              )}
              <Box sx={tw`flex mt-6 mx-6 gap-x-10`}>
                <FormGroup
                  title="Source Flow"
                  styles={tw`p-6 basis-2/12 sticky top-20 h-fit max-w-[16.666%]`}
                >
                  {values.parentFlow && (
                    <FlowLinkWarning text="This flow is linked to a parent flow, so Source flow is not editable" />
                  )}
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingSourceOrganizations"
                    label="Organization(s)"
                    fnPromise={(query) => fnOrganizations(query, env)}
                    disabled={!!values.parentFlow}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingSourceUsageYears"
                    label="Usage Year(s)"
                    fnPromise={() => fnUsageYears(env)}
                    isAutocompleteAPI={false}
                    disabled={!!values.parentFlow}
                    isMulti
                    required
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingSourceLocations"
                    label="Location(s)"
                    fnPromise={(query) => fnLocations(query, env)}
                    disabled={!!values.parentFlow}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingSourceEmergencies"
                    label="Emergency(ies)"
                    fnPromise={(query) => fnEmergencies(query, env)}
                    disabled={!!values.parentFlow}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingSourceGlobalClusters"
                    label="Global Cluster(s)"
                    fnPromise={() => fnGlobalClusters(env)}
                    isAutocompleteAPI={false}
                    disabled={!!values.parentFlow}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingSourcePlan"
                    label="Plan"
                    fnPromise={(query) => fnPlans(query, env)}
                    disabled={!!values.parentFlow}
                  />
                  {/* TODO: Properly implement Field Clusters */}
                  <AutocompleteSelectReview
                    fieldName="fundingSourceFieldClusters"
                    label="Field Cluster(s)"
                    options={[]}
                    disabled={values.fundingSourcePlan === null}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingSourceProject"
                    label="Project"
                    fnPromise={(query) => fnProjects(query, env)}
                    disabled={!!values.parentFlow}
                  />
                </FormGroup>

                <Box sx={tw`basis-8/12 max-w-[66.666%] flex flex-col gap-y-4`}>
                  <FormGroup title="Flow" styles={tw`p-6`}>
                    <Box sx={tw`grid grid-cols-2 gap-y-8 gap-x-24`}>
                      <div>
                        {/* TODO: Verify this field works as expected */}
                        <C.CheckBox
                          name="isNewMoney"
                          label="Is this flow new money ?"
                        />
                        <NumberFieldReview
                          fieldName="amountUSD"
                          label="Funding Amount in USD"
                          type="currency"
                          required
                        />
                        <Box
                          sx={tw`border border-unocha-panel-border border-solid rounded px-4 py-8`}
                        >
                          <Box sx={tw`flex`}>
                            <NumberFieldReview
                              fieldName="amountOriginalCurrency"
                              label="Funding amount (Original currency)"
                              type="unknownCurrency"
                              sx={tw`basis-4/6`}
                            />
                            <AsyncAutocompleteSelectReview
                              fieldName="currency"
                              label="Currency"
                              fnPromise={() => fnCurrencies(env)}
                              isAutocompleteAPI={false}
                              sx={tw`basis-2/6`}
                            />
                          </Box>
                          <NumberFieldReview
                            fieldName="exchangeRate"
                            label="Exchange Rate Used"
                            type="float"
                          />
                          <FlowAmountButton
                            setFieldValue={setFieldValue}
                            amountUSD={values.amountUSD}
                            amountOriginalCurrency={
                              values.amountOriginalCurrency
                            }
                            exchangeRate={values.exchangeRate}
                          />
                        </Box>
                        <TextFieldReview
                          fieldName="flowDescription"
                          label="Funding Flow Description"
                          placeholder="1-2 sentences for flow name"
                          required
                          textarea
                          minRows={2}
                        />
                        <Box sx={tw`flex gap-4`}>
                          <C.DatePicker
                            label="First Reported (DD/MM/YY)"
                            name="firstReported"
                            onChange={(value) =>
                              handleChangeFirstReported(
                                value,
                                setFieldValue,
                                values
                              )
                            }
                          />
                          <C.DatePicker
                            label="Decision Date (DD/MM/YY)"
                            name="decisionDate"
                          />
                        </Box>
                        <NumberFieldReview
                          label="Donor Budget Year (YYYY)"
                          fieldName="donorBudgetYear"
                          type="number"
                          placeholder="YYYY"
                        />
                      </div>
                      <div>
                        <AsyncAutocompleteSelectReview
                          fieldName="flowType"
                          label="Flow Type"
                          fnPromise={() => fnFlowTypeId(env)}
                          isAutocompleteAPI={false}
                        />
                        <AsyncAutocompleteSelectReview
                          fieldName="flowStatus"
                          label="Flow Status"
                          fnPromise={() => fnFlowStatusId(env)}
                          isAutocompleteAPI={false}
                        />
                        <C.DatePicker label="Flow Date" name="flowDate" />
                        <AsyncAutocompleteSelectReview
                          fieldName="contributionType"
                          label="Contribution Type"
                          fnPromise={() =>
                            fnCategories('contributionType', env)
                          }
                          isAutocompleteAPI={false}
                        />
                        <AsyncAutocompleteSelectReview
                          fieldName="earmarkingType"
                          label="GB Earmarking"
                          fnPromise={() => fnCategories('earmarkingType', env)}
                          isAutocompleteAPI={false}
                        />
                        <AsyncAutocompleteSelectReview
                          fieldName="method"
                          label="Aid Modality"
                          fnPromise={() => fnCategories('method', env)}
                          isAutocompleteAPI={false}
                          required
                        />
                        <AsyncAutocompleteSelectReview
                          fieldName="keywords"
                          label="Keyword(s)"
                          fnPromise={() => fnCategories('keywords', env)}
                          isAutocompleteAPI={false}
                          isMulti
                        />
                        <AsyncAutocompleteSelectReview
                          fieldName="beneficiaryGroup"
                          label="Beneficiary group"
                          fnPromise={() =>
                            fnCategories('beneficiaryGroup', env)
                          }
                          isAutocompleteAPI={false}
                        />
                      </div>
                    </Box>
                    <TextFieldReview
                      fieldName="notes"
                      label="Notes"
                      textarea
                      minRows={3}
                    />
                  </FormGroup>
                  <FormGroup title="Linked Flows" styles={tw`p-6`}>
                    {values.parentFlow && (
                      <Box sx={tw`my-4`}>
                        <h3>Parent Flow</h3>
                        <FlowLink
                          flowLink={values.parentFlow}
                          fieldName="parentFlow"
                        />
                      </Box>
                    )}

                    {values.childFlows.length > 0 && (
                      <Box sx={tw`mb-4`}>
                        <h3>Child Flows</h3>
                        <Box sx={tw`flex flex-col gap-y-4 my-4`}>
                          {values.childFlows.map((childFlow) => (
                            <div key={childFlow.id}>
                              <FlowLink
                                flowLink={childFlow}
                                fieldName="childFlows"
                              />
                            </div>
                          ))}
                        </Box>
                        <Box sx={tw`text-end font-bold`}>
                          <span>
                            {values.amountUSD
                              ? 'US$' +
                                integerToCurrency(
                                  currencyToInteger(values.amountUSD) -
                                    values.childFlows.reduce(
                                      (acc, cur) =>
                                        acc + valueToInteger(cur.amountUSD),
                                      0
                                    )
                                )
                              : undefined}
                          </span>
                        </Box>
                      </Box>
                    )}

                    <Box sx={tw`flex gap-x-4`}>
                      {!values.parentFlow && (
                        <FlowSearch
                          name="parentFlow"
                          text="Add Parent Flow"
                          startIcon={MdAdd}
                        />
                      )}
                      <FlowSearch
                        name="childFlows"
                        text="Add Child Flow"
                        startIcon={MdAdd}
                      />
                    </Box>
                  </FormGroup>
                  {values.reportingDetails.length > 0 ? (
                    values.reportingDetails.map((reportingDetail, index) => (
                      <ReportingDetail
                        reportingDetailValue={reportingDetail}
                        index={index}
                      />
                    ))
                  ) : (
                    <ReportingDetail index={0} />
                  )}
                  <C.Button
                    text="Add Reporting Detail"
                    onClick={() =>
                      setFieldValue('reportingDetails', [
                        ...values.reportingDetails,
                        REPORTING_DETAIL_INITIAL_VALUES,
                      ])
                    }
                    color="primary"
                  />
                </Box>

                <FormGroup
                  title="Destination Flow"
                  styles={tw`p-6 basis-2/12 sticky top-20 h-fit max-w-[16.666%]`}
                >
                  {values.childFlows.length > 0 && (
                    <FlowLinkWarning text="This flow is linked to another flow" />
                  )}
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationOrganizations"
                    label="Organization(s)"
                    fnPromise={(query) => fnOrganizations(query, env)}
                    isMulti
                    required
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationUsageYears"
                    label="Usage Year(s)"
                    fnPromise={() => fnUsageYears(env)}
                    isAutocompleteAPI={false}
                    isMulti
                    required
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationLocations"
                    label="Location(s)"
                    fnPromise={(query) => fnLocations(query, env)}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationEmergencies"
                    label="Emergency(ies)"
                    fnPromise={(query) => fnEmergencies(query, env)}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationGlobalClusters"
                    label="Global Cluster(s)"
                    fnPromise={() => fnGlobalClusters(env)}
                    isAutocompleteAPI={false}
                    isMulti
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationPlan"
                    label="Plan"
                    fnPromise={(query) => fnPlans(query, env)}
                  />
                  {/* TODO: Properly implement Field Clusters */}
                  <AutocompleteSelectReview
                    fieldName="fundingDestinationFieldClusters"
                    label="Field Cluster(s)"
                    options={[]}
                    disabled={values.fundingDestinationPlan === null}
                  />
                  <AsyncAutocompleteSelectReview
                    fieldName="fundingDestinationProject"
                    label="Project"
                    fnPromise={(query) => fnProjects(query, env)}
                  />
                </FormGroup>
              </Box>
              <Snackbar
                open
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={tw`rounded-[4px] bg-unocha-primary`}
                TransitionComponent={Grow}
              >
                {/* TODO: Write this better */}
                <Box
                  sx={tw`px-10 py-3 flex gap-x-4 items-center transition-all`}
                >
                  <span style={{ color: '#fff' }}>
                    {isValid
                      ? 'Form is ready for submit'
                      : 'Please fill all required fields'}
                  </span>
                  {isValid && (
                    <C.ButtonSubmit color="primary_light" text="Submit" />
                  )}
                </Box>
              </Snackbar>
            </Form>
          )}
        </Formik>
      )}
    </AppContext.Consumer>
  );
};
