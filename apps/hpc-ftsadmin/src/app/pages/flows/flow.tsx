import { type categories, type flows } from '@unocha/hpc-data';
import { C, useDataLoader } from '@unocha/hpc-ui';
import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import dayjs, { FTS_DEFAULT_FORMAT } from '../../../libs/dayjs';
import { FlowForm } from '../../components/flow-form/flow-form';
import PageMeta from '../../components/page-meta';
import { AppContext, getContext, getEnv } from '../../context';
import paths from '../../paths';
import { TOAST_CONFIG } from '../../utils/constants';
import {
  fnCategories,
  fnFlowStatusId,
  fnFlowTypeId,
} from '../../utils/fn-promises';
import {
  deserializeFlowForm,
  type FlowFormTypeSerialized,
  parseToFlowForm,
} from '../../utils/parse-flow-form';

type FlowRouteParams = {
  id: string;
  version?: string;
};

type PendingFlow = Omit<flows.GetFlowResult, 'activeVersion'> & {
  activeVersion: flows.GetFlowResult;
};

const PaddingContainer = tw.div`
  xl:px-12
  px-6
  mb-16
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

const FlowActiveVersionPath = ({
  flow,
  categories,
  isInactive,
}: {
  flow: flows.GetFlowResult;
  categories: categories.Category[];
  isInactive: boolean;
}) => {
  const lang = getContext().lang;
  const pendingReview = categories.find((cat) => cat.name === 'Pending review');
  const activeFlow = flow.versions.find((f) => f.activeStatus === true);
  const pendingFlow = flow.versions.find((f) =>
    f.categories.some((cat) => cat.categoryID === pendingReview?.id)
  );

  const isRestricted = flow.restricted;
  const isInactiveWithActiveVersion = isInactive && activeFlow;
  const isCurrentFlowPendingFlow =
    flow.id === pendingFlow?.id && flow.versionID === pendingFlow?.versionID;

  return (
    <>
      {isInactive && (
        <InactiveReason>
          {flow.deletedAt
            ? t.t(lang, (s) => s.components.flow.deleted)
            : t.t(lang, (s) => s.components.flow.inactiveReason, {
                reason:
                  flow.categories.find((c) => c.group === 'inactiveReason')
                    ?.name ??
                  t.t(lang, (s) => s.components.flow.unknownInactiveReasons),
              })}
        </InactiveReason>
      )}
      {pendingFlow && !isCurrentFlowPendingFlow && (
        <InactiveReason>
          {t.t(lang, (s) => s.components.flow.hasPendingFlowLinkText)}
          <Link
            to={paths.flow(pendingFlow.id, pendingFlow.versionID)}
          >{`${pendingFlow.id}v${pendingFlow.versionID}`}</Link>
        </InactiveReason>
      )}
      {isInactiveWithActiveVersion && (
        <InactiveReason>
          {t.t(lang, (s) => s.components.flow.activeFlowLinkText)}
          <Link
            to={paths.flow(activeFlow.id, activeFlow.versionID)}
          >{`${activeFlow.id}v${activeFlow.versionID}`}</Link>
        </InactiveReason>
      )}
      {isRestricted && (
        <InactiveReason>
          {t.t(lang, (s) => s.components.flow.restricted)}
        </InactiveReason>
      )}
    </>
  );
};

export default () => {
  const historyState:
    | {
        successMessage?: string;
        flowFormCopyValues?: FlowFormTypeSerialized;
        flowFormCopyValuesName?: string;
        flowFormCopyValuesPath?: string;
      }
    | undefined = useLocation().state;

  const UPDATE_CREATE_DATE_FORMAT = `${FTS_DEFAULT_FORMAT} - HH:mm:ss` as const;
  useEffect(() => {
    if (historyState?.successMessage) {
      toast.success(historyState.successMessage, TOAST_CONFIG);
    }
  }, [historyState?.successMessage]);

  const { id: idString, version } = useParams<FlowRouteParams>();

  const isPendingFlow = (flow: flows.GetFlowResult): flow is PendingFlow =>
    flow.categories.some((c) => c.name === 'Pending review');
  const isInactiveFlow = (flow: flows.GetFlowResult) =>
    !flow.activeStatus ||
    flow.categories.some((c) => c.group === 'inactiveReason');

  const id = parseInt(idString ?? '', 10);
  const versionID = parseInt(version ?? '', 10);
  const env = getEnv();

  if (id) {
    const getFlow = (version?: number) => {
      return env.model.flows.getFlow({ id, versionID: version });
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
            env.model.flows.getFlow({ id: parent.parentID })
          )
        ),
        Promise.all(
          flow.children.map((child) =>
            env.model.flows.getFlow({ id: child.childID })
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
            {({ flow, parents, children, ...otherFlowFormProps }) => {
              const isPending = isPendingFlow(flow);
              const isInactive = isInactiveFlow(flow);
              return (
                <>
                  <PageMeta
                    title={[
                      t.t(lang, (s) => s.routes.flow.title, {
                        id,
                        versionID: flow.versionID,
                      }),
                    ]}
                  />
                  <PaddingContainer>
                    <C.PageTitle>
                      {t.t(lang, (s) => s.routes.flow.title, {
                        id,
                        versionID: flow.versionID,
                      })}
                    </C.PageTitle>
                    <UpdatedCreatedBy>
                      {t.t(lang, (s) => s.components.flow.updatedBy, {
                        date: dayjs(flow.updatedAt).format(
                          UPDATE_CREATE_DATE_FORMAT
                        ),
                        user: flow.lastUpdatedBy?.name ?? DEFAULT_USERNAME,
                      })}
                    </UpdatedCreatedBy>
                    <UpdatedCreatedBy>
                      {t.t(lang, (s) => s.components.flow.createdBy, {
                        date: dayjs(flow.createdAt).format(
                          UPDATE_CREATE_DATE_FORMAT
                        ),
                        user: flow.createdBy?.name ?? DEFAULT_USERNAME,
                      })}
                    </UpdatedCreatedBy>

                    <FlowActiveVersionPath
                      flow={flow}
                      categories={otherFlowFormProps.inactiveReasons}
                      isInactive={isInactive}
                    />

                    {flow.legacy?.legacyID && (
                      <LegacyId>
                        {t.t(lang, (s) => s.components.flow.legacyID, {
                          id: flow.legacy.legacyID,
                        })}
                      </LegacyId>
                    )}
                    <FlowForm
                      initialValues={
                        isPending
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
                      isPending={isPending}
                      isInactive={isInactive}
                      {...otherFlowFormProps}
                    />
                  </PaddingContainer>
                </>
              );
            }}
          </C.Loader>
        )}
      </AppContext.Consumer>
    );
  }
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
};
