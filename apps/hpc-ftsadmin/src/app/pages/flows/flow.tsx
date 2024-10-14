import { C, useDataLoader } from '@unocha/hpc-ui';
import { FlowForm } from '../../components/flow-form/flow-form';
import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AppContext, getEnv } from '../../context';
import { t } from '../../../i18n';
import tw from 'twin.macro';
import { parseToFlowForm } from '../../utils/parse-flow-form';

type FlowRouteParams = {
  id: string;
  version?: string;
};

const PaddingContainer = tw.div`
  xl:px-12
  px-6
`;

const InactiveReason = tw.span`
  text-unocha-warning-dark
`;

export default () => {
  const historyState: { successMessage?: string } | undefined =
    useLocation().state;
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(historyState?.successMessage);
  const { id: idString, version } = useParams<FlowRouteParams>();

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

    return {
      flow,
      parents,
      children,
    };
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
              {({ flow, parents, children }) => (
                <PaddingContainer>
                  <C.PageTitle>{`Flow ${flow.id}v${flow.versionID}`}</C.PageTitle>
                  {!flow.activeStatus && (
                    <InactiveReason>{`This flow is not active because it has been marked as ${
                      flow.categories.find((c) => c.group === 'inactiveReason')
                        ?.name ?? 'Inactive by unknown reasons'
                    }`}</InactiveReason>
                  )}
                  <FlowForm
                    setError={setError}
                    initialValues={parseToFlowForm(flow, parents, children)}
                    flow={flow}
                    load={load}
                  />
                </PaddingContainer>
              )}
            </C.Loader>
          ) : (
            <PaddingContainer>
              <C.PageTitle>Add Flow</C.PageTitle>

              <FlowForm setError={setError} load={load} />
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
