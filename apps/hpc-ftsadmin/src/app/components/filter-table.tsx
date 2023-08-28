import { C } from '@unocha/hpc-ui';
import { Form, Formik } from 'formik';

import { Environment } from '../../environments/interface';
import { array, number, object, string } from 'yup';
import Section from './section';
import tw from 'twin.macro';
import { flows } from '@unocha/hpc-data';

interface Props {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  environment: Environment;
  setFilters: any;
}

const StyledDiv = tw.div`
mt-6
text-end
`;
export const FilterTable = (props: Props) => {
  interface FormValues {
    flowDetailsFlowId: string;
    flowDetailsAmountUSD: string;
    flowDetailsKeywords: string[];
    sourceDetailsOrganizations: string[];
    sourceDetailsCountry: string[];
    sourceDetailsUsageYears: string[];
    destinationDetailsOrganizations: string[];
    destinationDetailsCountry: string[];
    destinationDetailsUsageYears: string[];
  }

  const handleSubmit = (values: FormValues) => {
    const {
      destinationDetailsCountry,
      destinationDetailsOrganizations,
      destinationDetailsUsageYears,
      flowDetailsAmountUSD,
      flowDetailsFlowId,
      flowDetailsKeywords,
      sourceDetailsCountry,
      sourceDetailsOrganizations,
      sourceDetailsUsageYears,
    } = values;
    const queryParams: flows.SearchFlowsGraphQlParams = {
      flowSearch: {
        filters: {
          flowId: flowDetailsFlowId,
          keywords: flowDetailsKeywords,
          amountUSD: parseInt(flowDetailsAmountUSD),
          destinationCountryName: destinationDetailsCountry,
          destinationOrganization: destinationDetailsOrganizations,
          destinationUsageYears: destinationDetailsUsageYears,
          sourceCountryName: sourceDetailsCountry,
          sourceOrganization: sourceDetailsOrganizations,
          sourceUsageYears: sourceDetailsUsageYears,
        },
      },
    };
    props.setFilters(queryParams);
  };

  const FORM_VALIDATION = object().shape({
    flowDetailsFlowId: number()
      .positive()
      .integer()
      .typeError('Only positive integers are accepted'),
    flowDetailsAmountUSD: number()
      .positive()
      .typeError('Only positive integers are accepted'),
    flowDetailsKeywords: array(string()),
    sourceDetailsOrganizations: array(string()),
    sourceDetailsCountry: array(string()),
    sourceDetailsUsageYears: array(number()),
    destinationDetailsOrganizations: array(string()),
    destinationDetailsCountry: array(string()),
    destinationDetailsUsageYears: array(number()),
  });

  const yearsSelect = () => {
    const selectOptions: string[] = [];
    for (let i = 1900; i < 2100; i++) {
      selectOptions.push(i.toString());
    }
    return selectOptions;
  };
  return (
    <C.SearchFilter
      title="Search Filter"
      isOpen={props.isOpen}
      setOpen={props.setOpen}
    >
      <Formik
        initialValues={{
          flowDetailsFlowId: '',
          flowDetailsAmountUSD: '',
          flowDetailsKeywords: [],
          sourceDetailsOrganizations: [],
          sourceDetailsCountry: [],
          sourceDetailsUsageYears: [],
          destinationDetailsOrganizations: [],
          destinationDetailsCountry: [],
          destinationDetailsUsageYears: [],
        }}
        validationSchema={FORM_VALIDATION}
        onSubmit={handleSubmit}
      >
        <Form>
          <Section title="Flow Details" name="flowDetails">
            <C.TextFieldWrapper
              label="Flow Id"
              name="flowDetailsFlowId"
              type="text"
            />
            <C.TextFieldWrapper
              label="Amount USD"
              name="flowDetailsAmountUSD"
              type="text"
            />

            <C.MultiSelectWrapper
              label="Keywords"
              name="flowDetailsKeywords"
              options={[
                { name: 'uno', value: '1' },
                { name: 'dos', value: '2' },
              ]}
            />
          </Section>
          <Section title="Source Details" name="sourceDetails">
            <C.AsyncAutocompleteSelect
              label="Organization(s)"
              name="sourceDetailsOrganizations"
              fnPromise={
                props.environment.model.organizations
                  .getAutocompleteOrganizations
              }
              isMulti
            />
            <C.AsyncAutocompleteSelect
              label="Country"
              name="sourceDetailsCountry"
              fnPromise={
                props.environment.model.locations.getAutocompleteLocations
              }
              isMulti
            />

            <C.AutocompleteSelect
              label="Usage Year(s)"
              name="sourceDetailsUsageYears"
              options={yearsSelect()}
              isMulti
            />
          </Section>
          <Section title="Destination Details" name="destinationDetails">
            <C.AsyncAutocompleteSelect
              label="Organization(s)"
              name="destinationDetailsOrganizations"
              fnPromise={
                props.environment.model.organizations
                  .getAutocompleteOrganizations
              }
              isMulti
            />
            <C.AsyncAutocompleteSelect
              label="Country"
              name="destinationDetailsCountry"
              fnPromise={
                props.environment.model.locations.getAutocompleteLocations
              }
              isMulti
            />

            <C.AutocompleteSelect
              label="Usage Year(s)"
              name="destinationDetailsUsageYears"
              options={yearsSelect()}
              isMulti
            />
          </Section>
          <StyledDiv>
            <C.ButtonSubmit color="primary" text="Search" />
          </StyledDiv>
        </Form>
      </Formik>
    </C.SearchFilter>
  );
};
export default FilterTable;
