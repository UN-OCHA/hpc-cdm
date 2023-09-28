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
import { categories, flows } from '@unocha/hpc-data';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import { MdInfoOutline } from 'react-icons/md';
import {
  createEnumParam,
  decodeNumber,
  NumberParam,
  useQueryParams,
  withDefault,
  JsonParam,
} from 'use-query-params';
import { LanguageKey, t } from '../../i18n';
import { Strings } from '../../i18n/iface';
import { AppContext, getEnv } from '../context';
import tw from 'twin.macro';
import { useEffect, useState } from 'react';
import {
  camelCaseToTitle,
  formValueToId,
  formValueToLabel,
} from '../utils/mapFunctions';
import { FormValues } from './filter-table';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import _ from 'lodash';
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

export interface FlowsTableProps {
  headers: {
    id: HeaderId;
    sortable?: boolean;
    label: keyof Strings['components']['flowsTable']['headers'];
  }[];
  flowList: flows.FlowList;
  filters?: FormValues;
}
const StyledLoader = tw(C.Loader)`
  mx-auto
  `;
const ChipDiv = tw.div`
relative
w-full
`;
interface ParsedFilters {
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

const parseFilters = (
  props: FlowsTableProps
): [FormValues, ParsedFilters] | undefined => {
  if (!props.filters) return;
  const typedFormFields: flows.FlowFilters = {
    flowId: props.filters.flowId,
    keywords: formValueToLabel(props.filters.keywords),
    amountUSD:
      props.filters.amountUSD === '' ? null : parseInt(props.filters.amountUSD),
    flowStatus: props.filters.flowStatus,
    flowType: props.filters.flowType,
    flowActiveStatus: props.filters.flowActiveStatus,
    reporterReferenceCode:
      props.filters.reporterReferenceCode === ''
        ? null
        : parseInt(props.filters.reporterReferenceCode),
    sourceSystemId:
      props.filters.sourceSystemId === ''
        ? null
        : parseInt(props.filters.sourceSystemId),
    flowLegacyId:
      props.filters.flowLegacyId === ''
        ? null
        : parseInt(props.filters.flowLegacyId),
    destinationCountries: formValueToId(props.filters.destinationCountries),
    destinationOrganizations: formValueToId(
      props.filters.destinationOrganizations
    ),
    destinationProjects: formValueToId(props.filters.destinationProjects),
    destinationPlans: formValueToId(props.filters.destinationPlans),
    destinationGlobalClusters: formValueToId(
      props.filters.destinationGlobalClusters
    ),
    destinationEmergencies: formValueToId(props.filters.destinationEmergencies),
    destinationUsageYears: formValueToId(props.filters.destinationUsageYears),
    sourceCountries: formValueToId(props.filters.sourceCountries),
    sourceOrganizations: formValueToId(props.filters.sourceOrganizations),
    sourceUsageYears: formValueToId(props.filters.sourceUsageYears),
    sourceProjects: formValueToId(props.filters.sourceProjects),
    sourcePlans: formValueToId(props.filters.sourcePlans),
    sourceGlobalClusters: formValueToId(props.filters.sourceGlobalClusters),
    sourceEmergencies: formValueToId(props.filters.sourceEmergencies),
    includeChildrenOfParkedFlows: props.filters.includeChildrenOfParkedFlows,
  };
  const {
    amountUSD,
    destinationCountries,
    destinationEmergencies,
    destinationGlobalClusters,
    destinationOrganizations,
    destinationPlans,
    destinationProjects,
    destinationUsageYears,
    flowActiveStatus,
    flowId,
    flowLegacyId,
    flowStatus,
    flowType,
    includeChildrenOfParkedFlows,
    keywords,
    reporterReferenceCode,
    sourceCountries,
    sourceEmergencies,
    sourceGlobalClusters,
    sourceOrganizations,
    sourcePlans,
    sourceProjects,
    sourceSystemId,
    sourceUsageYears,
  } = typedFormFields;
  const parseCategories = (
    categories: {
      values: string | undefined;
      group: categories.CategoryGroup;
    }[]
  ) => {
    const res: { name: string; group: string }[] = [];
    categories.map((category) => {
      if (category.values) {
        res.push({ name: category.values, group: category.group });
      }
    });
    return res;
  };

  const parseFlowObjects = (
    flowObjects: {
      values: string[] | undefined;
      refDirection: 'source' | 'destination';
      objectType:
        | 'location'
        | 'organization'
        | 'usageYear'
        | 'project'
        | 'plan'
        | 'globalCluster'
        | 'emergency';
    }[]
  ): flows.FlowObject[] => {
    const res: flows.FlowObject[] = [];

    flowObjects.map((flows) => {
      if (flows.values) {
        res.push(
          ...flows.values.map((value) => ({
            objectID: parseInt(value),
            refDirection: flows.refDirection,
            objectType: flows.objectType,
          }))
        );
      }
    });
    return res;
  };

  const parsedKeywords: { values: string; group: 'keywords' }[] = keywords.map(
    (keyword) => {
      return { values: keyword, group: 'keywords' };
    }
  );
  const categories = parseCategories([
    ...parsedKeywords,
    { values: flowStatus, group: 'flowStatus' },
    { values: flowType, group: 'flowType' },
  ]);

  const flowObjects: flows.FlowObject[] = parseFlowObjects([
    {
      values: destinationCountries,
      refDirection: 'destination',
      objectType: 'location',
    },
    {
      values: destinationOrganizations,
      refDirection: 'destination',
      objectType: 'organization',
    },
    {
      values: destinationUsageYears,
      refDirection: 'destination',
      objectType: 'usageYear',
    },
    {
      values: destinationProjects,
      refDirection: 'destination',
      objectType: 'project',
    },
    {
      values: destinationPlans,
      refDirection: 'destination',
      objectType: 'plan',
    },
    {
      values: destinationGlobalClusters,
      refDirection: 'destination',
      objectType: 'globalCluster',
    },
    {
      values: destinationEmergencies,
      refDirection: 'destination',
      objectType: 'emergency',
    },
    {
      values: sourceCountries,
      refDirection: 'source',
      objectType: 'location',
    },
    {
      values: sourceOrganizations,
      refDirection: 'source',
      objectType: 'organization',
    },
    {
      values: sourceUsageYears,
      refDirection: 'source',
      objectType: 'usageYear',
    },
    {
      values: sourceProjects,
      refDirection: 'source',
      objectType: 'project',
    },
    {
      values: sourcePlans,
      refDirection: 'source',
      objectType: 'plan',
    },
    {
      values: sourceGlobalClusters,
      refDirection: 'source',
      objectType: 'globalCluster',
    },
    {
      values: sourceEmergencies,
      refDirection: 'source',
      objectType: 'emergency',
    },
  ]);

  return [
    props.filters,
    {
      ...(flowActiveStatus !== ''
        ? { activeStatus: { name: flowActiveStatus } }
        : {}),
      ...(flowId !== '' ? { flowID: parseInt(flowId) } : {}),
      ...(amountUSD !== null ? { amountUSD: amountUSD } : {}),
      ...(flowLegacyId !== null ? { legacyID: `${flowLegacyId}` } : {}),
      ...(reporterReferenceCode !== null
        ? { reporterRefCode: `${reporterReferenceCode}` }
        : {}),
      ...(sourceSystemId !== null
        ? { sourceSystemID: `${sourceSystemId}` }
        : {}),
      ...(categories.length > 0 ? { categories: categories } : {}),
      ...(flowObjects.length > 0 ? { flowObjects: flowObjects } : {}),
      includeChildrenOfParkedFlows,
    },
  ];
};

interface ActiveFilter {
  label: string;
  fieldName: string;
  value: string;
}
export default function FlowsTable(props: FlowsTableProps) {
  const env = getEnv();
  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = [10, 25, 50, 100];
  const filtersObject = parseFilters(props);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

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
    filters: JsonParam,
  });

  useEffect(() => {
    if (filtersObject?.[0]) {
      const filters = filtersObject[0];
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
            typedFieldValue = fieldValue.map((x) => x.label).join(',');
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

        setQuery({
          ...query,
          page: 0,
          filters: JSON.stringify(filtersObject[1]),
        });
      }
    }

    load();
  }, [props.filters, setQuery]);

  const [state, load] = useDataLoader([query], () =>
    env.model.flows.searchFlows({
      flowSearch: {
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
        flowList: props.flowList,
        ...JSON.parse(query.filters),
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
                    title={
                      <div style={{ textAlign: 'left', width: 'auto' }}>
                        {activeFilter.value.split(',').map((x) => (
                          <li
                            style={{
                              textAlign: 'left',
                              marginTop: '0',
                              marginBottom: '0',
                              listStyle:
                                activeFilter.value.split(',').length > 1
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
                      onDelete={() => console.log('close')}
                      deleteIcon={<CancelRoundedIcon />}
                    />
                  </Tooltip>
                ))}
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
                        {props.headers.map((header) => (
                          <TableCell
                            size="small"
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
                      {data.flows.map((row) => (
                        <TableRow key={`${row.id}v${row.versionID}`}>
                          {props.headers.map((column) => {
                            switch (column.id) {
                              case 'flow.id':
                                return (
                                  <TableCell
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
                                    size="small"
                                    data-test="flows-table-external-reference"
                                  >
                                    {row.externalReference?.systemID || '--'}
                                  </TableCell>
                                );
                              case 'flow.amountUSD':
                                return (
                                  <TableCell
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
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          data-test="flows-table-pagination"
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
              </Box>
            </>
          )}
        </StyledLoader>
      )}
    </AppContext.Consumer>
  );
}
