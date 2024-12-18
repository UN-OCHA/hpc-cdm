import { C, CLASSES, combineClasses, type Message } from '@unocha/hpc-ui';
import { useState } from 'react';
import { useLocation } from 'react-router';
import tw from 'twin.macro';
import { t } from '../../../i18n';
import FilterFlowsTable, {
  FLOWS_FILTER_INITIAL_VALUES,
} from '../../components/filters/filter-flows-table';
import PageMeta from '../../components/page-meta';
import FlowsTable, {
  type FlowsTableProps,
} from '../../components/tables/flows-table';
import { AppContext } from '../../context';
import { FLOW_PARAMS_CODEC } from '../../utils/codecs';
import {
  DEFAULT_FLOW_TABLE_HEADERS,
  encodeTableHeaders,
} from '../../utils/table-headers';
import useQueryParams from '../../utils/useQueryParams';

interface Props {
  className?: string;
}

const Container = tw.div`
  flex
`;
const LandingContainer = tw.div`
  w-full
  overflow-x-clip
  h-full
`;
export default (props: Props) => {
  const rowsPerPageOptions = [10, 25, 50, 100];

  const state: { successMessage?: string } | undefined = useLocation().state;
  const [messages, setMessages] = useState<Message[]>([
    ...(state?.successMessage
      ? [
          {
            message: state.successMessage,
            severity: 'success',
            key: Date.now(),
          } satisfies Message,
        ]
      : []),
  ]);

  const [query, setQuery] = useQueryParams({
    codec: FLOW_PARAMS_CODEC,
    initialValues: {
      page: 0,
      rowsPerPage: 50,
      orderBy: 'flow.updatedAt',
      orderDir: 'DESC',
      filters: JSON.stringify({}),
      tableHeaders: encodeTableHeaders([]), // Default value of table headers
    },
  });

  const flowsTableProps: FlowsTableProps = {
    headers: DEFAULT_FLOW_TABLE_HEADERS,
    rowsPerPageOptions,
    initialValues: FLOWS_FILTER_INITIAL_VALUES,
    query,
    setQuery,
    setMessages,
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <FilterFlowsTable setQuery={setQuery} query={query} />
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.flows.title)}
              </C.PageTitle>
              <FlowsTable {...flowsTableProps} />
            </LandingContainer>
          </Container>
          <C.MessageAlert setMessages={setMessages} messages={messages} />
        </div>
      )}
    </AppContext.Consumer>
  );
};
