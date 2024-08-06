import {
  Box,
  Chip,
  IconButton,
  Modal,
  Portal,
  Snackbar,
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
import { flows } from '@unocha/hpc-data';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import { MdInfoOutline } from 'react-icons/md';
import SettingsIcon from '@mui/icons-material/Settings';
import { LanguageKey, t } from '../../../i18n';
import { getContext } from '../../context';
import tw from 'twin.macro';
import React, { useState } from 'react';
import {
  decodeFilters,
  encodeFilters,
  parseFormFilters,
  parseFlowFilters,
  isKey,
  FilterKey,
} from '../../utils/parse-filters';
import { Form, Formik } from 'formik';
import { PendingFlowsFilterValues } from '../filters/filter-pending-flows-table';
import {
  FlowHeaderID,
  TableHeadersProps,
  decodeTableHeaders,
  encodeTableHeaders,
  isCompatibleTableHeaderType,
  isTableHeadersPropsFlow,
} from '../../utils/table-headers';
import { downloadExcel } from '../../utils/download-excel';
import DownloadIcon from '@mui/icons-material/Download';
import {
  ChipDiv,
  Query,
  RenderChipsRow,
  StyledLoader,
  TableHeaderButton,
  TableRowClick,
  TopRowContainer,
} from './table-utils';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../paths';
import { util } from '@unocha/hpc-core';
import {
  FLOWS_FILTER_INITIAL_VALUES,
  FlowsFilterValues,
} from '../filters/filter-flows-table';
import NoResultTable from './no-result';
import InfoAlert from '../info-alert';

export interface FlowsTableProps {
  headers: TableHeadersProps<FlowHeaderID>[];
  initialValues: FlowsFilterValues | PendingFlowsFilterValues;
  rowsPerPageOption: number[];
  query: Query;
  setQuery: (newQuery: Query) => void;
  pending?: boolean;
}

export default function FlowsTable(props: FlowsTableProps) {
  const { env, lang } = getContext();
  const environment = env();

  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = props.rowsPerPageOption;
  const filters = decodeFilters(props.query.filters, props.initialValues);
  const tableFilters = parseFormFilters(filters, props.initialValues);
  const parsedFilters = parseFlowFilters(tableFilters, props.pending);
  const [query, setQuery] = [props.query, props.setQuery];
  const [openSettings, setOpenSettings] = useState(false);
  const [errorBulkUpdate, setErrorBulkUpdate] = useState<string>();
  const [successBulkUpdate, setSuccessBulkUpdate] = useState<string>();
  const navigate = useNavigate();
  const [state, load] = useDataLoader([query], () =>
    environment.model.flows.searchFlows({
      limit: query.rowsPerPage,
      sortField: query.orderBy,
      sortOrder: query.orderDir,
      ...parsedFilters,
      prevPageCursor: query.prevPageCursor,
      nextPageCursor: query.nextPageCursor,
    })
  );

  const nonSafeTypedTableHeaders = decodeTableHeaders(query.tableHeaders, lang);
  const tableHeaders = isTableHeadersPropsFlow(nonSafeTypedTableHeaders)
    ? nonSafeTypedTableHeaders
    : [];
  const handleChipDelete = <T extends FilterKey>(fieldName: T) => {
    if (isKey(filters, fieldName)) {
      filters[fieldName] = undefined;
      setQuery({
        ...query,
        page: 0,
        filters: encodeFilters(filters, props.initialValues),
      });
    }
  };

  const handleChangePage = (
    newPage: number,
    prevPageCursor: number,
    nextPageCursor: number
  ) => {
    if (newPage > props.query.page) {
      setQuery({
        ...query,
        prevPageCursor: undefined,
        nextPageCursor: nextPageCursor,
        page: newPage,
      });
    } else {
      setQuery({
        ...query,
        prevPageCursor: prevPageCursor,
        nextPageCursor: undefined,
        page: newPage,
      });
    }
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

  const handleSort = (newSort: FlowHeaderID) => {
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

  const renderReportDetail = (
    org: flows.FlowOrganization,
    row: flows.Flow,
    lang: LanguageKey
  ) => {
    const rd =
      row.reportDetails &&
      row.reportDetails.filter((rd) => rd.organizationID === org.id);
    return (
      rd &&
      rd.length > 0 &&
      rd[0].channel &&
      rd[0].date && (
        <Tooltip
          title={t
            .t(lang, (s) => s.components.flowsTable.reportTooltip)
            .replace('{organization}', org.name)
            .replace(
              '{date}',
              Intl.DateTimeFormat('en-GB').format(new Date(rd[0].date))
            )
            .replace('{channel}', rd[0].channel)}
        >
          <IconButton size="small">
            <MdInfoOutline />
          </IconButton>
        </Tooltip>
      )
    );
  };
  const TableRowsComponent = ({
    lang,
    data,
  }: {
    lang: LanguageKey;
    data: flows.SearchFlowsResult;
  }) => {
    const [selectedRows, setSelectedRows] = useState<
      { id: number; versionID: number }[]
    >([]);
    const nonSafeTypedTableHeaders = decodeTableHeaders(
      query.tableHeaders,
      lang
    );
    const tableHeaders = isTableHeadersPropsFlow(nonSafeTypedTableHeaders)
      ? nonSafeTypedTableHeaders
      : [];
    const handleCheckboxChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      row: flows.Flow
    ) => {
      const isChecked = event.target.checked;
      if (isChecked) {
        const addedRow = [
          ...selectedRows,
          { id: row.id, versionID: row.versionID },
        ];
        setSelectedRows(addedRow);
        return addedRow;
      } else {
        const filteredRows = selectedRows.filter(
          (selectedRow) => selectedRow.id !== row.id
        );
        setSelectedRows(filteredRows);
        return filteredRows;
      }
    };
    return (
      <>
        {data.searchFlows.flows.map((row) => (
          <TableRowClick
            onClick={() => navigate(paths.flow(row.id))}
            key={`${row.id}v${row.versionID}`}
            sx={{
              backgroundColor: selectedRows.map((x) => x.id).includes(row.id)
                ? tw`bg-unocha-primary bg-opacity-10`
                : undefined,
            }}
          >
            {props.pending && (
              <TableCell
                size="small"
                component="th"
                scope="row"
                data-test="flows-table-checkbox"
                onClick={(e) => e.stopPropagation()}
              >
                <C.CheckBox
                  name="flows"
                  value={{
                    id: row.id,
                    versionID: row.versionID,
                  }}
                  onChange={(event) => handleCheckboxChange(event, row)}
                />
              </TableCell>
            )}
            {tableHeaders.map((column) => {
              if (!column.active) {
                return null;
              }
              switch (column.identifierID) {
                case 'flow.id':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.id`}
                      size="small"
                      component="th"
                      scope="row"
                      data-test="flows-table-id"
                    >
                      {row.id} v{row.versionID}
                    </TableCell>
                  );
                case 'flow.versionID':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.versionID`}
                      component="th"
                      size="small"
                      scope="row"
                      data-test="flows-table-status"
                    >
                      {t.t(lang, (s) =>
                        row.versionID > 1
                          ? s.components.flowsTable.update
                          : s.components.flowsTable.new
                      )}
                    </TableCell>
                  );
                case 'flow.updatedAt':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.updatedAt`}
                      size="small"
                      data-test="flows-table-updated"
                    >
                      {Intl.DateTimeFormat('en-GB').format(
                        new Date(row.updatedAt)
                      )}
                    </TableCell>
                  );
                case 'externalReference.systemID':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_externalReference.systemID`}
                      size="small"
                      data-test="flows-table-external-reference"
                    >
                      {row.externalReferences?.at(0)?.systemID || '--'}
                    </TableCell>
                  );
                case 'flow.amountUSD':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.amountUSD`}
                      size="small"
                      data-test="flows-table-amount-usd"
                    >
                      {parseInt(row.amountUSD) > 0
                        ? new Intl.NumberFormat(lang, {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(parseInt(row.amountUSD))
                        : row.origAmount && row.origCurrency
                        ? new Intl.NumberFormat(lang, {
                            style: 'currency',
                            currency: row.origCurrency,
                            maximumFractionDigits: 0,
                          }).format(parseInt(row.origAmount))
                        : '--'}
                    </TableCell>
                  );
                case 'organization.source.name':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_organization.source.name`}
                      size="small"
                      data-test="flows-table-source-organization"
                    >
                      {row.parkedParentSource &&
                        row.parkedParentSource.orgName.length > 0 && (
                          <>
                            <strong>
                              {t.t(
                                lang,
                                (s) => s.components.flowsTable.parkedSource
                              )}
                              :{' '}
                              {row.parkedParentSource.orgName.map(
                                (orgName) => orgName
                              )}
                            </strong>
                            <br />
                          </>
                        )}
                      {row.organizations &&
                        row.organizations
                          .filter((org) => org.direction === 'source')
                          .map((org, index) => (
                            <>
                              <Tooltip
                                title={org.name}
                                placement="top"
                                followCursor={true}
                              >
                                <span key={`source_${row.id}_${index}`}>
                                  {org.abbreviation}
                                </span>
                              </Tooltip>
                              {renderReportDetail(org, row, lang)}
                            </>
                          ))}
                    </TableCell>
                  );
                case 'organization.destination.name':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}organization.destination.name`}
                      size="small"
                      data-test="flows-table-destination-organization"
                    >
                      {row.organizations &&
                        row.organizations
                          .filter((org) => org.direction === 'destination')
                          .map((org, index) => (
                            <>
                              <Tooltip
                                title={org.name}
                                placement="top"
                                followCursor={true}
                              >
                                <span key={`destination_${row.id}_${index}`}>
                                  {org.abbreviation}
                                </span>
                              </Tooltip>
                              {renderReportDetail(org, row, lang)}
                            </>
                          ))}
                    </TableCell>
                  );
                case 'planVersion.destination.name':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}planVersion.destination.name`}
                      size="small"
                      data-test="flows-table-plans"
                    >
                      {row.plans?.length
                        ? row.plans
                            .filter((plan) => plan.direction === 'destination')
                            .map((plan) => plan.name)
                            .join(', ')
                        : '--'}
                    </TableCell>
                  );
                case 'location.destination.name':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}location.destination.name`}
                      size="small"
                      data-test="flows-table-locations"
                    >
                      {row.locations?.length
                        ? row.locations
                            .filter(
                              (location) => location.direction === 'destination'
                            )
                            .map((location) => location.name)
                            .join(', ')
                        : '--'}
                    </TableCell>
                  );
                case 'usageYear.destination.year':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_usageYear.destination.year`}
                      size="small"
                      data-test="flows-table-years"
                    >
                      {row.usageYears &&
                        row.usageYears
                          .filter((year) => year.direction === 'destination')
                          .map((year) => year.year)
                          .join(', ')}
                    </TableCell>
                  );
                case 'details':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_details`}
                      size="small"
                      data-test="flows-table-details"
                    >
                      {row.categories &&
                        row.categories
                          .filter((cat) => cat.group === 'flowStatus')
                          .map((cat, index) => (
                            <Chip
                              key={`category_${row.id}_${index}`}
                              sx={chipSpacing}
                              label={cat.name.toLowerCase()}
                              size="small"
                            />
                          ))}
                      {row.restricted && (
                        <Chip
                          label={[
                            t.t(
                              lang,
                              (s) => s.components.flowsTable.restricted
                            ),
                          ]}
                          sx={chipSpacing}
                          size="small"
                          color="secondary"
                        />
                      )}
                      {!row.activeStatus && (
                        <Chip
                          sx={chipSpacing}
                          label={[
                            t.t(lang, (s) => s.components.flowsTable.inactive),
                          ]}
                          size="small"
                        />
                      )}
                      {row.parentIDs && row.parentIDs.length > 0 && (
                        <Chip
                          sx={chipSpacing}
                          label={[
                            t.t(lang, (s) => s.components.flowsTable.child),
                          ]}
                          size="small"
                          color="primary"
                        />
                      )}
                      {row.childIDs && row.childIDs.length > 0 && (
                        <Chip
                          sx={chipSpacing}
                          label={[
                            t.t(lang, (s) => s.components.flowsTable.parent),
                          ]}
                          size="small"
                          color="primary"
                        />
                      )}
                    </TableCell>
                  );
                case 'flow.newMoney':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.newMoney`}
                      size="small"
                      data-test="flows-table-newMoney"
                    >
                      {(row.newMoney ?? '--').toString()}
                    </TableCell>
                  );
                case 'flow.decisionDate':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.decisionDate`}
                      size="small"
                      data-test="flows-table-decisionDate"
                    >
                      {row.decisionDate
                        ? Intl.DateTimeFormat('en-GB').format(
                            new Date(row.decisionDate)
                          )
                        : '--'}
                    </TableCell>
                  );
                case 'flow.exchangeRate':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.exchangeRate`}
                      size="small"
                      data-test="flows-table-exchangeRate"
                    >
                      {row.exchangeRate ?? '--'}
                    </TableCell>
                  );
                case 'flow.flowDate':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.flowDate`}
                      size="small"
                      data-test="flows-table-flowDate"
                    >
                      {row.flowDate
                        ? Intl.DateTimeFormat('en-GB').format(
                            new Date(row.flowDate)
                          )
                        : '--'}
                    </TableCell>
                  );
                case 'reportDetail.sourceID': {
                  let rd = '--';
                  if (row.reportDetails) {
                    const uniqueSourceIDs = new Set(
                      row.reportDetails
                        .map((rd) => rd.sourceID)
                        .filter(util.isDefined)
                    );
                    const uniqueSourceIDsArray = Array.from(uniqueSourceIDs);
                    rd = uniqueSourceIDsArray.join(', ');
                    rd = rd.length > 0 ? rd : '--';
                  }

                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_reportDetail.sourceSystemId`}
                      size="small"
                      data-test="flows-table-sourceSystemId"
                    >
                      {rd}
                    </TableCell>
                  );
                }
                case 'reportDetail.reporterRefCode': {
                  let rd = '--';
                  if (row.reportDetails) {
                    const uniqueSourceIDs = new Set(
                      row.reportDetails
                        .map((rd) => rd.refCode)
                        .filter(util.isDefined)
                    );
                    const uniqueRefCodesArray = Array.from(uniqueSourceIDs);
                    rd = uniqueRefCodesArray.join(', ');
                    rd = rd.length > 0 ? rd : '--';
                  }

                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_reportDetail.reporterRefCode`}
                      size="small"
                      data-test="flows-table-reporterRefCode"
                    >
                      {rd}
                    </TableCell>
                  );
                }
                default:
                  return null;
              }
            })}
          </TableRowClick>
        ))}
      </>
    );
  };
  const TableComponent = ({
    lang,
    data,
  }: {
    lang: LanguageKey;
    data: flows.SearchFlowsResult;
  }) => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {props.pending && <TableCell size="small" />}
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
                            >) // Safe type assertion
                          : 'desc'
                      }
                      onClick={() => handleSort(header.identifierID)}
                    >
                      <span className={CLASSES.VISUALLY_HIDDEN}>
                        {t.t(lang, (s) => s.components.flowsTable.sortBy)}
                        <br />
                      </span>
                      {t.t(
                        lang,
                        (s) => s.components.flowsTable.headers[header.label]
                      )}
                    </TableSortLabel>
                  ) : (
                    t.t(
                      lang,
                      (s) => s.components.flowsTable.headers[header.label]
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
  const FormWrapper = ({
    lang,
    data,
    pending,
  }: {
    lang: LanguageKey;
    data: flows.SearchFlowsResult;
    pending?: boolean;
  }) => {
    const [loading, setLoading] = useState(false);
    if (pending) {
      const PENDING_FLOWS_INITIAL_VALUES: {
        flows: { id: number; versionID: number }[];
      } = {
        flows: [],
      };
      const handleSubmit = (values: {
        flows: { id: number; versionID: number }[];
      }) => {
        if (values.flows.length === 0) return;
        setLoading(true);
        environment.model.flows
          .bulkRejectPendingFlows(values)
          .then(() => {
            setLoading(false);
            setSuccessBulkUpdate(
              t.t(
                lang,
                (s) => s.components.flowsTable.rejectPendingFlows.state.success
              )
            );
            load();
          })
          .catch(() => {
            setErrorBulkUpdate(
              t.t(
                lang,
                (s) => s.components.flowsTable.rejectPendingFlows.state.error
              )
            );
            setLoading(false);
          });
      };
      return (
        <Formik
          initialValues={PENDING_FLOWS_INITIAL_VALUES}
          onSubmit={handleSubmit}
        >
          {({ values, submitForm }) => (
            <Form>
              <TableComponent lang={lang} data={data} />
              <Portal>
                <Snackbar
                  open={values.flows.length > 0}
                  message={t.t(
                    lang,
                    (s) => s.components.flowsTable.rejectPendingFlows.message
                  )}
                  action={
                    <C.ButtonSubmit
                      color="neutral"
                      text={t.t(
                        lang,
                        (s) => s.components.flowsTable.rejectPendingFlows.button
                      )}
                      displayLoading={loading}
                      onClick={() => submitForm()}
                    />
                  }
                />
              </Portal>
            </Form>
          )}
        </Formik>
      );
    }
    return <TableComponent lang={lang} data={data} />;
  };

  const isFlowFilterValueKey = (
    key: string
  ): key is keyof FlowsFilterValues => {
    return Object.keys(FLOWS_FILTER_INITIAL_VALUES).includes(key);
  };
  const isAnyFilterActive = (flowsTotal: number) => {
    if (flowsTotal === 0) {
      return false;
    }
    let key: keyof typeof tableFilters;
    for (key in tableFilters) {
      const savedKey = key;
      const val = tableFilters[savedKey]?.value;
      if (
        isFlowFilterValueKey(savedKey) &&
        JSON.stringify(val) !==
          JSON.stringify(FLOWS_FILTER_INITIAL_VALUES[savedKey])
      ) {
        return true;
      }
    }
    return props.pending;
  };

  return (
    <>
      <C.MessageAlert
        setMessage={setErrorBulkUpdate}
        message={errorBulkUpdate}
        severity="error"
      />
      <C.MessageAlert
        setMessage={setSuccessBulkUpdate}
        message={successBulkUpdate}
        severity="success"
      />
      <StyledLoader
        loader={state}
        strings={{
          ...t.get(lang, (s) => s.components.loader),
          notFound: {
            ...t.get(lang, (s) => s.components.notFound),
            ...t.get(lang, (s) => s.components.flowsTable.notFound),
          },
        }}
      >
        {(data) => {
          if (data.searchFlows.total === 0) {
            return <NoResultTable />;
          }
          return (
            <>
              <ChipDiv>
                <RenderChipsRow
                  lang={lang}
                  chipSpacing={chipSpacing}
                  handleChipDelete={handleChipDelete}
                  tableFilters={tableFilters}
                  tableType={
                    props.pending ? 'pendingFlowsFilter' : 'flowsFilter'
                  }
                />
                <TopRowContainer>
                  <C.AsyncIconButton
                    fnPromise={() =>
                      new Promise<void>((resolve) => {
                        environment.model.flows
                          .getFlowsDownloadXLSX({
                            limit: query.rowsPerPage,
                            ...parsedFilters,
                          })
                          .then((response) => {
                            resolve(
                              downloadExcel(
                                response,
                                lang,
                                tableHeaders,
                                'export'
                              )
                            );
                          });
                      })
                    }
                    IconComponent={DownloadIcon}
                    disabledText={
                      !isAnyFilterActive(data.searchFlows.total)
                        ? t.t(
                            lang,
                            (s) => s.components.flowsTable.downloadDisabled
                          )
                        : undefined
                    }
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
                    sx={tw`flex items-center justify-center`}
                  >
                    <Box sx={tw`max-h-[70vh] overflow-y-auto rounded-xl`}>
                      <C.DraggableList
                        title={t.t(
                          lang,
                          (s) => s.components.flowsTable.tableSettings.title
                        )}
                        buttonText={t.t(
                          lang,
                          (s) => s.components.flowsTable.tableSettings.save
                        )}
                        queryValues={decodeTableHeaders(
                          query.tableHeaders,
                          lang,
                          'flows',
                          query,
                          setQuery
                        )}
                        onClick={(element) => {
                          if (isCompatibleTableHeaderType(element)) {
                            setQuery({
                              ...query,
                              tableHeaders: encodeTableHeaders(
                                element,
                                'flows',
                                query,
                                setQuery
                              ),
                            });
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
                              (s) => s.components.flowsTable.tableSettings.info
                            )}
                            localStorageKey="tableSettings"
                            sxProps={tw`mx-8 mt-4`}
                          />
                        }
                      />
                    </Box>
                  </Modal>
                  <TablePagination
                    sx={{ display: 'block' }}
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={data.searchFlows.total}
                    rowsPerPage={query.rowsPerPage}
                    page={query.page}
                    onPageChange={(_, newPage) =>
                      handleChangePage(
                        newPage,
                        data.searchFlows.prevPageCursor,
                        data.searchFlows.nextPageCursor
                      )
                    }
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TopRowContainer>
              </ChipDiv>

              <Box sx={{ overflowX: 'auto', transform: 'rotateX(180deg)' }}>
                <TableContainer
                  sx={{
                    width: '100%',
                    transform: 'rotateX(180deg)',
                    display: 'table',
                    tableLayout: 'fixed',
                    lineHeight: '1.35',
                    fontSize: '1.32rem',
                  }}
                >
                  <FormWrapper
                    lang={lang}
                    data={data}
                    pending={props.pending}
                  />
                </TableContainer>
              </Box>
              <TablePagination
                sx={{ display: 'block' }}
                data-test="flows-table-pagination"
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={data.searchFlows.total}
                rowsPerPage={query.rowsPerPage}
                page={query.page}
                onPageChange={(_, newPage) =>
                  handleChangePage(
                    newPage,
                    data.searchFlows.prevPageCursor,
                    data.searchFlows.nextPageCursor
                  )
                }
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          );
        }}
      </StyledLoader>
    </>
  );
}
