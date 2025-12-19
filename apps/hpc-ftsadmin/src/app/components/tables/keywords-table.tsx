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
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { type categories, errors } from '@unocha/hpc-data';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import React, { createContext, useContext, useState } from 'react';
import { type LanguageKey, t } from '../../../i18n';
import { AppContext, getEnv } from '../../context';

import {
  decodeTableHeaders,
  encodeTableHeaders,
  getDraggableTableHeaders,
  isCompatibleTableHeaderType,
  type KeywordHeaderID,
  type TableHeadersProps,
} from '../../utils/table-headers';

import tw from 'twin.macro';
import {
  ChipDiv,
  type KeywordQuery,
  type SetQuery,
  StickyTableHead,
  StyledLoader,
  TableHeaderButton,
  TopRowContainer,
} from './table-utils';

import { Form, Formik } from 'formik';
import { toast } from 'react-toastify';
import {
  EMPTY_CELL,
  TOAST_CONFIG,
  TOAST_CONFIG_ERROR,
} from '../../utils/constants';
import InfoAlert from '../info-alert';
import MergeModal from '../merge-modal';

export interface KeywordTableProps {
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
      return order === 'ASC' ? 1 : -1;
    } else if (x < y) {
      return order === 'ASC' ? -1 : 1;
    }
    return 0;
  };
}

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
  load?: () => void;
}>({});

type EditableRowProps = {
  lang: LanguageKey;
  row: categories.Keyword;
  tableHeaders: Array<TableHeadersProps<'keywords'>>;
};
const EditableRow = ({ tableHeaders, lang, row }: EditableRowProps) => {
  const keywordIconSize = tw`h-8 w-8`;
  const { load } = useContext(KeywordTableContext);
  const env = getEnv();
  const [isEdit, setEdit] = useState(false);
  const [editableRow, setEditableRow] = useState(row);

  const handleRowEdit = (values: { keyword: string; public: boolean }) => {
    const modifiedKeyword: categories.Keyword = {
      ...editableRow,
      name: values.keyword,
      description: values.public ? 'public' : null,
    };
    env.model.categories
      .updateKeyword(modifiedKeyword)
      .then(() => {
        setEditableRow(modifiedKeyword);
        toast.success(
          t.t(lang, (s) => s.components.keywordsTable.success.update),
          TOAST_CONFIG
        );
      })
      .catch((error) => {
        if (errors.isConflictError(error)) {
          toast.error(
            t.t(lang, (s) => s.components.keywordsTable.errors.conflict, {
              keywordName: modifiedKeyword.name,
            }),
            TOAST_CONFIG_ERROR
          );
        } else {
          toast.error(
            t.t(lang, (s) => s.components.keywordsTable.errors.unknown),
            TOAST_CONFIG_ERROR
          );
        }
      });
    setEdit(false);
  };

  return (
    <TableRow>
      {tableHeaders.map((column) => {
        if (!column.isActive) {
          return null;
        }
        switch (column.identifierID) {
          case 'keyword.id':
            return (
              <TableCell
                key={`${editableRow.id}keyword.id`}
                size="small"
                component="th"
                scope="row"
                data-test="keyword-table-id"
              >
                {editableRow.id}
              </TableCell>
            );
          case 'keyword.name':
            return (
              <TableCell
                key={`${editableRow.id}keyword.name`}
                component="th"
                size="small"
                scope="row"
                data-test="keyword-table-name"
              >
                <IconContainer>
                  {!isEdit ? (
                    <>
                      {editableRow.name}
                      <Tooltip
                        title={t.t(
                          lang,
                          (s) => s.components.keywordsTable.labels.edit
                        )}
                      >
                        <IconButton size="small" onClick={() => setEdit(true)}>
                          <EditIcon sx={keywordIconSize} />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Formik
                      initialValues={{
                        keyword: editableRow.name,
                        public: editableRow.description === 'public',
                      }}
                      onSubmit={handleRowEdit}
                    >
                      <StyledForm>
                        <FieldsWrapper>
                          <C.TextFieldWrapper
                            name="keyword"
                            label={t.t(
                              lang,
                              (s) => s.components.keywordsTable.labels.newName
                            )}
                          />
                          <C.Switch
                            name="public"
                            label={t.t(
                              lang,
                              (s) => s.components.keywordsTable.labels.public
                            )}
                          />
                        </FieldsWrapper>
                        <C.ButtonSubmit
                          color="primary"
                          text={t.t(
                            lang,
                            (s) => s.components.keywordsTable.labels.save
                          )}
                        />
                        <Tooltip
                          title={t.t(
                            lang,
                            (s) => s.components.keywordsTable.labels.cancel
                          )}
                        >
                          <IconButton
                            size="small"
                            onClick={() => setEdit(false)}
                          >
                            <CancelIcon sx={keywordIconSize} />
                          </IconButton>
                        </Tooltip>
                      </StyledForm>
                    </Formik>
                  )}
                  <C.AsyncIconButton
                    fnPromise={() =>
                      env.model.categories.deleteKeyword({
                        id: editableRow.id,
                      })
                    }
                    IconComponent={DeleteIcon}
                    confirmModal={t.get(
                      lang,
                      (s) => s.components.keywordsTable.modal
                    )}
                    tooltipText={t.t(
                      lang,
                      (s) => s.components.keywordsTable.labels.delete
                    )}
                    iconSx={keywordIconSize}
                    onSuccess={() => {
                      toast.success(
                        t.t(
                          lang,
                          (s) => s.components.keywordsTable.success.delete
                        ),
                        TOAST_CONFIG
                      );
                      if (load) {
                        load();
                      }
                    }}
                  />
                </IconContainer>
              </TableCell>
            );
          case 'keyword.relatedFlows':
            return (
              <TableCell
                key={`${editableRow.id}_keyword.relatedFlows`}
                size="small"
                data-test="_keyword-table-relatedFlows"
              >
                {editableRow.refCount}
              </TableCell>
            );
          case 'keyword.public':
            return (
              <TableCell
                key={`${editableRow.id}_keyword.public`}
                size="small"
                data-test="_keyword-table-public"
              >
                {editableRow.description === 'public' ? (
                  <CheckIcon />
                ) : (
                  EMPTY_CELL
                )}
              </TableCell>
            );

          default:
            return null;
        }
      })}
    </TableRow>
  );
};

const KeywordTable = (props: KeywordTableProps) => {
  const env = getEnv();

  const [query, setQuery] = [props.query, props.setQuery];
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false);
  const [state, load] = useDataLoader([], () =>
    env.model.categories.getKeywords(props.abortSignal)
  );

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
    const tableHeaders = decodeTableHeaders({
      queryParam: query.tableHeaders,
      lang,
      table: 'keywords',
    });
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
            <React.Fragment key={row.id}>
              <EditableRow {...{ tableHeaders, lang, row }} />
            </React.Fragment>
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
    const tableHeaders = decodeTableHeaders({
      queryParam: query.tableHeaders,
      lang,
      table: 'keywords',
    });
    return (
      <Table size="small">
        <StickyTableHead>
          <TableRow>
            {tableHeaders.map((header) => {
              if (!header.isActive) {
                return null;
              }
              return (
                <TableCell
                  size="small"
                  key={`${header.identifierID}_${header.label}`}
                  data-test={`keywords-table-header-${header.label}`}
                  {...(header.isSortable &&
                    query.orderBy === header.identifierID && {
                      'aria-sort':
                        query.orderDir === 'ASC' ? 'ascending' : 'descending',
                    })}
                >
                  {header.isSortable ? (
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
                          (s) => s.components.organizationsTable.sortBy
                        )}
                        <br />
                      </span>
                      {t.t(
                        lang,
                        (s) => s.components.keywordsTable.headers[header.label]
                      )}
                    </TableSortLabel>
                  ) : (
                    t.t(
                      lang,
                      (s) => s.components.keywordsTable.headers[header.label]
                    )
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </StickyTableHead>
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
        <StyledLoader
          loader={state}
          strings={{
            ...t.get(lang, (s) => s.components.loader),
            notFound: {
              ...t.get(lang, (s) => s.components.notFound),
              ...t.get(lang, (s) => s.components.organizationsTable.notFound),
            },
          }}
        >
          {(data) => (
            <KeywordTableContext.Provider value={{ load }}>
              <ChipDiv>
                <TopRowContainer>
                  <MergeModal type="keyword" load={load} />
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
                            s.components.organizationsTable.tableSettings.title
                        )}
                        buttonText={t.t(
                          lang,
                          (s) =>
                            s.components.organizationsTable.tableSettings.save
                        )}
                        queryValues={getDraggableTableHeaders({
                          queryParam: query.tableHeaders,
                          lang,
                          table: 'keywords',
                          query,
                          setQuery,
                        })}
                        onClick={(element) => {
                          if (isCompatibleTableHeaderType(element)) {
                            setQuery({
                              ...query,
                              tableHeaders: encodeTableHeaders({
                                headers: element,
                                table: 'keywords',
                                query,
                                setQuery,
                              }),
                            });
                            setShouldOpenSettings(false);
                          }
                        }}
                        setOpenSettings={setShouldOpenSettings}
                        elevation={6}
                        sx={{
                          width: '400px',
                          height: 'fit-content',
                        }}
                        children={
                          <InfoAlert
                            text={t.t(
                              lang,
                              (s) => s.components.flowsTable.tableSettings.info
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
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer
                  sx={{
                    width: '100%',
                    display: 'table',
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
      )}
    </AppContext.Consumer>
  );
};

export default KeywordTable;
