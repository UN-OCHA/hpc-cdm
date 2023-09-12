import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import {
  createEnumParam,
  decodeNumber,
  NumberParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import { flows } from '@unocha/hpc-data';
import { useEffect } from 'react';

type HeaderId =
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

export interface FlowsTableProps {
  headers: {
    id: HeaderId;
    sortable?: boolean;
    label: keyof Strings['components']['flowsTable']['headers'];
  }[];
  flowList: flows.FlowList;
  filters?: flows.SearchFlowsGraphQlParams;
}
const StyledLoader = tw(C.Loader)`
text-center
`;

export default function FlowsTableGraphQl(props: FlowsTableProps) {
  const env = getEnv();
  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = [10, 25, 50, 100];
  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 0),
    rowsPerPage: withDefault(
      {
        ...NumberParam,
        decode: (string) => {
          // prevent user requesting more than max number of rows
          const number = decodeNumber(string);
          return number && Math.min(number, Math.max(...rowsPerPageOptions));
        },
      },
      50
    ),
    orderBy: withDefault(
      createEnumParam(
        // Same as filter then map but this is acceptable to typescript
        props.headers.reduce((acc, curr) => {
          if (curr.sortable) {
            return [...acc, curr.id];
          }

          return acc;
        }, [] as string[])
      ),
      'flow.updatedAt'
    ),
    orderDir: withDefault(createEnumParam(['ASC', 'DESC']), 'DESC'),
  });

  const filters = props.filters?.flowSearch.filters;
  const [state, load] = useDataLoader([query], () =>
    env.model.flows.searchFlowsGraphQL({
      flowSearch: {
        filters: filters,
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
      },
    })
  );

  useEffect(() => {
    load();
  }, [props.filters]);

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
    row: flows.FlowSearchGraphQLResult,
    lang: LanguageKey
  ) => {
    /**const rd =
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
          <IconButton>
            <MdInfoOutline />
          </IconButton>
        </Tooltip>
      )
    );
     */
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
          {(data) =>
            data.searchFlow.length === 0 ? (
              <h3>No Results Found</h3>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer
                  sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TablePagination
                          rowsPerPageOptions={rowsPerPageOptions}
                          component="td"
                          count={300000}
                          rowsPerPage={query.rowsPerPage}
                          page={query.page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                      </TableRow>
                      <TableRow>
                        {props.headers.map((header) => (
                          <TableCell
                            key={header.label}
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
                      {data.searchFlow.map((row) => {
                        return (
                          <TableRow key={`${row.id}v${row.versionID}`}>
                            {props.headers.map((column) => {
                              switch (column.id) {
                                case 'flow.id':
                                  return (
                                    <TableCell
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
                                      component="th"
                                      scope="row"
                                      data-test="flows-table-status"
                                    >
                                      {t.t(lang, (s) =>
                                        parseInt(row.versionID) > 1
                                          ? s.components.flowsTable.update
                                          : s.components.flowsTable.new
                                      )}
                                    </TableCell>
                                  );
                                case 'flow.updatedAt':
                                  return (
                                    <TableCell data-test="flows-table-updated">
                                      {Intl.DateTimeFormat().format(
                                        new Date(row.updatedAt)
                                      )}
                                    </TableCell>
                                  );
                                case 'externalReference.systemID':
                                  return (
                                    <TableCell data-test="flows-table-external-reference">
                                      {
                                        /**row.externalReference?.systemID ||*/ '--'
                                      }
                                    </TableCell>
                                  );
                                case 'flow.amountUSD':
                                  return (
                                    <TableCell data-test="flows-table-amount-usd">
                                      {row.amountUSD > 0
                                        ? new Intl.NumberFormat(lang, {
                                            style: 'currency',
                                            currency: 'USD',
                                            maximumFractionDigits: 0,
                                          }).format(row.amountUSD)
                                        : /**row.origAmount && row.origCurrency
                                    ? new Intl.NumberFormat(lang, {
                                        style: 'currency',
                                        currency: row.origCurrency,
                                        maximumFractionDigits: 0,
                                      }).format(row.origAmount)
                                    : */ '--'}
                                    </TableCell>
                                  );
                                case 'source.organization.name':
                                  return (
                                    <TableCell data-test="flows-table-source-organization">
                                      {/*row.parkedParentSource && (
                                    <>
                                      <strong>
                                        {t.t(
                                          lang,
                                          (s) =>
                                            s.components.flowsTable.parkedSource
                                        )}
                                        : <></>
                                      </strong>
                                      <br />
                                    </>
                                        )*/}
                                      {row.flowObjects.source.organizations &&
                                        row.flowObjects.source.organizations.map(
                                          (org, index) => (
                                            <span
                                              key={`source_${row.id}_${index}`}
                                            >
                                              {org.name}
                                              {/** renderReportDetail(
                                            {
                                              objectID: parseInt(org.id),
                                              refDirection: 'source',
                                              name: org.name,
                                            },
                                            row,
                                            lang
                                          )*/}
                                            </span>
                                          )
                                        )}
                                    </TableCell>
                                  );
                                case 'destination.organization.name':
                                  return (
                                    <TableCell data-test="flows-table-destination-organization">
                                      {row.flowObjects.destination
                                        .organizations &&
                                        row.flowObjects.destination.organizations.map(
                                          (org, index) => (
                                            <span
                                              key={`destination_${row.id}_${index}`}
                                            >
                                              {org.name}
                                              {/** renderReportDetail(
                                            {
                                              objectID: parseInt(org.id),
                                              refDirection: 'destination',
                                              name: org.name,
                                            },
                                            row,
                                            lang
                                          )*/}
                                            </span>
                                          )
                                        )}
                                    </TableCell>
                                  );
                                case 'destination.planVersion.name':
                                  return (
                                    <TableCell data-test="flows-table-plans">
                                      {row.flowObjects.destination.plans?.length
                                        ? row.flowObjects.destination.plans
                                            .map((plan) => plan.name)
                                            .join(', ')
                                        : '--'}
                                    </TableCell>
                                  );
                                case 'destination.location.name':
                                  return (
                                    <TableCell data-test="flows-table-locations">
                                      {row.flowObjects.destination.locations
                                        ?.length
                                        ? row.flowObjects.destination.locations
                                            .map((location) => location.name)
                                            .join(', ')
                                        : '--'}
                                    </TableCell>
                                  );
                                case 'destination.usageYear.year':
                                  return (
                                    <TableCell data-test="flows-table-years">
                                      {row.flowObjects.destination.plans &&
                                        row.flowObjects.destination.plans
                                          .map(
                                            (plan) =>
                                              plan.years &&
                                              plan.years.map((year) => year)
                                          )
                                          .join(', ')}
                                    </TableCell>
                                  );
                                case 'details':
                                  return (
                                    <TableCell data-test="flows-table-details">
                                      {/**row.categories &&
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
                                      ))*/}
                                      {row.restricted && (
                                        <Chip
                                          label={[
                                            t.t(
                                              lang,
                                              (s) =>
                                                s.components.flowsTable
                                                  .restricted
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
                                      {/** row.parentIDs && (
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
                                          (s) => s.components.flowsTable.parent
                                        ),
                                      ]}
                                      size="small"
                                      color="primary"
                                    />
                                  )*/}
                                    </TableCell>
                                  );
                                default:
                                  return null;
                              }
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          data-test="flows-table-pagination"
                          rowsPerPageOptions={rowsPerPageOptions}
                          component="td"
                          count={300000}
                          rowsPerPage={query.rowsPerPage}
                          page={query.page}
                          onPageChange={handleChangePage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                      </TableRow>
                    </TableFooter>
                  </Table>
                </TableContainer>
              </Box>
            )
          }
        </StyledLoader>
      )}
    </AppContext.Consumer>
  );
}
