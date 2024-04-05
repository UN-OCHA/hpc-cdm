import {
  Alert,
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
import { categories } from '@unocha/hpc-data';
import { C, CLASSES, dataLoader } from '@unocha/hpc-ui';
import SettingsIcon from '@mui/icons-material/Settings';
import { LanguageKey, t } from '../../../i18n';
import { AppContext, getEnv } from '../../context';
import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import * as paths from '../../paths';

import {
  KeywordHeaderID,
  TableHeadersProps,
  decodeTableHeaders,
  encodeTableHeaders,
  isCompatibleTableHeaderType,
  isTableHeadersPropsKeyword,
} from '../../utils/table-headers';

import {
  ChipDiv,
  Query,
  StyledLoader,
  TableHeaderButton,
  TopRowContainer,
  handleTableSettingsInfoClose,
} from './table-utils';
import tw from 'twin.macro';

import { Form, Formik } from 'formik';
import { util } from '@unocha/hpc-core';
import { LocalStorageSchema } from '../../utils/local-storage-type';

export type KeywordQuery = {
  orderBy: string;
  orderDir: string;
  tableHeaders: string;
};
export interface KeywordTableProps {
  headers: TableHeadersProps<KeywordHeaderID>[];
  query: KeywordQuery;
  setQuery: (newQuery: KeywordQuery) => void;
}

/** Function for frontend data sorting */
function by<T>(
  property: keyof T,
  order: 'ASC' | 'DESC' = 'ASC',
  isNumber?: boolean
): (a: T, b: T) => number {
  return (a, b) => {
    const x = isNumber ? parseInt(a[property] as string) : a[property];
    const y = isNumber ? parseInt(b[property] as string) : b[property];
    if (x > y) {
      if (order === 'ASC') {
        return 1;
      } else {
        return -1;
      }
    } else if (x < y) {
      if (order === 'ASC') {
        return -1;
      } else {
        return 1;
      }
    }
    return 0;
  };
}

function typeQuery(value: string): keyof categories.Keyword {
  if (value === 'keyword.id') {
    return 'id';
  } else if (value === 'keyword.relatedFlows') {
    return 'refCount';
  } else {
    return 'name';
  }
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
  const env = getEnv();
  const [isEdit, setEdit] = useState(false);

  return (
    <IconContainer>
      {!isEdit ? (
        <>
          {row.name}
          <Tooltip title="Edit">
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
            const modfiedKeyword: categories.Keyword = {
              ...row,
              name: values.keyword,
              description: values.public ? 'public' : null,
            };
            env.model.categories
              .updateKeyword(modfiedKeyword)
              .then(() => setEntityEdited(!entityEdited))
              .catch((err) => console.error(err)); //  TODO: Propperly handle this error
            setEdit(false);
          }}
        >
          <StyledForm>
            <FieldsWrapper>
              <C.TextFieldWrapper name="keyword" label="New name" />
              <C.Switch name="public" label="public" />
            </FieldsWrapper>
            <C.ButtonSubmit color="primary" text="Save" />
            <Tooltip title="Cancel">
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
        redirectAfterFetch={paths.keywords()}
        tooltipText="Delete"
        iconSx={keywordIconSize}
      />
    </IconContainer>
  );
};

export default function KeywordTable(props: KeywordTableProps) {
  const env = getEnv();

  const [query, setQuery] = [props.query, props.setQuery];
  const [openSettings, setOpenSettings] = useState(false);
  const [entityEdited, setEntityEdited] = useState(false);
  const state = dataLoader([entityEdited], () =>
    env.model.categories.getKeywords()
  );
  const [tableInfoDisplay, setTableInfoDisplay] = useState(
    util.getLocalStorageItem<LocalStorageSchema>('tableSettings', true)
  );

  const handleSort = (newSort: KeywordHeaderID) => {
    const changeDir = newSort === query.orderBy;

    if (changeDir) {
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
                          entityEdited={entityEdited}
                          setEntityEdited={setEntityEdited}
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
                        {
                          row.description === 'public'
                            ? 'Yes'
                            : '--' /** TODO: Propperly implement this field instead of just putting Yes or --. */
                        }
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
            <>
              <ChipDiv>
                <TopRowContainer>
                  <TableHeaderButton
                    size="small"
                    onClick={() => setOpenSettings(!openSettings)}
                  >
                    <SettingsIcon />
                  </TableHeaderButton>
                  <Modal
                    open={openSettings}
                    onClose={() => setOpenSettings(!openSettings)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        maxHeight: '70vh',
                        overflowY: 'scroll',
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
                          query as Query,
                          setQuery
                        )}
                        onClick={(element) => {
                          if (isCompatibleTableHeaderType(element)) {
                            setQuery({
                              ...query,
                              tableHeaders: encodeTableHeaders(
                                element,
                                'keywords',
                                query as Query,
                                setQuery
                              ),
                            });
                            setOpenSettings(false);
                          }
                        }}
                        elevation={6}
                        sx={{
                          width: '400px',
                          height: 'fit-content',
                        }}
                        children={
                          <Alert
                            severity="info"
                            onClose={() =>
                              handleTableSettingsInfoClose(setTableInfoDisplay)
                            }
                            sx={{
                              display: tableInfoDisplay ? 'flex' : 'none',
                              ...tw`mx-8 mt-4`,
                            }}
                          >
                            {t.t(
                              lang,
                              (s) =>
                                s.components.organizationTable.tableSettings
                                  .info
                            )}
                          </Alert>
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
            </>
          )}
        </StyledLoader>
      )}
    </AppContext.Consumer>
  );
}
