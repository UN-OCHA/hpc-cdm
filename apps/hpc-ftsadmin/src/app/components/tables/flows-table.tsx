import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
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
import { util } from '@unocha/hpc-core';
import { type flows } from '@unocha/hpc-data';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../../i18n';
import dayjs from '../../../libs/dayjs';
import { getContext } from '../../context';
import paths from '../../paths';
import { TOAST_CONFIG, TOAST_CONFIG_ERROR } from '../../utils/constants';
import { downloadExcel } from '../../utils/download-excel';
import {
  type FilterKey,
  decodeFilters,
  encodeFilters,
  isKey,
  parseFlowFilters,
  parseFormFilters,
} from '../../utils/parse-filters';
import {
  type FlowHeaderID,
  decodeTableHeaders,
  encodeTableHeaders,
  getDraggableTableHeaders,
  isCompatibleTableHeaderType,
} from '../../utils/table-headers';
import {
  FLOWS_FILTER_INITIAL_VALUES,
  type FlowsFilterValues,
} from '../filters/filter-flows-table';
import { type PendingFlowsFilterValues } from '../filters/filter-pending-flows-table';
import InfoAlert from '../info-alert';
import NoResultTable from './no-result';
import {
  ChipDiv,
  type FlowQuery,
  RenderChipsRow,
  type SetQuery,
  StyledLoader,
  TableHeaderButton,
  TopRowContainer,
} from './table-utils';

export interface FlowsTableProps {
  initialValues: FlowsFilterValues | PendingFlowsFilterValues;
  rowsPerPageOptions: number[];
  query: FlowQuery;
  setQuery: SetQuery<FlowQuery>;
  pending?: boolean;
}

export default function FlowsTable(props: FlowsTableProps) {
  const { initialValues, rowsPerPageOptions, pending } = props;
  const { env, lang } = getContext();
  const environment = env();

  const chipSpacing = { m: 0.5 };

  const filters = decodeFilters(props.query.filters, initialValues);
  const tableFilters = parseFormFilters(filters, initialValues);
  const parsedFilters = parseFlowFilters(tableFilters, pending);

  const [query, setQuery] = [props.query, props.setQuery];
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false);
  const [state, load] = useDataLoader([query], () =>
    environment.model.flows.searchFlows({
      limit: query.rowsPerPage,
      page: query.page,
      sortField: query.orderBy,
      sortOrder: query.orderDir,
      ...parsedFilters,
    })
  );

  const tableHeaders = decodeTableHeaders({
    queryParam: query.tableHeaders,
    lang,
    table: 'flows',
  });

  const handleChipDelete = <T extends FilterKey>(fieldName: T) => {
    if (isKey(filters, fieldName)) {
      filters[fieldName] = undefined;
      setQuery({
        ...query,
        page: 0,
        filters: encodeFilters(filters, initialValues),
      });
    }
  };

  const handleChangePage = (newPage: number) => {
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

  const handleSort = (newSort: FlowHeaderID) => {
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

  const renderReportDetail = (
    org: flows.FlowOrganization,
    row: flows.FlowV4,
    lang: LanguageKey
  ) => {
    const rd = row.reportDetails?.filter((rd) => rd.organizationID === org.id);
    return (
      rd &&
      rd.length > 0 &&
      rd[0].channel &&
      rd[0].date && (
        <Tooltip
          title={t
            .t(lang, (s) => s.components.flowsTable.reportTooltip)
            .replace('{organization}', org.name)
            .replace('{date}', dayjs(rd[0].date).format())
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
      Array<{ id: number; versionID: number }>
    >([]);
    const tableHeaders = decodeTableHeaders({
      queryParam: query.tableHeaders,
      lang,
      table: 'flows',
    });
    const handleCheckboxChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      row: flows.FlowV4
    ) => {
      const isChecked = event.target.checked;
      if (isChecked) {
        const addedRow = [
          ...selectedRows,
          { id: row.id, versionID: row.versionID },
        ];
        setSelectedRows(addedRow);
        return addedRow;
      }
      const filteredRows = selectedRows.filter(
        (selectedRow) => selectedRow.id !== row.id
      );
      setSelectedRows(filteredRows);
      return filteredRows;
    };
    return (
      <>
        {data.searchFlows.flows.map((row) => (
          <TableRow
            key={`${row.id}v${row.versionID}`}
            sx={{
              backgroundColor: selectedRows.map((x) => x.id).includes(row.id)
                ? tw`bg-unocha-primary bg-opacity-10`
                : undefined,
            }}
          >
            {pending && (
              <TableCell
                size="small"
                component="th"
                scope="row"
                data-test="flows-table-checkbox"
              >
                <C.CheckBox
                  name="flows"
                  value={{
                    id: row.id,
                    versionID: row.versionID,
                  }}
                  onChange={(event) => handleCheckboxChange(event, row)}
                  isControlled
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
                      <Link to={paths.flow(row.id, row.versionID)}>
                        {row.id}v{row.versionID}
                      </Link>
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
                      {dayjs(row.updatedAt).format()}
                    </TableCell>
                  );
                case 'externalReference.systemID':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_externalReference.systemID`}
                      size="small"
                      data-test="flows-table-external-reference"
                    >
                      {row.externalReferences?.at(0)?.systemID ?? '--'}
                    </TableCell>
                  );
                case 'flow.amountUSD':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_flow.amountUSD`}
                      size="small"
                      data-test="flows-table-amount-usd"
                    >
                      {row.amountUSD > 0
                        ? new Intl.NumberFormat(lang, {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(row.amountUSD)
                        : row.origAmount && row.origCurrency
                        ? new Intl.NumberFormat(lang, {
                            style: 'currency',
                            currency: row.origCurrency,
                            maximumFractionDigits: 0,
                          }).format(row.origAmount)
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
                              : {row.parkedParentSource.orgName}
                            </strong>
                            <br />
                          </>
                        )}
                      {row.organizations
                        ?.filter((org) => org.direction === 'source')
                        .map((org, index) => (
                          <React.Fragment key={`source_${row.id}_${index}`}>
                            <Tooltip
                              title={org.name}
                              placement="top"
                              followCursor={true}
                            >
                              <span>{org.abbreviation}</span>
                            </Tooltip>
                            {renderReportDetail(org, row, lang)}
                          </React.Fragment>
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
                      {row.organizations
                        ?.filter((org) => org.direction === 'destination')
                        .map((org, index) => (
                          <React.Fragment
                            key={`destination_${row.id}_${index}`}
                          >
                            <Tooltip
                              title={org.name}
                              placement="top"
                              followCursor={true}
                            >
                              <span>{org.abbreviation}</span>
                            </Tooltip>
                            {renderReportDetail(org, row, lang)}
                          </React.Fragment>
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
                      {row.usageYears
                        ?.filter((year) => year.direction === 'destination')
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
                      {row.categories
                        ?.filter((cat) => cat.group === 'flowStatus')
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
                        ? dayjs(row.decisionDate).format()
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
                      {row.flowDate ? dayjs(row.flowDate).format() : '--'}
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
                    const uniqueSourceIDsArray = [...uniqueSourceIDs];
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
                    const uniqueRefCodesArray = [...uniqueSourceIDs];
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
    data: flows.SearchFlowsResult;
  }) => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {pending && <TableCell size="small" />}
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
    const [isLoading, setIsLoading] = useState(false);
    if (pending) {
      const PENDING_FLOWS_INITIAL_VALUES: {
        flows: Array<{ id: number; versionID: number }>;
      } = {
        flows: [],
      };
      const handleSubmit = (values: {
        flows: Array<{ id: number; versionID: number }>;
      }) => {
        if (values.flows.length === 0) {
          return;
        }
        setIsLoading(true);
        environment.model.flows
          .bulkRejectPendingFlows(values)
          .then(() => {
            toast.success(
              t.t(
                lang,
                (s) => s.components.flowsTable.rejectPendingFlows.state.success
              ),
              TOAST_CONFIG
            );
            load();
          })
          .catch(() => {
            toast.error(
              t.t(
                lang,
                (s) => s.components.flowsTable.rejectPendingFlows.state.error
              ),
              TOAST_CONFIG_ERROR
            );
          })
          .finally(() => setIsLoading(false));
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
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  sx={tw`rounded-sm bg-unocha-primary`}
                  ContentProps={{ sx: tw`rounded-sm bg-unocha-primary` }}
                  message={t.t(
                    lang,
                    (s) => s.components.flowsTable.rejectPendingFlows.message
                  )}
                  action={
                    <C.ButtonSubmit
                      color="primary_light"
                      text={t.t(
                        lang,
                        (s) => s.components.flowsTable.rejectPendingFlows.button
                      )}
                      shouldDisplayLoading={isLoading}
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
    return pending;
  };

  return (
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
                tableType={pending ? 'pendingFlowsFilter' : 'flowsFilter'}
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
                  onClick={() => setShouldOpenSettings(!shouldOpenSettings)}
                >
                  <SettingsIcon />
                </TableHeaderButton>
                <Modal
                  open={shouldOpenSettings}
                  onClose={() => setShouldOpenSettings(!shouldOpenSettings)}
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
                      queryValues={getDraggableTableHeaders({
                        queryParam: query.tableHeaders,
                        lang,
                        table: 'flows',
                        query,
                        setQuery,
                      })}
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
                <TablePagination
                  sx={{ display: 'block' }}
                  rowsPerPageOptions={rowsPerPageOptions}
                  component="div"
                  count={data.searchFlows.total}
                  rowsPerPage={query.rowsPerPage}
                  page={query.page}
                  onPageChange={(_, newPage) => handleChangePage(newPage)}
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
                <FormWrapper lang={lang} data={data} pending={pending} />
              </TableContainer>
            </Box>
            <TablePagination
              sx={tw`shrink-0`}
              data-test="flows-table-pagination"
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              count={data.searchFlows.total}
              rowsPerPage={query.rowsPerPage}
              page={query.page}
              onPageChange={(_, newPage) => handleChangePage(newPage)}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        );
      }}
    </StyledLoader>
  );
}
