import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { type categories, errors } from '@unocha/hpc-data';
import { C, CLASSES, type Message, useDataLoader } from '@unocha/hpc-ui';
import React, { createContext, useContext, useState } from 'react';
import { type LanguageKey, t } from '../../../i18n';
import { AppContext, getEnv } from '../../context';

import {
  decodeTableHeaders,
  encodeTableHeaders,
  isCompatibleTableHeaderType,
  isTableHeadersPropsKeyword,
  type KeywordHeaderID,
  type TableHeadersProps,
} from '../../utils/table-headers';

import tw from 'twin.macro';
import {
  ChipDiv,
  type KeywordQuery,
  type SetQuery,
  StyledLoader,
  TableHeaderButton,
  TopRowContainer,
} from './table-utils';

import { Form, Formik } from 'formik';
import InfoAlert from '../info-alert';
import MergeModal from '../merge-modal';

export interface KeywordTableProps {
  headers: Array<TableHeadersProps<KeywordHeaderID>>;
  query: KeywordQuery;
  setQuery: SetQuery<KeywordQuery>;
  abortSignal: AbortSignal;
}

/**
 * Data sorting utility method
 */
function by<T>(
  property: keyof T,
  order: 'ASC' | 'DESC' = 'ASC',
  isNumber?: boolean
): (a: T, b: T) => number {
  const isString = (value: unknown): value is string =>
    typeof value === 'string';

  return (a, b) => {
    const aProp = a[property];
    const x = isNumber && isString(aProp) ? parseInt(aProp) : aProp;
    const bProp = b[property];
    const y = isNumber && isString(bProp) ? parseInt(bProp) : bProp;

    if (x > y) {
      if (order === 'ASC') {
        return 1;
      }
      return -1;
    } else if (x < y) {
      if (order === 'ASC') {
        return -1;
      }
      return 1;
    }
    return 0;
  };
}

const parseError = (
  error: 'unknown' | 'duplicate' | 'conflict',
  lang: LanguageKey,
  errorValue?: string
) => {
  const translatedError = t.t(
    lang,
    (s) => {
      if (error !== 'conflict') {
        return s.components.keywordTable.errors[error];
      }
      return s.components.keywordTable.errors.unknown;
    },
    error === 'duplicate' && errorValue
      ? { keywordName: errorValue }
      : undefined
  );

  return translatedError;
};

function typeQuery(value: string): keyof categories.Keyword {
  if (value === 'keyword.id') {
    return 'id';
  } else if (value === 'keyword.relatedFlows') {
    return 'refCount';
  }
  return 'name';
}

const IconContainer = tw.div`
  flex
  items-center
  gap-x-2
`;

const StyledForm = tw(Form)`
  flex
  gap-x-4
  items-center
`;

const FieldsWrapper = tw.div`
  flex
  gap-x-8
`;
const KeywordTableContext = createContext<{
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  load?: () => void;
}>({});

type EditableRowProps = {
  lang: LanguageKey;
  row: categories.Keyword;
  entityEdited: boolean;
  setEntityEdited: React.Dispatch<React.SetStateAction<boolean>>;
};
const EditableRow = ({
  lang,
  row,
  setEntityEdited,
  entityEdited,
}: EditableRowProps) => {
  const keywordIconSize = tw`h-8 w-8`;
  const { setMessages, load } = useContext(KeywordTableContext);
  const env = getEnv();
  const [isEdit, setEdit] = useState(false);

  return (
    <IconContainer>
      {!isEdit ? (
        <>
          {row.name}
          <Tooltip
            title={t.t(lang, (s) => s.components.keywordTable.labels.edit)}
          >
            <IconButton size="small" onClick={() => setEdit(true)}>
              <EditIcon sx={keywordIconSize} />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Formik
          initialValues={{
            keyword: row.name,
            public: row.description === 'public',
          }}
          onSubmit={(values) => {
            const modifiedKeyword: categories.Keyword = {
              ...row,
              name: values.keyword,
              description: values.public ? 'public' : null,
            };
            env.model.categories
              .updateKeyword(modifiedKeyword)
              .then(() => {
                if (setMessages) {
                  setMessages((prev) => [
                    {
                      message: t.t(
                        lang,
                        (s) => s.components.keywordTable.success.update
                      ),
                      severity: 'success',
                      key: Date.now(),
                    } satisfies Message,
                    ...prev,
                  ]);
                }
                setEntityEdited(!entityEdited);
              })
              .catch((error) => {
                if (errors.isDuplicateError(error)) {
                  if (setMessages) {
                    setMessages((prev) => [
                      {
                        message: parseError(error.code, lang, error.value),
                        severity: 'error',
                        key: Date.now(),
                      } satisfies Message,
                      ...prev,
                    ]);
                  }
                } else if (setMessages) {
                  setMessages((prev) => [
                    {
                      message: parseError('unknown', lang),
                      severity: 'error',
                      key: Date.now(),
                    } satisfies Message,
                    ...prev,
                  ]);
                }
              });
            setEdit(false);
          }}
        >
          <StyledForm>
            <FieldsWrapper>
              <C.TextFieldWrapper
                name="keyword"
                label={t.t(
                  lang,
                  (s) => s.components.keywordTable.labels.newName
                )}
              />
              <C.Switch
                name="public"
                label={t.t(
                  lang,
                  (s) => s.components.keywordTable.labels.public
                )}
              />
            </FieldsWrapper>
            <C.ButtonSubmit
              color="primary"
              text={t.t(lang, (s) => s.components.keywordTable.labels.save)}
            />
            <Tooltip
              title={t.t(lang, (s) => s.components.keywordTable.labels.cancel)}
            >
              <IconButton size="small" onClick={() => setEdit(false)}>
                <CancelIcon sx={keywordIconSize} />
              </IconButton>
            </Tooltip>
          </StyledForm>
        </Formik>
      )}
      <C.AsyncIconButton
        fnPromise={() =>
          env.model.categories.deleteKeyword({
            id: row.id,
          })
        }
        IconComponent={DeleteIcon}
        confirmModal={t.get(lang, (s) => s.components.keywordTable.modal)}
        tooltipText={t.t(lang, (s) => s.components.keywordTable.labels.delete)}
        iconSx={keywordIconSize}
        onSuccess={() => {
          if (setMessages) {
            setMessages((prev) => [
              {
                message: t.t(
                  lang,
                  (s) => s.components.keywordTable.success.delete
                ),
                severity: 'success',
                key: Date.now(),
              } satisfies Message,
              ...prev,
            ]);
          }
          if (load) {
            load();
          }
        }}
      />
    </IconContainer>
  );
};

const KeywordTable = (props: KeywordTableProps) => {
  const env = getEnv();

  const [query, setQuery] = [props.query, props.setQuery];
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false);
  const [isEntityEdited, setIsEntityEdited] = useState(false);
  const [state, load] = useDataLoader([isEntityEdited], () =>
    env.model.categories.getKeywords(props.abortSignal)
  );
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSort = (newSort: KeywordHeaderID) => {
    const shouldChangeDir = newSort === query.orderBy;

    if (shouldChangeDir) {
      setQuery({
        ...query,
        orderDir: query.orderDir === 'ASC' ? 'DESC' : 'ASC',
      });
    } else {
      setQuery({
        ...query,
        orderBy: newSort,
        orderDir: 'DESC',
      });
    }
  };

  const TableRowsComponent = ({
    lang,
    data,
  }: {
    lang: LanguageKey;
    data: categories.GetKeywordsResult;
  }) => {
    const nonSafeTypedTableHeaders = decodeTableHeaders(
      query.tableHeaders,
      lang,
      'keywords'
    );
    const tableHeaders = isTableHeadersPropsKeyword(nonSafeTypedTableHeaders)
      ? nonSafeTypedTableHeaders
      : [];
    return (
      <>
        {data
          .sort(
            by(
              typeQuery(query.orderBy),
              query.orderDir as 'ASC' | 'DESC',
              typeQuery(query.orderBy) === 'refCount'
            )
          )
          .map((row) => (
            <TableRow key={`${row.id}`}>
              {tableHeaders.map((column) => {
                if (!column.active) {
                  return null;
                }
                switch (column.identifierID) {
                  case 'keyword.id':
                    return (
                      <TableCell
                        key={`${row.id}keyword.id`}
                        size="small"
                        component="th"
                        scope="row"
                        data-test="keyword-table-id"
                      >
                        {row.id}
                      </TableCell>
                    );
                  case 'keyword.name':
                    return (
                      <TableCell
                        key={`${row.id}keyword.name`}
                        component="th"
                        size="small"
                        scope="row"
                        data-test="keyword-table-name"
                      >
                        <EditableRow
                          lang={lang}
                          row={row}
                          entityEdited={isEntityEdited}
                          setEntityEdited={setIsEntityEdited}
                        />
                      </TableCell>
                    );
                  case 'keyword.relatedFlows':
                    return (
                      <TableCell
                        key={`${row.id}_keyword.relatedFlows`}
                        size="small"
                        data-test="_keyword-table-relatedFlows"
                      >
                        {row.refCount}
                      </TableCell>
                    );
                  case 'keyword.public':
                    return (
                      <TableCell
                        key={`${row.id}_keyword.public`}
                        size="small"
                        data-test="_keyword-table-public"
                      >
                        {row.description === 'public' ? <CheckIcon /> : '--'}
                      </TableCell>
                    );

                  default:
                    return null;
                }
              })}
            </TableRow>
          ))}
      </>
    );
  };
  const TableComponent = ({
    lang,
    data,
  }: {
    lang: LanguageKey;
    data: categories.GetKeywordsResult;
  }) => {
    const nonSafeTypedTableHeaders = decodeTableHeaders(
      query.tableHeaders,
      lang,
      'keywords'
    );
    const tableHeaders = isTableHeadersPropsKeyword(nonSafeTypedTableHeaders)
      ? nonSafeTypedTableHeaders
      : [];
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {tableHeaders.map((header) => {
              if (!header.active) {
                return null;
              }
              return (
                <TableCell
                  size="small"
                  key={`${header.identifierID}_${header.label}`}
                  data-test={`header-${header.label}`}
                  {...(header.sortable &&
                    query.orderBy === header.identifierID && {
                      'aria-sort':
                        query.orderDir === 'ASC' ? 'ascending' : 'descending',
                    })}
                >
                  {header.sortable ? (
                    <TableSortLabel
                      active={query.orderBy === header.identifierID}
                      direction={
                        (query.orderDir === 'ASC' ||
                          query.orderDir === 'DESC') &&
                        query.orderBy === header.identifierID
                          ? (query.orderDir.toLowerCase() as Lowercase<
                              typeof query.orderDir
                            >)
                          : 'desc'
                      }
                      onClick={() => handleSort(header.identifierID)}
                    >
                      <span className={CLASSES.VISUALLY_HIDDEN}>
                        {t.t(
                          lang,
                          (s) => s.components.organizationTable.sortBy
                        )}
                        <br />
                      </span>
                      {t.t(
                        lang,
                        (s) => s.components.keywordTable.headers[header.label]
                      )}
                    </TableSortLabel>
                  ) : (
                    t.t(
                      lang,
                      (s) => s.components.keywordTable.headers[header.label]
                    )
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRowsComponent lang={lang} data={data} />
        </TableBody>
        <TableFooter />
      </Table>
    );
  };

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <>
          <C.MessageAlert setMessages={setMessages} messages={messages} />
          <StyledLoader
            loader={state}
            strings={{
              ...t.get(lang, (s) => s.components.loader),
              notFound: {
                ...t.get(lang, (s) => s.components.notFound),
                ...t.get(lang, (s) => s.components.organizationTable.notFound),
              },
            }}
          >
            {(data) => (
              <KeywordTableContext.Provider value={{ setMessages, load }}>
                <ChipDiv>
                  <TopRowContainer>
                    <MergeModal
                      type="keyword"
                      setMessages={setMessages}
                      load={load}
                    />
                    <TableHeaderButton
                      size="small"
                      onClick={() => setShouldOpenSettings(!shouldOpenSettings)}
                    >
                      <SettingsIcon />
                    </TableHeaderButton>
                    <Modal
                      open={shouldOpenSettings}
                      onClose={() => setShouldOpenSettings(!shouldOpenSettings)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          maxHeight: '70vh',
                          overflowY: 'auto',
                          borderRadius: '10px',
                        }}
                      >
                        <C.DraggableList
                          title={t.t(
                            lang,
                            (s) =>
                              s.components.organizationTable.tableSettings.title
                          )}
                          buttonText={t.t(
                            lang,
                            (s) =>
                              s.components.organizationTable.tableSettings.save
                          )}
                          queryValues={decodeTableHeaders(
                            query.tableHeaders,
                            lang,
                            'keywords',
                            query,
                            setQuery
                          )}
                          onClick={(element) => {
                            if (isCompatibleTableHeaderType(element)) {
                              setQuery({
                                ...query,
                                tableHeaders: encodeTableHeaders(
                                  element,
                                  'keywords',
                                  query,
                                  setQuery
                                ),
                              });
                              setShouldOpenSettings(false);
                            }
                          }}
                          elevation={6}
                          sx={{
                            width: '400px',
                            height: 'fit-content',
                          }}
                          children={
                            <InfoAlert
                              text={t.t(
                                lang,
                                (s) =>
                                  s.components.flowsTable.tableSettings.info
                              )}
                              localStorageKey="tableSettings"
                              sxProps={tw`mx-8 mt-4`}
                            />
                          }
                        />
                      </Box>
                    </Modal>
                  </TopRowContainer>
                </ChipDiv>
                <Box sx={{ overflowX: 'auto', transform: 'rotateX(180deg)' }}>
                  <TableContainer
                    sx={{
                      width: '100%',
                      display: 'table',
                      transform: 'rotateX(180deg)',
                      tableLayout: 'fixed',
                      lineHeight: '1.35',
                      fontSize: '1.32rem',
                    }}
                  >
                    <TableComponent lang={lang} data={data} />
                  </TableContainer>
                </Box>
              </KeywordTableContext.Provider>
            )}
          </StyledLoader>
        </>
      )}
    </AppContext.Consumer>
  );
};

export default KeywordTable;
