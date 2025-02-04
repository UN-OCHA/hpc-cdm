import { C, useDataLoader } from '@unocha/hpc-ui';
import { FlowForm } from '../../components/flow-form/flow-form';
import { Link, useLocation, useParams } from 'react-router';
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
import {
  fnCategories,
  fnFlowStatusId,
  fnFlowTypeId,
} from '../../utils/fn-promises';
import { toast } from 'react-toastify';
import { TOAST_CONFIG } from '../../utils/constants';
import { useEffect } from 'react';

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

const DEFAULT_USERNAME = 'FTS User';

export default () => {
  const historyState:
    | {
        successMessage?: string;
        flowFormCopyValues?: FlowFormTypeSerialized;
        flowFormCopyValuesName?: string;
        flowFormCopyValuesPath?: string;
      }
    | undefined = useLocation().state;

  useEffect(() => {
    if (historyState?.successMessage) {
      toast.success(historyState.successMessage, TOAST_CONFIG);
    }
  }, [historyState?.successMessage]);

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

    const [state, load] = useDataLoader([id, version], async () => {
      const [
        flow,
        inactiveReasons,
        flowType,
        contributionType,
        method,
        earmarkingType,
        flowStatus,
      ] = await Promise.all([
        getFlow(versionID),
        env.model.categories.getCategories({
          query: 'inactiveReason',
        }),
        fnFlowTypeId(env),
        fnCategories('contributionType', env),
        fnCategories('method', env),
        fnCategories('earmarkingType', env),
        fnFlowStatusId(env),
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
        earmarkingType,
        flowStatus,
      };
    });

    return (
      <AppContext.Consumer>
        {({ lang }) => (
          <C.Loader
            loader={state}
            strings={{
              ...t.get(lang, (s) => s.components.loader),
              notFound: {
                ...t.get(lang, (s) => s.components.notFound),
              },
            }}
          >
            {({ flow, parents, children, ...otherFlowFormProps }) => (
              <PaddingContainer>
                <C.PageTitle>{`Flow ${flow.id}v${flow.versionID}`}</C.PageTitle>
                <UpdatedCreatedBy>
                  {t.t(lang, (s) => s.components.flow.updatedBy, {
                    date: dayjs(flow.updatedAt).format(),
                    user: flow.lastUpdatedBy?.name ?? DEFAULT_USERNAME,
                  })}
                </UpdatedCreatedBy>
                <UpdatedCreatedBy>
                  {t.t(lang, (s) => s.components.flow.createdBy, {
                    date: dayjs(flow.createdAt).format(),
                    user: flow.createdBy?.name ?? DEFAULT_USERNAME,
                  })}
                </UpdatedCreatedBy>
                {isInactive(flow) && (
                  <InactiveReason>
                    {flow.deletedAt
                      ? t.t(lang, (s) => s.components.flow.deleted)
                      : t.t(lang, (s) => s.components.flow.inactiveReason, {
                          reason:
                            flow.categories.find(
                              (c) => c.group === 'inactiveReason'
                            )?.name ??
                            t.t(
                              lang,
                              (s) => s.components.flow.unknownInactiveReasons
                            ),
                        })}
                  </InactiveReason>
                )}
                {flow.legacy?.legacyID && (
                  <LegacyId>
                    {t.t(lang, (s) => s.components.flow.legacyID, {
                      id: flow.legacy.legacyID,
                    })}
                  </LegacyId>
                )}
                <FlowForm
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
                  isPending={isPending(flow)}
                  isInactive={isInactive(flow)}
                  {...otherFlowFormProps}
                />
              </PaddingContainer>
            )}
          </C.Loader>
        )}
      </AppContext.Consumer>
    );
  } else {
    const [state, load] = useDataLoader([], async () => {
      const [
        inactiveReasons,
        flowType,
        contributionType,
        method,
        earmarkingType,
        flowStatus,
      ] = await Promise.all([
        env.model.categories.getCategories({
          query: 'inactiveReason',
        }),
        fnFlowTypeId(env),
        fnCategories('contributionType', env),
        fnCategories('method', env),
        fnCategories('earmarkingType', env),
        fnFlowStatusId(env),
      ]);
      return {
        inactiveReasons,
        flowType,
        contributionType,
        method,
        earmarkingType,
        flowStatus,
      };
    });

    return (
      <AppContext.Consumer>
        {({ lang }) => (
          <C.Loader
            loader={state}
            strings={{
              ...t.get(lang, (s) => s.components.loader),
              notFound: {
                ...t.get(lang, (s) => s.components.notFound),
              },
            }}
          >
            {(flowFormProps) => (
              <PaddingContainer>
                <C.PageTitle>
                  {historyState?.flowFormCopyValues &&
                  historyState.flowFormCopyValuesPath &&
                  historyState.flowFormCopyValuesName ? (
                    <span>
                      {t.t(lang, (s) => s.components.flow.copyOfFlow)}{' '}
                      <Link to={historyState.flowFormCopyValuesPath}>
                        {historyState.flowFormCopyValuesName}
                      </Link>
                    </span>
                  ) : (
                    t.t(lang, (s) => s.components.flow.addFLow)
                  )}
                </C.PageTitle>
                <FlowForm
                  {...flowFormProps}
                  load={load}
                  initialValues={
                    historyState?.flowFormCopyValues
                      ? deserializeFlowForm(historyState.flowFormCopyValues)
                      : undefined
                  }
                />
              </PaddingContainer>
            )}
          </C.Loader>
        )}
      </AppContext.Consumer>
    );
  }
};
