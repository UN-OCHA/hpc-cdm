import {
  Box,
  Chip,
  IconButton,
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

import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import { useEffect, useState } from 'react';
import { camelCaseToTitle } from '../utils/mapFunctions';
import { FormValues } from './filter-table';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import _ from 'lodash';
import {
  decodeFilters,
  encodeFilters,
  parseFilters,
} from '../utils/parseFilters';
import { FORM_INITIAL_VALUES } from '../pages/flows-list';

export type HeaderId =
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
    id: HeaderId;
    sortable?: boolean;
    label: keyof Strings['components']['flowsTable']['headers'];
  }[];
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
export interface ParsedFilters {
  flowId?: number;
  amountUSD?: number;
  sourceSystemId?: number;
  flowActiveStatus?: { activeStatus: { name: string } };
  reporterReferenceCode?: number;
  flowLegacyId?: number;
  flowObjects?: flows.FlowObject[];
  categories?: flows.FlowCategory[];
  includeChildrenOfParkedFlows?: boolean;
}
interface ActiveFilter {
  label: string;
  fieldName: keyof FormValues;
  value: string;
}
export default function FlowsTable(props: FlowsTableProps) {
  const env = getEnv();
  let firstRender = true;
  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = props.rowsPerPageOption;
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const filters = decodeFilters(props.query.filters);
  const [query, setQuery] = [props.query, props.setQuery];

  const handleFlowList = () => {
    return props.flowList
      ? props.flowList
      : _.isEqual(decodeFilters(query.filters), FORM_INITIAL_VALUES)
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
        ...parseFilters(decodeFilters(query.filters)),
      },
    })
  );
  useEffect(() => {
    const attributes: ActiveFilter[] = [];
    let key: keyof FormValues;
    for (key in filters) {
      const fieldValue = filters[key];
      if (
        !(
          (Array.isArray(fieldValue) && fieldValue.length === 0) ||
          fieldValue === false ||
          fieldValue === '' ||
          fieldValue === null
        )
      ) {
        let typedFieldValue = '';
        if (typeof fieldValue === 'string') {
          typedFieldValue = typedFieldValue.concat(fieldValue);
        } else if (Array.isArray(fieldValue)) {
          typedFieldValue = fieldValue.map((x) => x.label).join('<||>');
        } else if (typeof fieldValue === 'boolean') {
          typedFieldValue = typedFieldValue.concat(fieldValue.toString());
        }
        attributes.push({
          label: camelCaseToTitle(key),
          fieldName: key,
          value: typedFieldValue,
        });
      }

      setActiveFilters(attributes);
    }
    if (!firstRender) {
      const didFiltersChange = _.isEqual(activeFilters, attributes);
      setQuery({
        ...query,
        page: didFiltersChange ? 0 : query.page,
        filters: encodeFilters(filters),
      });
      load();
    }
    if (firstRender) {
      firstRender = false;
    }
  }, [query]);

  const handleChipDelete = (fieldName: keyof FormValues) => {
    const formValues: FormValues = decodeFilters(query.filters);
    if (fieldName === 'includeChildrenOfParkedFlows') {
      formValues[fieldName] = false;
    } else {
      (formValues[fieldName] as any) = FORM_INITIAL_VALUES[fieldName];
    }
    setQuery({ ...query, page: 0, filters: encodeFilters(formValues) });
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

  const handleSort = (newSort: HeaderId) => {
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
                {activeFilters.map((activeFilter) => (
                  <Tooltip
                    key={activeFilter.fieldName}
                    title={
                      <div style={{ textAlign: 'left', width: 'auto' }}>
                        {activeFilter.value.split('<||>').map((x) => (
                          <li
                            key={x}
                            style={{
                              textAlign: 'left',
                              marginTop: '0',
                              marginBottom: '0',
                              listStyle:
                                activeFilter.value.split('<||>').length > 1
                                  ? 'inherit'
                                  : 'none',
                            }}
                          >
                            {x}
                          </li>
                        ))}
                      </div>
                    }
                  >
                    <Chip
                      key={`chip_${activeFilter.fieldName}`}
                      sx={chipSpacing}
                      label={activeFilter.label}
                      size="small"
                      color="primary"
                      onDelete={() =>
                        handleChipDelete(
                          activeFilter.fieldName as keyof FormValues
                        )
                      }
                      deleteIcon={<CancelRoundedIcon />}
                    />
                  </Tooltip>
                ))}
                <TablePagination
                  sx={{ display: 'block' }}
                  rowsPerPageOptions={rowsPerPageOptions}
                  component="td"
                  count={parseInt(data.flowCount)}
                  rowsPerPage={query.rowsPerPage}
                  page={query.page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
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
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {props.headers.map((header) => (
                          <TableCell
                            size="small"
                            key={`${header.id}_${header.label}`}
                            data-test={`header-${header.label}`}
                            {...(header.sortable &&
                              query.orderBy === header.id && {
                                'aria-sort':
                                  query.orderDir === 'ASC'
                                    ? 'ascending'
                                    : 'descending',
                              })}
                          >
                            {header.sortable ? (
                              <TableSortLabel
                                active={query.orderBy === header.id}
                                direction={
                                  (query.orderDir === 'ASC' ||
                                    query.orderDir === 'DESC') &&
                                  query.orderBy === header.id
                                    ? (query.orderDir.toLowerCase() as Lowercase<
                                        typeof query.orderDir
                                      >)
                                    : 'desc'
                                }
                                onClick={() => handleSort(header.id)}
                              >
                                <span className={CLASSES.VISUALLY_HIDDEN}>
                                  {t.t(
                                    lang,
                                    (s) => s.components.flowsTable.sortBy
                                  )}
                                  <br />
                                </span>
                                {t.t(
                                  lang,
                                  (s) =>
                                    s.components.flowsTable.headers[
                                      header.label
                                    ]
                                )}
                              </TableSortLabel>
                            ) : (
                              t.t(
                                lang,
                                (s) =>
                                  s.components.flowsTable.headers[header.label]
                              )
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.flows.map((row) => (
                        <TableRow key={`${row.id}v${row.versionID}`}>
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
                                    {Intl.DateTimeFormat().format(
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
                                            (s) =>
                                              s.components.flowsTable
                                                .parkedSource
                                          )}
                                          : {row.parkedParentSource.OrgName}
                                        </strong>
                                        <br />
                                      </>
                                    )}
                                    {row.organizations &&
                                      row.organizations
                                        .filter(
                                          (org) => org.refDirection === 'source'
                                        )
                                        .map((org, index) => (
                                          <span
                                            key={`source_${row.id}_${index}`}
                                          >
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
                                        .filter(
                                          (org) =>
                                            org.refDirection === 'destination'
                                        )
                                        .map((org, index) => (
                                          <span
                                            key={`destination_${row.id}_${index}`}
                                          >
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
                                      ? row.plans
                                          .map((plan) => plan.name)
                                          .join(', ')
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
                                        .filter(
                                          (year) =>
                                            year.refDirection === 'destination'
                                        )
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
                                        .filter(
                                          (cat) => cat.group === 'flowStatus'
                                        )
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
                                            (s) =>
                                              s.components.flowsTable.restricted
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
                                          t.t(
                                            lang,
                                            (s) =>
                                              s.components.flowsTable.inactive
                                          ),
                                        ]}
                                        size="small"
                                      />
                                    )}
                                    {row.parentIDs && (
                                      <Chip
                                        sx={chipSpacing}
                                        label={[
                                          t.t(
                                            lang,
                                            (s) => s.components.flowsTable.child
                                          ),
                                        ]}
                                        size="small"
                                        color="primary"
                                      />
                                    )}
                                    {row.childIDs && (
                                      <Chip
                                        sx={chipSpacing}
                                        label={[
                                          t.t(
                                            lang,
                                            (s) =>
                                              s.components.flowsTable.parent
                                          ),
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
                    </TableBody>
                    <TableFooter></TableFooter>
                  </Table>
                </TableContainer>
              </Box>
              <TablePagination
                sx={{ display: 'block' }}
                data-test="flows-table-pagination"
                rowsPerPageOptions={rowsPerPageOptions}
                component="td"
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
