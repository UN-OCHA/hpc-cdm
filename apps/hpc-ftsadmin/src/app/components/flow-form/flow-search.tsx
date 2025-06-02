import { Box, Modal } from '@mui/material';
import { type flows, type util } from '@unocha/hpc-data';
import { type AsyncAutocompleteSelectProps, C } from '@unocha/hpc-ui';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { type IconType } from 'react-icons/lib';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import dayjs from '../../../libs/dayjs';
import { getContext, getEnv } from '../../context';
import {
  defaultOptions,
  fnFlows,
  locationsOptions,
  organizationsOptions,
  usageYearsOptions,
} from '../../utils/fn-promises';
import {
  flowLinkToFormObjectValue,
  flowToFormObjectValue,
} from '../../utils/map-functions';
import { isFormObjectValue } from '../../utils/parse-flow-form';
import { type FlowFormType } from './flow-form';
import { type FlowLinkProps } from './flow-link';
import FlowLinkWarning from './flow-link-warning';

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
  rounded-sm
`;

const StyledDiv = tw.div`
  self-center
`;

export const OVERRIDING_FLOW_KEYS = [
  'fundingSourceOrganizations',
  'fundingSourceLocations',
  'fundingSourceEmergencies',
  'fundingSourceGlobalClusters',
  'fundingSourcePlan',
  'fundingSourceProject',
  'fundingSourceUsageYears',
  'fundingSourceFieldClusters',
] as const;

const removeOptionsFn: AsyncAutocompleteSelectProps['removeOptionsFn'] = (
  response,
  removeOptions
) => {
  if (!removeOptions) {
    return response;
  }
  const res = response.filter(
    (responseObject) =>
      !removeOptions.some(
        (removeOption) =>
          responseObject.displayLabel === removeOption.displayLabel
      )
  );
  return res;
};

const FlowSearch = (props: FlowSearchProps) => {
  const { name, text, startIcon, currentFlow } = props;

  const env = getEnv();
  const lang = getContext().lang;

  const [flow, setFlow] = useState<util.FormObjectValue | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [flows, setFlows] = useState<flows.GetFlowsAutocompleteResult>();
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
      const rawFlowLink = JSON.parse(flow.value.toString());

      const flowLink: FlowLinkProps = {
        ...rawFlowLink,
        flowDate: dayjs(rawFlowLink.flowDate),
      };

      const existingValues = values[name];
      if (!existingValues || !Array.isArray(existingValues)) {
        setFieldValue(name, flowLink);

        const overridingFlow = flows?.find((flow) => flow.id === flowLink.id);
        if (!overridingFlow) {
          return;
        }
        const MAP_KEYS_TO_FIELDS: Record<
          (typeof OVERRIDING_FLOW_KEYS)[number],
          util.FormObjectValue[] | util.FormObjectValue | null
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

      setIsOpen(false);
    }
  };

  return (
    <>
      <StyledDiv>
        <C.Button
          text={text}
          color="neutral"
          onClick={() => setIsOpen(true)}
          startIcon={startIcon}
        />
      </StyledDiv>
      <Modal
        open={isOpen}
        keepMounted={false}
        onClose={() => setIsOpen(!isOpen)}
        sx={tw`flex items-center justify-center`}
      >
        <ModalContainer>
          <Box sx={tw`w-full`}>
            <h2>{t.t(lang, (s) => s.components.flowSearch.title)}</h2>
            {removeOptions.length !== 0 && (
              <FlowLinkWarning
                text={t.t(lang, (s) => s.components.flowSearch.warning, {
                  removeOptions: removeOptions
                    .map(({ displayLabel }) => /^(\d*)/.exec(displayLabel)?.[0])
                    .join(', '),
                })}
              />
            )}
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
                label={t.t(lang, (s) => s.components.flowSearch.flowId)}
                onChange={(newValue) => {
                  if (newValue && isFormObjectValue(newValue)) {
                    setFlow(newValue);
                  }
                }}
                removeOptions={removeOptions}
                removeOptionsFn={removeOptionsFn}
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
