import { C } from '@unocha/hpc-ui';
import { Form, Formik } from 'formik';

import { Environment } from '../../environments/interface';
import { array, number, object, string } from 'yup';

import tw from 'twin.macro';
import { flows } from '@unocha/hpc-data';
import React from 'react';

interface Props {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  environment: Environment;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
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
    sourceDetailsOrganizations: { label: string; id: string }[];
    sourceDetailsCountry: { label: string; id: string }[];
    sourceDetailsUsageYears: string[];
    destinationDetailsOrganizations: { label: string; id: string }[];
    destinationDetailsCountry: { label: string; id: string }[];
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
          destinationCountries: destinationDetailsCountry.map((x) => `${x.id}`),
          destinationOrganizations: destinationDetailsOrganizations.map(
            (x) => `${x.id}`
          ),
          destinationUsageYears: destinationDetailsUsageYears,
          sourceCountries: sourceDetailsCountry.map((x) => `${x.id}`),
          sourceOrganizations: sourceDetailsOrganizations.map((x) => `${x.id}`),
          sourceUsageYears: sourceDetailsUsageYears,
        },
      },
    };
    console.log(queryParams);
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
    sourceDetailsOrganizations: array().of(
      object().shape({ label: string(), id: string() })
    ),
    sourceDetailsCountry: array().of(
      object().shape({ label: string(), id: string() })
    ),
    sourceDetailsUsageYears: array(number()),
    destinationDetailsOrganizations: array().of(
      object().shape({ label: string(), id: string() })
    ),
    destinationDetailsCountry: array().of(
      object().shape({ label: string(), id: string() })
    ),
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
          <C.Section title="Flow Details">
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
            <C.Section title="Show More" type="secondary">
              <C.TextFieldWrapper
                label="Amount USD"
                name="flowDetailsAmountUSD"
                type="text"
              />
            </C.Section>
          </C.Section>
          <C.Section title="Source Details">
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
          </C.Section>
          <C.Section title="Destination Details">
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
          </C.Section>
          <StyledDiv>
            <C.ButtonSubmit color="primary" text="Search" />
          </StyledDiv>
        </Form>
      </Formik>
    </C.SearchFilter>
  );
};
export default FilterTable;
