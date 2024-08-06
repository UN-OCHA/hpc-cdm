import { C, CLASSES, combineClasses } from '@unocha/hpc-ui';
import { t } from '../../../i18n';
import PageMeta from '../../components/page-meta';
import { AppContext } from '../../context';
import tw from 'twin.macro';
import {
  DEFAULT_KEYWORD_TABLE_HEADERS,
  encodeTableHeaders,
} from '../../utils/table-headers';
import KeywordTable, {
  KeywordTableProps,
} from '../../components/tables/keywords-table';
import useQueryParams from '../../utils/useQueryParams';
import { KEYWORD_PARAMS_CODEC } from '../../utils/codecs';
import { useCallback, useEffect, useState } from 'react';

interface Props {
  className?: string;
}

const Container = tw.div`
  flex
`;
const LandingContainer = tw.div`
  w-full
`;
export default (props: Props) => {
  const [query, setQuery] = useQueryParams({
    codec: KEYWORD_PARAMS_CODEC,
    initialValues: {
      orderBy: 'keyword.name',
      orderDir: 'ASC',
      tableHeaders: encodeTableHeaders([], 'keywords'),
    },
  });

  const [abortController, setAbortController] = useState<AbortController>(
    new AbortController()
  );
  const handleAbortController = useCallback(() => {
    // Abort the ongoing requests
    abortController.abort();

    // Create a new AbortController for the next requests
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    // Perform actions with the updated filter values

    // Pass the new AbortSignal to FlowsTableGraphQL
    // This can be part of your state or directly passed as a prop
  }, [abortController]);

  useEffect(() => {
    return () => {
      handleAbortController();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keywordTableProps: KeywordTableProps = {
    headers: DEFAULT_KEYWORD_TABLE_HEADERS,
    query,
    setQuery,
    abortSignal: abortController.signal,
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <div
          className={combineClasses(CLASSES.CONTAINER.FLUID, props.className)}
        >
          <PageMeta title={[t.t(lang, (s) => s.routes.flows.title)]} />
          <Container>
            <LandingContainer>
              <C.PageTitle>
                {t.t(lang, (s) => s.routes.keywords.title)}
              </C.PageTitle>
              <KeywordTable {...keywordTableProps} />
            </LandingContainer>
          </Container>
        </div>
      )}
    </AppContext.Consumer>
  );
};
