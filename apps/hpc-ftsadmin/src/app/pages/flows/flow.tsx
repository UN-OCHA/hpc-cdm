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
import { fnCategories, fnFlowTypeId } from '../../utils/fn-promises';

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

  if (id) {
    const getFlow = (version?: number) => {
      if (version) {
        return env.model.flows.getFlowVersionREST({ id, versionID: version });
      }
      return env.model.flows.getFlowREST({ id });
    };

    const [state, load] = useDataLoader([id], async () => {
      const [flow, inactiveReasons, flowType, contributionType, method] =
        await Promise.all([
          getFlow(versionID),
          env.model.categories.getCategories({
            query: 'inactiveReason',
          }),
          fnFlowTypeId(env),
          fnCategories('contributionType', env),
          fnCategories('method', env),
        ]);

      const [parents, children] = await Promise.all([
        Promise.all(
          flow.parents.map((parent) =>
            env.model.flows.getFlowREST({ id: parent.parentID })
          )
        ),
        Promise.all(
          flow.children.map((child) =>
            env.model.flows.getFlowREST({ id: child.childID })
          )
        ),
      ]);

      return {
        flow,
        parents,
        children,
        inactiveReasons,
        flowType,
        contributionType,
        method,
      };
    });

    return (
      <AppContext.Consumer>
        {({ lang }) => (
          <>
            <C.Loader
              loader={state}
              strings={{
                ...t.get(lang, (s) => s.components.loader),
                notFound: {
                  ...t.get(lang, (s) => s.components.notFound),
                },
              }}
            >
              {({
                flow,
                parents,
                children,
                inactiveReasons,
                flowType,
                contributionType,
                method,
              }) => (
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
                    flowType={flowType}
                    contributionType={contributionType}
                    method={method}
                    isPending={isPending(flow)}
                    isInactive={isInactive(flow)}
                  />
                </PaddingContainer>
              )}
            </C.Loader>
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
  } else {
    const [state, load] = useDataLoader([], async () => {
      const [inactiveReasons, flowType, contributionType, method] =
        await Promise.all([
          env.model.categories.getCategories({
            query: 'inactiveReason',
          }),
          fnFlowTypeId(env),
          fnCategories('contributionType', env),
          fnCategories('method', env),
        ]);
      return {
        inactiveReasons,
        flowType,
        contributionType,
        method,
      };
    });

    return (
      <AppContext.Consumer>
        {({ lang }) => (
          <>
            <C.Loader
              loader={state}
              strings={{
                ...t.get(lang, (s) => s.components.loader),
                notFound: {
                  ...t.get(lang, (s) => s.components.notFound),
                },
              }}
            >
              {({ inactiveReasons, flowType, contributionType, method }) => (
                <PaddingContainer>
                  <C.PageTitle>
                    {historyState?.flowFormCopyValues &&
                    historyState?.flowFormCopyValuesName
                      ? `Copy of Flow ${historyState?.flowFormCopyValuesName}`
                      : 'Add Flow'}
                  </C.PageTitle>
                  <FlowForm
                    setError={setError}
                    load={load}
                    inactiveReasons={inactiveReasons}
                    flowType={flowType}
                    contributionType={contributionType}
                    method={method}
                    initialValues={
                      historyState?.flowFormCopyValues
                        ? deserializeFlowForm(historyState.flowFormCopyValues)
                        : undefined
                    }
                  />
                </PaddingContainer>
              )}
            </C.Loader>
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
  }
};
