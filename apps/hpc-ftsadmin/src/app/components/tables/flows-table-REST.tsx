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
import { flows } from '@unocha/hpc-data';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import { MdInfoOutline } from 'react-icons/md';
import SettingsIcon from '@mui/icons-material/Settings';
import { LanguageKey, t } from '../../../i18n';
import { AppContext, getEnv } from '../../context';
import tw from 'twin.macro';
import React, { useEffect, useState } from 'react';
import { FlowsFilterValuesREST } from '../filters/filter-flows-REST-table';
import DownloadIcon from '@mui/icons-material/Download';
import _ from 'lodash';
import {
  FilterKeys,
  FormObjectValue,
  decodeFilters,
  encodeFilters,
  isKey,
  parseFlowFiltersREST,
  parseFormFilters,
} from '../../utils/parse-filters';
import { FLOWS_FILTER_INITIAL_VALUES_REST } from '../filters/filter-flows-REST-table';
import { Form, Formik } from 'formik';
import { PendingFlowsFilterValues } from '../filters/filter-pending-flows-table';
import {
  FlowHeaderID,
  TableHeadersProps,
  decodeTableHeaders,
  encodeTableHeaders,
} from '../../utils/table-headers';
import { Strings } from '../../../i18n/iface';
import { util } from '@unocha/hpc-core';
import { LocalStorageSchema } from '../../utils/local-storage-type';
import { downloadExcel } from '../../utils/download-excel';
import {
  ChipDiv,
  Query,
  RejectPendingFlowsButton,
  RenderChipsRow,
  StyledLoader,
  TableHeaderButton,
  TopRowContainer,
} from './table-utils';

export interface FlowsTableRESTProps {
  headers: TableHeadersProps<FlowHeaderID>[];
  initialValues: FlowsFilterValuesREST | PendingFlowsFilterValues;
  flowList?: flows.FlowList;
  rowsPerPageOption: number[];
  query: Query;
  setQuery: (newQuery: Query) => void;
}

export interface ParsedFiltersREST {
  flowID?: number[];
  amountUSD?: number;
  sourceSystemID?: number;
  dataProvider?: { systemID: string };
  flowActiveStatus?: { activeStatus: { name: string } };
  status?: { status: string };
  reporterRefCode?: number;
  legacyID?: number;
  flowObjects?: flows.FlowObject[];
  categories?: flows.FlowCategory[];
  includeChildrenOfParkedFlows?: boolean;
}
export interface ActiveFilterREST {
  label: keyof Strings['components']['flowsFilter']['filters'];
  fieldName: keyof FlowsFilterValuesREST;
  displayValue: string;
  value: string | boolean | Array<FormObjectValue> | undefined;
}
export default function FlowsTableREST(props: FlowsTableRESTProps) {
  const env = getEnv();
  let firstRender = true;
  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = props.rowsPerPageOption;
  const filters = decodeFilters(
    props.query.filters,
    FLOWS_FILTER_INITIAL_VALUES_REST
  );
  const flowFilters = parseFormFilters<
    keyof Strings['components']['flowsFilter']['filters'],
    FlowsFilterValuesREST
  >(filters, FLOWS_FILTER_INITIAL_VALUES_REST);
  const [query, setQuery] = [props.query, props.setQuery];
  const [openSettings, setOpenSettings] = useState(false);
  const [tableInfoDisplay, setTableInfoDisplay] = useState(
    util.getLocalStorageItem<LocalStorageSchema>('tableSettings', true)
  );
  const handleFlowList = () => {
    return props.flowList
      ? props.flowList
      : _.isEqual(filters, FLOWS_FILTER_INITIAL_VALUES_REST)
      ? 'all'
      : 'search';
  };

  const [state, load] = useDataLoader([query], () =>
    env.model.flows.searchFlowsREST({
      flowSearch: {
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
        flowList: handleFlowList(),
        ...parseFlowFiltersREST(flowFilters),
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

  const handleTableSettingsInfoClose = () => {
    util.setLocalStorageItem<LocalStorageSchema>('tableSettings', false);
    setTableInfoDisplay(false);
  };

  const handleChipDelete = <T extends FilterKeys>(fieldName: T) => {
    if (isKey(filters, fieldName)) {
      filters[fieldName] = undefined;
      setQuery({
        ...query,
        page: 0,
        filters: encodeFilters(filters, props.initialValues),
      });
    }
  };

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
    org: flows.FlowOrganizationREST,
    row: flows.FlowSearchResult,
    lang: LanguageKey
  ) => {
    const rd =
      row.reportDetails &&
      row.reportDetails.filter((rd) => rd.organizationID === org.objectID);

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
              Intl.DateTimeFormat().format(new Date(rd[0].date))
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
    data: flows.SearchFlowsResultREST;
  }) => {
    const [selectedRows, setSelectedRows] = useState<
      { id: number; versionID: number }[]
    >([]);
    const handleCheckboxChange = (
      event: React.ChangeEvent<HTMLInputElement>,
      row: flows.FlowSearchResult
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
        {data.flows.map((row) => (
          <TableRow
            key={`${row.id}v${row.versionID}`}
            sx={{
              backgroundColor: selectedRows.map((x) => x.id).includes(row.id)
                ? tw`bg-unocha-primary bg-opacity-10`
                : undefined,
            }}
          >
            {props.flowList === 'pending' && (
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
                />
              </TableCell>
            )}
            {decodeTableHeaders(query.tableHeaders, lang).map((column) => {
              if (!column.active) {
                return;
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
                      {Intl.DateTimeFormat().format(new Date(row.updatedAt))}
                    </TableCell>
                  );
                case 'externalReference.systemID':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_externalReference.systemID`}
                      size="small"
                      data-test="flows-table-external-reference"
                    >
                      {row.externalReference?.systemID || '--'}
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
                      key={`${row.id}v${row.versionID}_source.organization.name`}
                      size="small"
                      data-test="flows-table-source-organization"
                    >
                      {row.parkedParentSource && (
                        <>
                          <strong>
                            {t.t(
                              lang,
                              (s) => s.components.flowsTable.parkedSource
                            )}
                            : {row.parkedParentSource.OrgName}
                          </strong>
                          <br />
                        </>
                      )}
                      {row.organizations &&
                        row.organizations
                          .filter((org) => org.refDirection === 'source')
                          .map((org, index) => (
                            <span key={`source_${row.id}_${index}`}>
                              {org.name}
                              {renderReportDetail(org, row, lang)}
                            </span>
                          ))}
                    </TableCell>
                  );
                case 'organization.destination.name':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_destination.organization.name`}
                      size="small"
                      data-test="flows-table-destination-organization"
                    >
                      {row.organizations &&
                        row.organizations
                          .filter((org) => org.refDirection === 'destination')
                          .map((org, index) => (
                            <span key={`destination_${row.id}_${index}`}>
                              {org.name}
                              {renderReportDetail(org, row, lang)}
                            </span>
                          ))}
                    </TableCell>
                  );
                case 'planVersion.destination.name':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_destination.planVersion.name`}
                      size="small"
                      data-test="flows-table-plans"
                    >
                      {row.plans?.length
                        ? row.plans.map((plan) => plan.name).join(', ')
                        : '--'}
                    </TableCell>
                  );
                case 'location.destination.name':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_destination.location.name`}
                      size="small"
                      data-test="flows-table-locations"
                    >
                      {row.locations?.length
                        ? row.locations
                            .map((location) => location.name)
                            .join(', ')
                        : '--'}
                    </TableCell>
                  );
                case 'usageYear.destination.year':
                  return (
                    <TableCell
                      key={`${row.id}v${row.versionID}_destination.usageYear.year`}
                      size="small"
                      data-test="flows-table-years"
                    >
                      {row.usageYears &&
                        row.usageYears
                          .filter((year) => year.refDirection === 'destination')
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
                      {row.parentIDs && (
                        <Chip
                          sx={chipSpacing}
                          label={[
                            t.t(lang, (s) => s.components.flowsTable.child),
                          ]}
                          size="small"
                          color="primary"
                        />
                      )}
                      {row.childIDs && (
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
    data: flows.SearchFlowsResultREST;
  }) => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {props.flowList === 'pending' && <TableCell size="small" />}
            {(
              decodeTableHeaders(query.tableHeaders, lang, 'flows') as Array<
                TableHeadersProps<FlowHeaderID>
              >
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
    flowList,
  }: {
    lang: LanguageKey;
    data: flows.SearchFlowsResultREST;
    flowList?: flows.FlowList;
  }) => {
    if (flowList === 'pending') {
      const PENDING_FLOWS_INITIAL_VALUES: {
        flows: { id: number; versionID: number }[];
      } = {
        flows: [],
      };
      const handleSubmit = (values: {
        flows: { id: number; versionID: number }[];
      }) => {
        if (values.flows.length === 0) return;
        env.model.flows.bulkRejectPendingFlows(values).finally(load);
      };
      return (
        <Formik
          initialValues={PENDING_FLOWS_INITIAL_VALUES}
          onSubmit={handleSubmit}
        >
          <Form>
            <TableComponent lang={lang} data={data} />
            <RejectPendingFlowsButton
              color="primary"
              text={t.t(
                lang,
                (s) => s.components.flowsTable.rejectPendingFlows
              )}
            />
          </Form>
        </Formik>
      );
    }
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
              ...t.get(lang, (s) => s.components.flowsTable.notFound),
            },
          }}
        >
          {(data) => (
            <>
              <ChipDiv>
                <RenderChipsRow
                  lang={lang}
                  tableType="flowsFilter"
                  chipSpacing={chipSpacing}
                  handleChipDelete={handleChipDelete}
                  parsedFilters={flowFilters}
                />
                <TopRowContainer>
                  <C.AsyncIconButton
                    fnPromise={() =>
                      downloadExcel<flows.FlowSearchResult>(
                        data.flows,
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
                        onClick={(element) =>
                          setQuery({
                            ...query,
                            tableHeaders: encodeTableHeaders(
                              element as any, // TO DO: remove any
                              'flows',
                              query,
                              setQuery
                            ),
                          })
                        }
                        elevation={6}
                        sx={{
                          width: '400px',
                          height: 'fit-content',
                        }}
                        children={
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
                              (s) => s.components.flowsTable.tableSettings.info
                            )}
                          </Alert>
                        }
                      />
                    </Box>
                  </Modal>
                  <TablePagination
                    sx={{ display: 'block' }}
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={parseInt(data.flowCount)}
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
                  <FormWrapper
                    lang={lang}
                    data={data}
                    flowList={props.flowList}
                  />
                </TableContainer>
              </Box>
              <TablePagination
                sx={{ display: 'block' }}
                data-test="flows-table-pagination"
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={parseInt(data.flowCount)}
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
