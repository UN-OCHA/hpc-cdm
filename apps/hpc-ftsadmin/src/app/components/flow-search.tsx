import { useState } from 'react';
import { Box, Modal } from '@mui/material';
import { C } from '@unocha/hpc-ui';
import tw from 'twin.macro';
import {
  defaultOptions,
  fnFlows,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from '../utils/fn-promises';
import { getContext, getEnv } from '../context';
import { t } from '../../i18n';
import { useFormikContext } from 'formik';
import { FormObjectValue, flows } from '@unocha/hpc-data';
import { isFormObjectValue } from '../utils/parse-flow-form';
import { IconType } from 'react-icons/lib';
import { FlowLinkProps } from './flow-link';
import { FlowFormType } from './flow-form';
import {
  flowLinkToFormObjectValue,
  flowToFormObjectValue,
} from '../utils/map-functions';

type FlowSearchProps = {
  name: 'parentFlow' | 'childFlows';
  text: string;
  startIcon?: false | IconType;
  currentFlow?: flows.GetFlowResult;
};
const ModalContainer = tw.div`
  p-8
  my-1 
  flex 
  justify-between 
  items-center
  bg-white
  shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]
  w-[30vw]
  rounded-[4px]
`;

const StyledDiv = tw.div`
  self-center
`;

const FlowSearch = (props: FlowSearchProps) => {
  const { name, text, startIcon, currentFlow } = props;

  const env = getEnv();
  const lang = getContext().lang;

  const [flow, setFlow] = useState<FormObjectValue | null>(null);
  const [open, setOpen] = useState(false);
  const [flows, setFlows] = useState<
    flows.GetFlowsAutocompleteResult | undefined
  >();
  const { setFieldValue, values } = useFormikContext<FlowFormType>();

  const removeOptions = [
    ...values.childFlows.map(flowLinkToFormObjectValue),
    ...(values.parentFlow
      ? [flowLinkToFormObjectValue(values.parentFlow)]
      : []),
    ...(currentFlow ? [flowToFormObjectValue(currentFlow)] : []),
  ];

  const handleSubmit = () => {
    if (flow) {
      const flowLink = JSON.parse(flow.value.toString()) as FlowLinkProps;
      const existingValues = values[name];
      if (!existingValues || !Array.isArray(existingValues)) {
        setFieldValue(name, flowLink);

        const overridingFlow = flows?.find((flow) => flow.id === flowLink.id);
        if (!overridingFlow) {
          return;
        }
        const OVERRIDING_FLOW_KEYS = [
          'fundingSourceOrganizations',
          'fundingSourceLocations',
          'fundingSourceEmergencies',
          'fundingSourceGlobalClusters',
          'fundingSourcePlan',
          'fundingSourceProject',
          'fundingSourceUsageYears',
          'fundingSourceFieldClusters',
        ] as const;
        const MAP_KEYS_TO_FIELDS: Record<
          (typeof OVERRIDING_FLOW_KEYS)[number],
          FormObjectValue[] | FormObjectValue | null
        > = {
          fundingSourceOrganizations: organizationsOptions(
            overridingFlow.organizations.filter(
              (org) => org.flowObject.refDirection === 'source'
            )
          ),
          fundingSourceLocations: locationsOptions(
            overridingFlow.locations.filter(
              (loc) => loc.flowObject.refDirection === 'source'
            )
          ),
          fundingSourceEmergencies: defaultOptions(
            overridingFlow.emergencies.filter(
              (emergency) => emergency.flowObject.refDirection === 'source'
            )
          ),
          fundingSourceGlobalClusters: defaultOptions(
            overridingFlow.globalClusters.filter(
              (gC) => gC.flowObject.refDirection === 'source'
            )
          ),
          fundingSourcePlan:
            overridingFlow.plans
              .filter((plan) => plan.flowObject.refDirection === 'source')
              .map((plan) => ({
                displayLabel: plan.planVersion.name,
                value: plan.id,
              }))
              .at(0) ?? null,
          fundingSourceProject:
            overridingFlow.projects
              .filter((project) => project.flowObject.refDirection === 'source')
              .map((project) => ({
                displayLabel: project.projectVersions[0]?.name,
                value: project.id,
              }))
              .at(0) ?? null,
          fundingSourceUsageYears: usageYearsOptions(
            overridingFlow.usageYears.filter(
              (usageYear) => usageYear.flowObject.refDirection === 'source'
            )
          ),
          fundingSourceFieldClusters: overridingFlow.clusters
            .filter((cluster) => cluster.flowObject.refDirection === 'source')
            .map((cluster) => ({
              displayLabel: cluster.governingEntityVersion.name,
              value: cluster.id,
            })),
        };
        for (const key of OVERRIDING_FLOW_KEYS) {
          setFieldValue(key, MAP_KEYS_TO_FIELDS[key]);
        }
      } else {
        setFieldValue(name, [...existingValues, flowLink]);
      }

      setOpen(false);
    }
  };

  return (
    <>
      <StyledDiv>
        <C.Button
          text={text}
          color="neutral"
          onClick={() => setOpen(true)}
          startIcon={startIcon}
        />
      </StyledDiv>
      <Modal
        open={open}
        keepMounted={false}
        onClose={() => setOpen(!open)}
        sx={tw`flex items-center justify-center`}
      >
        <ModalContainer>
          <Box sx={tw`w-full`}>
            <h2>Flow Search</h2>
            <Box sx={tw`flex items-center gap-x-4`}>
              <C.AsyncAutocompleteSelect
                fnPromise={(query) =>
                  fnFlows(
                    query,
                    env,
                    name === 'parentFlow' ? setFlows : undefined
                  )
                }
                name="flow"
                label="Introduce Flow ID:"
                onChange={(newValue) => {
                  if (newValue && isFormObjectValue(newValue)) {
                    setFlow(newValue);
                  }
                }}
                removeOptions={removeOptions}
              />
            </Box>
            <Box sx={tw`text-end mt-4`}>
              <C.Button
                color="primary"
                text={t.t(lang, (s) => s.components.mergeModal.button.next)}
                onClick={() => handleSubmit()}
              />
            </Box>
          </Box>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default FlowSearch;
