import {
  Alert,
  Box,
  Chip,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { flows, organizations } from '@unocha/hpc-data';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import { MdInfoOutline } from 'react-icons/md';
import SettingsIcon from '@mui/icons-material/Settings';
import { LanguageKey, t } from '../../i18n';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import React, { useEffect, useState } from 'react';
import { FlowsFilterValues } from './filter-flows-table';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DownloadIcon from '@mui/icons-material/Download';
import _ from 'lodash';
import {
  decodeFilters,
  encodeFilters,
  parseFormFiltersRebuilt,
  parseFlowFilters,
} from '../utils/parse-filters';
import { FLOWS_FILTER_INITIAL_VALUES } from '../components/filter-flows-table';
import { Form, Formik } from 'formik';
import { PendingFlowsFilterValues } from './filter-pending-flows-table';
import EllipsisText from '../utils/ellipsis-text';
import {
  FlowHeaderID,
  OrganizationHeaderID,
  TableHeadersProps,
  decodeTableHeaders,
  encodeTableHeaders,
} from '../utils/table-headers';
import { Strings } from '../../i18n/iface';
import { util } from '@unocha/hpc-core';
import {
  InfoSettings,
  LocalStorageFTSAdminKey,
} from '../utils/local-storage-type';
import { downloadExcel } from '../utils/download-excel';
import { parseUpdatedCreatedBy } from '../utils/map-functions';

export type Query = {
  page: number;
  rowsPerPage: number;
  orderBy: string;
  orderDir: string;
  filters: string;
  tableHeaders: string;
};
export interface OrganizationTableProps {
  headers: TableHeadersProps<OrganizationHeaderID>[];
  initialValues: FlowsFilterValues | PendingFlowsFilterValues;
  flowList?: flows.FlowList;
  graphQL?: boolean;
  rowsPerPageOption: number[];
  query: Query;
  setQuery: (newQuery: Query) => void;
}
const StyledLoader = tw(C.Loader)`
    mx-auto
    `;
const ChipDiv = tw.div`
  relative
  w-full
  `;
const TopRowContainer = tw.div`
  flex
  justify-end
  `;
const TableHeaderButton = tw(IconButton)`
  h-min
  self-center
  mx-2
  `;
const ChipFilterValues = tw.div`
  bg-unocha-secondary-light
  inline-flex
  mx-1
  px-2
  rounded-full
  `;

export interface ActiveFilter {
  label: keyof Strings['components']['flowsFilter']['filters'];
  fieldName: keyof FlowsFilterValues;
  displayValue: string;
  value: string | boolean | { label: string; id: string }[] | undefined;
}
export default function OrganizationTable(props: OrganizationTableProps) {
  const env = getEnv();
  let firstRender = true;
  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = props.rowsPerPageOption;
  /* const filters = decodeFilters(props.query.filters, props.initialValues);
  const attributes = parseFormFilters(filters); */
  const [query, setQuery] = [props.query, props.setQuery];
  const [openSettings, setOpenSettings] = useState(false);

  const [state, load] = useDataLoader([query], () =>
    env.model.organizations.searchOrganizations({
      search: {
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
      },
    })
  );

  useEffect(() => {
    if (!firstRender) {
      load();
    } else {
      firstRender = false;
    }
  }, [query.filters]);

  /* const handleChipDelete = (fieldName: keyof FlowsFilterValues) => {
    activeFormValues[fieldName] = undefined;
    setQuery({ ...query, page: 0, filters: encodeFilters(activeFormValues) });
  }; */

  const handleChangePage = (event: unknown, newPage: number) => {
    setQuery({
      ...query,
      page: newPage,
    });
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuery({
      ...query,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const handleSort = (newSort: OrganizationHeaderID) => {
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
    data: organizations.SearchOrnganizationResult;
  }) => {
    return (
      <>
        {data.organizations.map((row) => (
          <TableRow key={`${row.id}`}>
            {decodeTableHeaders(query.tableHeaders, lang, 'organizations').map(
              (column) => {
                if (!column.active) {
                  return;
                }
                switch (column.identifierID) {
                  case 'organization.id':
                    return (
                      <TableCell
                        key={`${row.id}_organization.id`}
                        size="small"
                        component="th"
                        scope="row"
                        data-test="organization-table-id"
                      >
                        {row.id}
                      </TableCell>
                    );
                  case 'organization.name':
                    return (
                      <TableCell
                        key={`${row.id}_organization.name`}
                        component="th"
                        size="small"
                        scope="row"
                        data-test="organization-table-name"
                      >
                        {row.name}
                      </TableCell>
                    );
                  case 'organization.abbreviation':
                    return (
                      <TableCell
                        key={`${row.id}_organization.abbreviation`}
                        size="small"
                        data-test="organization-table-abbreviation"
                      >
                        {row.abbreviation}
                      </TableCell>
                    );
                  case 'organization.type':
                    return (
                      <TableCell
                        key={`${row.id}_organization.type`}
                        size="small"
                        data-test="organization-table-type"
                      >
                        {(() => {
                          const res = row.categories.filter(
                            (cat) =>
                              cat.group === 'organizationType' &&
                              cat.parentID === null &&
                              cat.name
                          );
                          return res.length > 0 ? res.map((x) => x.name) : '--';
                        })()}
                      </TableCell>
                    );
                  case 'organization.subType':
                    return (
                      <TableCell
                        key={`${row.id}_organization.subType`}
                        size="small"
                        data-test="organization-table-subType"
                      >
                        {(() => {
                          const res = row.categories.filter(
                            (cat) =>
                              cat.group === 'organizationType' &&
                              cat.parentID !== null &&
                              cat.name
                          );
                          return res.length > 0 ? res.map((x) => x.name) : '--';
                        })()}
                      </TableCell>
                    );
                  case 'organization.location':
                    return (
                      <TableCell
                        key={`${row.id}_organization.location`}
                        size="small"
                        data-test="organization-table-location"
                      >
                        {row.locations.length > 0
                          ? row.locations.map((x) => x.name)
                          : '--'}
                      </TableCell>
                    );
                  case 'organization.createdBy':
                    return (
                      <TableCell
                        key={`${row.id}_organization.createdBy`}
                        size="small"
                        data-test="organization-table-created-by"
                      >
                        {parseUpdatedCreatedBy(row.create, lang)}
                        {}
                      </TableCell>
                    );
                  case 'organization.updatedBy':
                    return (
                      <TableCell
                        key={`${row.id}_organization.updatedBy`}
                        size="small"
                        data-test="organization-table-updated-by"
                      >
                        {parseUpdatedCreatedBy(row.update, lang)}
                      </TableCell>
                    );
                  default:
                    return null;
                }
              }
            )}
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
    data: organizations.SearchOrnganizationResult;
  }) => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {(
              decodeTableHeaders(
                query.tableHeaders,
                lang,
                'organizations'
              ) as TableHeadersProps<OrganizationHeaderID>[]
            ).map((header) => {
              if (!header.active) {
                return;
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
                        (s) =>
                          s.components.organizationTable.headers[header.label]
                      )}
                    </TableSortLabel>
                  ) : (
                    t.t(
                      lang,
                      (s) =>
                        s.components.organizationTable.headers[header.label]
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
  const CustomTable = ({
    lang,
    data,
  }: {
    lang: LanguageKey;
    data: organizations.SearchOrnganizationResult;
  }) => {
    return <TableComponent lang={lang} data={data} />;
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
                {/*  {attributes.map((activeFilter) => (
                  <Tooltip
                    key={activeFilter.fieldName}
                    title={
                      <div style={{ textAlign: 'start', width: 'auto' }}>
                        {activeFilter.displayValue
                          .split('<||>')
                          .map((filter) => (
                            <li
                              key={filter}
                              style={{
                                textAlign: 'start',
                                marginTop: '0',
                                marginBottom: '0',
                                listStyle:
                                  activeFilter.displayValue.split('<||>')
                                    .length > 1
                                    ? 'inherit'
                                    : 'none',
                              }}
                            >
                              {filter}
                            </li>
                          ))}
                      </div>
                    }
                  >
                    <Chip
                      key={`chip_${activeFilter.fieldName}`}
                      sx={{
                        ...chipSpacing,
                        position: 'relative',
                      }}
                      label={
                        <div>
                          <span>
                            {t.t(
                              lang,
                              (s) =>
                                s.components.flowsFilter.filters[
                                  activeFilter.label
                                ]
                            )}
                            :
                          </span>
                          <div
                            style={{
                              display: 'inline-block',
                              maxWidth: '1000px',
                            }}
                          >
                            {activeFilter.displayValue
                              .split('<||>')
                              .map((filter, index) => (
                                <ChipFilterValues key={index}>
                                  <EllipsisText maxWidth={400}>
                                    {/\[(.*)\]/.test(filter) // We do this in order to shorten organization names
                                      ? filter.match(/\[(.*)\]/)?.[1]
                                      : filter}
                                  </EllipsisText>
                                </ChipFilterValues>
                              ))}
                          </div>
                        </div>
                      }
                      size="small"
                      color="primary"
                      onDelete={() =>
                        handleChipDelete(
                          activeFilter.fieldName as keyof FlowsFilterValues
                        )
                      }
                      deleteIcon={<CancelRoundedIcon sx={tw`-ms-1! me-1!`} />}
                    />
                  </Tooltip>
                ))} */}
                <TopRowContainer>
                  <C.AsyncIconButton
                    fnPromise={() =>
                      downloadExcel<organizations.SearchOrganiation>(
                        data.organizations,
                        'export'
                      )
                    }
                    IconComponent={DownloadIcon}
                  />
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
                          'organizations',
                          setQuery,
                          query
                        )}
                        onClick={(element) =>
                          setQuery({
                            ...query,
                            tableHeaders: encodeTableHeaders(
                              element as any, // TO DO: remove any
                              'organizations',
                              setQuery,
                              query
                            ),
                          })
                        }
                        elevation={6}
                        sx={{
                          width: '400px',
                          height: 'fit-content',
                        }}
                        /*  children={
                          <Alert
                            severity="info"
                            onClose={handleTableSettingsInfoClose}
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
                        } */
                      />
                    </Box>
                  </Modal>
                  <TablePagination
                    sx={{ display: 'block' }}
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={parseInt(data.count)}
                    rowsPerPage={query.rowsPerPage}
                    page={query.page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
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
                  <CustomTable lang={lang} data={data} />
                </TableContainer>
              </Box>
              <TablePagination
                sx={{ display: 'block' }}
                data-test="flows-table-pagination"
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={parseInt(data.count)}
                rowsPerPage={query.rowsPerPage}
                page={query.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </StyledLoader>
      )}
    </AppContext.Consumer>
  );
}
