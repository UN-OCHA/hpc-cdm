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
  Tooltip,
} from '@mui/material';
import { flows } from '@unocha/hpc-data';
import { C, dataLoader } from '@unocha/hpc-ui';
import { useState } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import { LanguageKey, t } from '../../i18n';
import { AppContext, getEnv } from '../context';

export default function FlowsTable() {
  const env = getEnv();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const loader = dataLoader([page, rowsPerPage], () =>
    env.model.flows.searchFlows({
      flowSearch: {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        includeChildrenOfParkedFlows: true,
      },
    })
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {t.t(lang, (s) => s.routes.flows.table.id)}
                    </TableCell>
                    <TableCell>
                      {t.t(lang, (s) => s.routes.flows.table.updatedCreated)}
                    </TableCell>
                    <TableCell>
                      {t.t(lang, (s) => s.routes.flows.table.dataProvider)}
                    </TableCell>
                    <TableCell>
                      {t.t(lang, (s) => s.routes.flows.table.amountUSD)}
                    </TableCell>
                    <TableCell>
                      {t.t(
                        lang,
                        (s) => s.routes.flows.table.sourceOrganization
                      )}
                    </TableCell>
                    <TableCell>
                      {t.t(
                        lang,
                        (s) => s.routes.flows.table.destinationOrganization
                      )}
                    </TableCell>
                    <TableCell>
                      {t.t(lang, (s) => s.routes.flows.table.destinationPlan)}
                    </TableCell>
                    <TableCell>
                      {t.t(
                        lang,
                        (s) => s.routes.flows.table.destinationCountry
                      )}
                    </TableCell>
                    <TableCell>
                      {t.t(lang, (s) => s.routes.flows.table.destinationYear)}
                    </TableCell>
                    <TableCell>
                      {t.t(lang, (s) => s.routes.flows.table.details)}
                    </TableCell>
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
                      rowsPerPage={rowsPerPage}
                      page={page}
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
