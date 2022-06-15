import {
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
import { C, CLASSES, dataLoader } from '@unocha/hpc-ui';
import { MdInfoOutline } from 'react-icons/md';
import {
  createEnumParam,
  NumberParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';
import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { AppContext, getEnv } from '../context';

export default function FlowsTable() {
  const env = getEnv();

  const headers: {
    sort?: string;
    label: keyof Strings['routes']['flows']['table']['headers'];
  }[] = [
    {
      sort: 'flow.id',
      label: 'id',
    },
    {
      sort: 'flow.updatedAt',
      label: 'updatedCreated',
    },
    {
      sort: 'externalReference.systemID',
      label: 'dataProvider',
    },
    {
      sort: 'flow.amountUSD',
      label: 'amountUSD',
    },
    {
      sort: 'source.organization.name',
      label: 'sourceOrganization',
    },
    {
      sort: 'destination.organization.name',
      label: 'destinationOrganization',
    },
    {
      sort: 'destination.planVersion.name',
      label: 'destinationPlan',
    },
    {
      sort: 'destination.location.name',
      label: 'destinationCountry',
    },
    {
      sort: 'destination.usageYear.year',
      label: 'destinationYear',
    },
    {
      label: 'details',
    },
  ];

  const [query, setQuery] = useQueryParams({
    page: withDefault(NumberParam, 0),
    rowsPerPage: withDefault(NumberParam, 50),
    orderBy: withDefault(
      createEnumParam(
        // Same as filter then map but this is acceptable to typescript
        headers.reduce((acc, curr) => {
          if (curr.sort) {
            return [...acc, curr.sort];
          }

          return acc;
        }, [] as string[])
      ),
      'flow.updatedAt'
    ),
    orderDir: withDefault(createEnumParam(['ASC', 'DESC']), 'DESC'),
  });

  const loader = dataLoader([query], () =>
    env.model.flows.searchFlows({
      flowSearch: {
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
        includeChildrenOfParkedFlows: true,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
      },
    })
  );

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

  const handleSort = (newSort = 'flow.id') => {
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
            .t(lang, (s) => s.routes.flows.table.reportTooltip)
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
  };

  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = [10, 25, 50, 100];

  return (
    <AppContext.Consumer>
      {({ lang }) => (
        <C.Loader
          loader={loader}
          strings={{
            ...t.get(lang, (s) => s.components.loader),
            notFound: {
              ...t.get(lang, (s) => s.components.notFound),
              ...t.get(lang, (s) => s.routes.flows.table.notFound),
            },
          }}
        >
          {(data) => (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={rowsPerPageOptions}
                      component="td"
                      count={parseInt(data.flowCount)}
                      rowsPerPage={query.rowsPerPage}
                      page={query.page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                  <TableRow>
                    {headers.map((header) => (
                      <TableCell key={header.label}>
                        {header.sort ? (
                          <TableSortLabel
                            active={query.orderBy === header.sort}
                            direction={
                              (query.orderDir === 'ASC' ||
                                query.orderDir === 'DESC') &&
                              query.orderBy === header.sort
                                ? (query.orderDir.toLowerCase() as Lowercase<
                                    typeof query.orderDir
                                  >)
                                : 'desc'
                            }
                            onClick={() => handleSort(header.sort)}
                          >
                            <span className={CLASSES.VISUALLY_HIDDEN}>
                              {t.t(lang, (s) => s.routes.flows.table.sortBy)}
                            </span>
                            {t.t(
                              lang,
                              (s) => s.routes.flows.table.headers[header.label]
                            )}
                          </TableSortLabel>
                        ) : (
                          t.t(
                            lang,
                            (s) => s.routes.flows.table.headers[header.label]
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.flows.map((row) => (
                    <TableRow key={`${row.id}v${row.versionID}`}>
                      <TableCell
                        component="th"
                        scope="row"
                        data-test="flows-table-id"
                      >
                        {row.id} v{row.versionID}
                      </TableCell>
                      <TableCell data-test="flows-table-updated">
                        {Intl.DateTimeFormat().format(new Date(row.updatedAt))}
                      </TableCell>
                      <TableCell data-test="flows-table-external-reference">
                        {row.externalReference?.systemID || '--'}
                      </TableCell>
                      <TableCell data-test="flows-table-amount-usd">
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
                      <TableCell data-test="flows-table-source-organization">
                        {row.parkedParentSource && (
                          <>
                            <strong>
                              Parked source: {row.parkedParentSource.OrgName}
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
                      <TableCell data-test="flows-table-destination-organization">
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
                      <TableCell data-test="flows-table-plans">
                        {row.plans?.length
                          ? row.plans.map((plan) => plan.name).join(', ')
                          : '--'}
                      </TableCell>
                      <TableCell data-test="flows-table-locations">
                        {row.locations?.length
                          ? row.locations
                              .map((location) => location.name)
                              .join(', ')
                          : '--'}
                      </TableCell>
                      <TableCell data-test="flows-table-years">
                        {row.usageYears &&
                          row.usageYears
                            .filter(
                              (year) => year.refDirection === 'destination'
                            )
                            .map((year) => year.year)
                            .join(', ')}
                      </TableCell>
                      <TableCell data-test="flows-table-details">
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
                              t.t(lang, (s) => s.routes.flows.table.restricted),
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
                              t.t(lang, (s) => s.routes.flows.table.inactive),
                            ]}
                            size="small"
                          />
                        )}
                        {row.parentIDs && (
                          <Chip
                            sx={chipSpacing}
                            label={[
                              t.t(lang, (s) => s.routes.flows.table.child),
                            ]}
                            size="small"
                            color="primary"
                          />
                        )}
                        {row.childIDs && (
                          <Chip
                            sx={chipSpacing}
                            label={[
                              t.t(lang, (s) => s.routes.flows.table.parent),
                            ]}
                            size="small"
                            color="primary"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={rowsPerPageOptions}
                      component="td"
                      count={parseInt(data.flowCount)}
                      rowsPerPage={query.rowsPerPage}
                      page={query.page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </C.Loader>
      )}
    </AppContext.Consumer>
  );
}
