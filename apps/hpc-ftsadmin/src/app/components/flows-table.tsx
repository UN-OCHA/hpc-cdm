import {
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
import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowsFilterValues } from './filter-flows-table';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import _ from 'lodash';
import {
  decodeFilters,
  encodeFilters,
  parseActiveFilters,
  parseFilters,
} from '../utils/parse-filters';
import { FLOWS_FILTER_INITIAL_VALUES } from '../components/filter-flows-table';
import { Form, Formik } from 'formik';
import { PendingFlowsFilterValues } from './filter-pending-flows-table';
import EllipsisText from '../utils/ellipsis-text';
import { editFlowSetting } from '../paths';

export type HeaderID =
  | 'flow.id'
  | 'flow.versionID'
  | 'flow.updatedAt'
  | 'externalReference.systemID'
  | 'flow.amountUSD'
  | 'source.organization.name'
  | 'destination.organization.name'
  | 'destination.planVersion.name'
  | 'destination.location.name'
  | 'destination.usageYear.year'
  | 'details';

export type Query = {
  page: number;
  rowsPerPage: number;
  orderBy: string;
  orderDir: string;
  filters: string;
};
export interface FlowsTableProps {
  headers: {
    id: HeaderID;
    sortable?: boolean;
    label: keyof Strings['components']['flowsTable']['headers'];
  }[];
  initialValues: FlowsFilterValues | PendingFlowsFilterValues;
  flowList?: flows.FlowList;
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
const ConfigButton = tw(IconButton)`
h-min
self-center
`;
const ChipFilterValues = tw.div`
bg-unocha-secondary-light
inline-flex
mx-1
px-2
rounded-full
`;
const RejectPendingFlowsButton = tw(C.ButtonSubmit)`
mt-8
`;
export interface ParsedFilters {
  flowID?: number;
  amountUSD?: number;
  sourceSystemID?: number;
  flowActiveStatus?: { activeStatus: { name: string } };
  status?: { status: string };
  reporterRefCode?: number;
  flowLegacyID?: number;
  flowObjects?: flows.FlowObject[];
  categories?: flows.FlowCategory[];
  includeChildrenOfParkedFlows?: boolean;
}
export interface ActiveFilter {
  label: string;
  fieldName: keyof FlowsFilterValues;
  displayValue: string;
  value: string | boolean | { label: string; id: string }[] | undefined;
}
export default function FlowsTable(props: FlowsTableProps) {
  const env = getEnv();
  let firstRender = true;
  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = props.rowsPerPageOption;
  const filters = decodeFilters(props.query.filters, props.initialValues);
  const { activeFormValues, attributes } = parseActiveFilters(filters);
  const [query, setQuery] = [props.query, props.setQuery];
  const [openSettings, setOpenSettings] = useState(false);
  const navigate = useNavigate();

  const handleFlowList = () => {
    return props.flowList
      ? props.flowList
      : _.isEqual(filters, FLOWS_FILTER_INITIAL_VALUES)
      ? 'all'
      : 'search';
  };

  const [state, load] = useDataLoader([query], () =>
    env.model.flows.searchFlows({
      flowSearch: {
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
        flowList: handleFlowList(),
        ...parseFilters(activeFormValues),
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

  const handleChipDelete = (fieldName: keyof FlowsFilterValues) => {
    activeFormValues[fieldName] = undefined;
    setQuery({ ...query, page: 0, filters: encodeFilters(activeFormValues) });
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

  const handleSort = (newSort: HeaderID) => {
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
    data: flows.SearchFlowsResult;
  }) => {
    const [selectedRows, setSelectedRows] = useState<
      { id: number; versionID: number }[]
    >([]);

    const handleClickOfRow = (row: flows.FlowSearchResult) => {
      navigate(editFlowSetting(row.id, row.versionID));
    };

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
              '&:hover': {
                backgroundColor: tw`bg-unocha-primary bg-opacity-10`,
              },
            }}
            onClick={() => handleClickOfRow(row)}
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
            {props.headers.map((column) => {
              switch (column.id) {
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
                case 'source.organization.name':
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
                case 'destination.organization.name':
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
                case 'destination.planVersion.name':
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
                case 'destination.location.name':
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
                case 'destination.usageYear.year':
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
    data: flows.SearchFlowsResult;
  }) => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            {props.flowList === 'pending' && (
              <TableCell size="small"></TableCell>
            )}
            {props.headers.map((header) => (
              <TableCell
                size="small"
                key={`${header.id}_${header.label}`}
                data-test={`header-${header.label}`}
                {...(header.sortable &&
                  query.orderBy === header.id && {
                    'aria-sort':
                      query.orderDir === 'ASC' ? 'ascending' : 'descending',
                  })}
              >
                {header.sortable ? (
                  <TableSortLabel
                    active={query.orderBy === header.id}
                    direction={
                      (query.orderDir === 'ASC' || query.orderDir === 'DESC') &&
                      query.orderBy === header.id
                        ? (query.orderDir.toLowerCase() as Lowercase<
                            typeof query.orderDir
                          >)
                        : 'desc'
                    }
                    onClick={() => handleSort(header.id)}
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
            ))}
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
    flowList,
  }: {
    lang: LanguageKey;
    data: flows.SearchFlowsResult;
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
              text="Reject Selected Flows"
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
                {attributes.map((activeFilter) => (
                  <Tooltip
                    key={activeFilter.fieldName}
                    title={
                      <div style={{ textAlign: 'left', width: 'auto' }}>
                        {activeFilter.displayValue
                          .split('<||>')
                          .map((filter) => (
                            <li
                              key={filter}
                              style={{
                                textAlign: 'left',
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
                          <span>{activeFilter.label}: </span>
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
                                    {/\[.*\]/.test(filter) // We do this in order to shorten organization names
                                      ? filter.match(/\[.*\]/)?.[0]
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
                      deleteIcon={<CancelRoundedIcon />}
                    />
                  </Tooltip>
                ))}
                <TopRowContainer>
                  <ConfigButton
                    size="small"
                    onClick={() => setOpenSettings(!openSettings)}
                  >
                    <SettingsIcon />
                  </ConfigButton>
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
                        title="test"
                        possibleValues={[
                          'ID',
                          'Description',
                          'Updated/Created',
                          'Source Organization',
                          'ID2',
                          'Description2',
                          'Updated/Created2',
                          'Source Organization2',
                          'ID3',
                          'Description3',
                          'Updated/Created3',
                          'Source Organization3',
                          'ID4',
                          'Description4',
                          'Updated/Created4',
                          'Source Organization4',
                        ]}
                        activeValues={['ID']}
                        elevation={6}
                        sx={{
                          width: '400px',
                          height: 'fit-content',
                        }}
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
                  <CustomTable
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
