import { C } from '@unocha/hpc-ui';
import { Form, Formik } from 'formik';

import { Environment } from '../../environments/interface';
import { number, object } from 'yup';
import Section from './section';
import tw from 'twin.macro';

interface Props {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  environment: Environment;
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
    console.log(values);
    /* const queryParams: SearchFlowsGraphQlParams = {
      flowSearch: {
        filters: {
          flowId: parseInt(flowDetailsFlowId),
          keywords: flowDetailsKeywords,
          amountUSD: parseInt(flowDetailsAmountUSD),
          destinationCountryName: destinationDetailsCountry,
          destinationOrganizationId: destinationDetailsOrganizations.map((id) =>
            parseInt(id)
          ),
          destinationUsageYers: destinationDetailsUsageYears,
          sourceCountryName: sourceDetailsCountry,
          sourceOrganizationId: sourceDetailsOrganizations.map((id) =>
            parseInt(id)
          ),
          sourceUsageYers: sourceDetailsUsageYears,
        },
      },
    }; */
  };

  const FORM_VALIDATION = object().shape({
    flowDetailsFlowId: number(),
    flowDetailsAmountUSD: number(),
  });
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
            <C.AutocompleteSelect
              label="Organization(s)"
              name="sourceDetailsOrganizations"
              fnPromise={
                props.environment.model.organizations
                  .getAutocompleteOrganizations
              }
            />
            <C.MultiSelectWrapper
              label="Country"
              name="sourceDetailsCountry"
              options={[
                { name: 'Spain', value: 'Spain' },
                { name: 'France', value: 'France' },
              ]}
            />

            <C.MultiSelectWrapper
              label="Usage Year(s)"
              name="sourceDetailsUsageYears"
              options={[
                { name: '2020', value: 2020 },
                { name: '2021', value: 2021 },
                { name: '2022', value: 2022 },
                { name: '2023', value: 2023 },
                { name: '2024', value: 2024 },
                { name: '2025', value: 2025 },
                { name: '2026', value: 2026 },
              ]}
            />
          </Section>
          <Section title="Destination Details" name="destinationDetails">
            <C.AutocompleteSelect
              label="Organization(s)"
              name="destinationDetailsOrganizations"
              fnPromise={
                props.environment.model.organizations
                  .getAutocompleteOrganizations
              }
            />
            <C.MultiSelectWrapper
              label="Country"
              name="destinationDetailsCountry"
              options={[
                { name: 'Spain', value: 'Spain' },
                { name: 'France', value: 'France' },
              ]}
            />

            <C.MultiSelectWrapper
              label="Usage Year(s)"
              name="destinationDetailsUsageYears"
              options={[
                { name: '2020', value: 2020 },
                { name: '2021', value: 2021 },
                { name: '2022', value: 2022 },
                { name: '2023', value: 2023 },
                { name: '2024', value: 2024 },
                { name: '2025', value: 2025 },
                { name: '2026', value: 2026 },
              ]}
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
