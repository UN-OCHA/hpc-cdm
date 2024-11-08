import { C, useDataLoader } from '@unocha/hpc-ui';
import { FlowForm } from '../../components/flow-form/flow-form';
import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { AppContext, getEnv } from '../../context';
import { t } from '../../../i18n';
import tw from 'twin.macro';
import {
  type FlowFormTypeSerialized,
  parseToFlowForm,
  deserializeFlowForm,
} from '../../utils/parse-flow-form';
import { flows } from '@unocha/hpc-data';
import dayjs from '../../../libs/dayjs';

type FlowRouteParams = {
  id: string;
  version?: string;
};

type FlowRestPending = Omit<flows.GetFlowResult, 'activeVersion'> & {
  activeVersion: flows.GetFlowResult;
};

const PaddingContainer = tw.div`
  xl:px-12
  px-6
`;

const UpdatedCreatedBy = tw.h4`
  m-0
`;

const InactiveReason = tw.span`
  text-unocha-warning-dark
  block
`;

const LegacyId = tw.span`
  my-2
  text-unocha-pallete-blue
  block
`;

export default () => {
  const historyState:
    | {
        successMessage?: string;
        flowFormCopyValues?: FlowFormTypeSerialized;
        flowFormCopyValuesName?: string;
      }
    | undefined = useLocation().state;
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(historyState?.successMessage);
  const { id: idString, version } = useParams<FlowRouteParams>();

  const isPending = (flow: flows.GetFlowResult): flow is FlowRestPending =>
    flow.categories.some((c) => c.name === 'Pending review');
  const isInactive = (flow: flows.GetFlowResult) =>
    !flow.activeStatus ||
    flow.categories.some((c) => c.group === 'inactiveReason');

  const id = parseInt(idString ?? '', 10);
  const versionID = parseInt(version ?? '', 10);
  const env = getEnv();
  const [state, load] = useDataLoader([id], async () => {
    const flow = version
      ? await env.model.flows.getFlowVersionREST({ id, versionID })
      : await env.model.flows.getFlowREST({ id });

    const parents = await Promise.all(
      flow.parents.map((parent) =>
        env.model.flows.getFlowREST({ id: parent.parentID })
      )
    );

    const children = await Promise.all(
      flow.children.map((child) =>
        env.model.flows.getFlowREST({ id: child.childID })
      )
    );
    const inactiveReasons = await env.model.categories.getCategories({
      query: 'inactiveReason',
    });

    return {
      flow,
      parents,
      children,
      inactiveReasons,
    };
  });
  const [inactiveReasonsState] = useDataLoader([], async () => {
    return await env.model.categories.getCategories({
      query: 'inactiveReason',
    });
  });

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <>
          {idString ? (
            <C.Loader
              loader={state}
              strings={{
                ...t.get(lang, (s) => s.components.loader),
                notFound: {
                  ...t.get(lang, (s) => s.components.notFound),
                },
              }}
            >
              {({ flow, parents, children, inactiveReasons }) => (
                <PaddingContainer>
                  <C.PageTitle>{`Flow ${flow.id}v${flow.versionID}`}</C.PageTitle>
                  <UpdatedCreatedBy>{`Updated ${dayjs(
                    flow.updatedAt
                  ).format()} by ${
                    flow.lastUpdatedBy?.name ?? 'FTS User'
                  }`}</UpdatedCreatedBy>
                  <UpdatedCreatedBy>{`Created ${dayjs(
                    flow.createdAt
                  ).format()} by ${
                    flow.createdBy?.name ?? 'FTS User'
                  }`}</UpdatedCreatedBy>
                  {isInactive(flow) && (
                    <InactiveReason>{`This flow ${
                      flow.deletedAt
                        ? 'has been deleted'
                        : 'is not active because it has been marked as ' +
                          (flow.categories.find(
                            (c) => c.group === 'inactiveReason'
                          )?.name ?? 'Inactive by unknown reasons')
                    }`}</InactiveReason>
                  )}
                  {flow.legacy?.legacyID && (
                    <LegacyId>
                      Legacy contribution ID: {flow.legacy.legacyID}
                    </LegacyId>
                  )}
                  <FlowForm
                    setError={setError}
                    initialValues={
                      isPending(flow)
                        ? parseToFlowForm(
                            {
                              ...(flow.activeVersion ?? flow),
                              reportDetails: flow.reportDetails,
                            },
                            parents,
                            children
                          )
                        : parseToFlowForm(flow, parents, children)
                    }
                    flow={flow}
                    load={load}
                    inactiveReasons={inactiveReasons}
                    isPending={isPending(flow)}
                    isInactive={isInactive(flow)}
                  />
                </PaddingContainer>
              )}
            </C.Loader>
          ) : (
            <PaddingContainer>
              <C.PageTitle>
                {historyState?.flowFormCopyValues &&
                historyState?.flowFormCopyValuesName
                  ? `Copy of Flow ${historyState?.flowFormCopyValuesName}`
                  : 'Add Flow'}
              </C.PageTitle>
              <C.Loader
                loader={inactiveReasonsState}
                strings={{
                  ...t.get(lang, (s) => s.components.loader),
                  notFound: {
                    ...t.get(lang, (s) => s.components.notFound),
                  },
                }}
              >
                {(inactiveReasons) => (
                  <FlowForm
                    setError={setError}
                    load={load}
                    inactiveReasons={inactiveReasons}
                    initialValues={
                      historyState?.flowFormCopyValues
                        ? deserializeFlowForm(historyState.flowFormCopyValues)
                        : undefined
                    }
                  />
                )}
              </C.Loader>
            </PaddingContainer>
          )}

          <C.MessageAlert
            setMessage={setError}
            message={error}
            severity="error"
          />
          <C.MessageAlert
            setMessage={setSuccess}
            message={success}
            severity="success"
          />
        </>
      )}
    </AppContext.Consumer>
  );
};
