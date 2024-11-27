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
  projectsOptions,
  usageYearsOptions,
} from '../../utils/fn-promises';
import {
  isFormObjectValue,
  type RefDirection,
} from '../../utils/parse-flow-form';
import {
  flowLinkToFormObjectValue,
  flowToFormObjectValue,
} from '../../utils/utils';
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
  'fundingSourceUsageYears',
  'fundingSourceLocations',
  'fundingSourceGlobalClusters',
  'fundingSourcePlan',
  'fundingSourceFieldClusters',
  'fundingSourceEmergencies',
  'fundingSourceProject',
] as const;

type OverridingFlowKeys = (typeof OVERRIDING_FLOW_KEYS)[number];

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
const filterByDirection = <
  T extends { flowObject: { refDirection: RefDirection } },
>(
  entities: T[],
  refDirection: RefDirection
): T[] => {
  return entities.filter(
    (entity) => entity.flowObject.refDirection === refDirection
  );
};

const FlowSearch = (props: FlowSearchProps) => {
  const { name, text, startIcon, currentFlow } = props;
  const hierarchy = name === 'parentFlow' ? 'parent' : 'child';

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
        const MAP_KEYS_TO_FIELDS: Pick<FlowFormType, OverridingFlowKeys> = {
          fundingSourceOrganizations: organizationsOptions(
            filterByDirection(overridingFlow.organizations, 'destination')
          ),
          fundingSourceLocations: locationsOptions(
            filterByDirection(overridingFlow.locations, 'destination')
          ),
          fundingSourceEmergencies: defaultOptions(
            filterByDirection(overridingFlow.emergencies, 'destination')
          ),
          fundingSourceGlobalClusters: defaultOptions(
            filterByDirection(overridingFlow.globalClusters, 'destination')
          ),
          fundingSourcePlan: filterByDirection(
            overridingFlow.plans,
            'destination'
          ).map((plan) => ({
            displayLabel: plan.planVersion.name,
            value: plan.id,
          })),
          fundingSourceProject: projectsOptions(
            filterByDirection(overridingFlow.projects, 'destination').map(
              (project) => ({
                ...project,
                name: project.projectVersions[0]?.name,
                projectVersionCode: project.code,
                value: project.id,
              })
            )
          ),
          fundingSourceUsageYears: usageYearsOptions(
            filterByDirection(overridingFlow.usageYears, 'destination')
          ),
          fundingSourceFieldClusters: filterByDirection(
            overridingFlow.clusters,
            'destination'
          ).map((cluster) => ({
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
          dataTest={`add-flow-add-${hierarchy}-flow-button`}
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
                dataTest={`add-flow-add-${hierarchy}-flow-field`}
              />
            </Box>
            <Box sx={tw`text-end mt-4`}>
              <C.Button
                color="primary"
                text={t.t(lang, (s) => s.components.mergeModal.button.next)}
                onClick={() => handleSubmit()}
                dataTest="add-flow-add-parent-flow-submit-button"
              />
            </Box>
          </Box>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default FlowSearch;
