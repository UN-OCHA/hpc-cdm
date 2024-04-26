import {
  Alert,
  Box,
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
} from '@mui/material';
import { organizations } from '@unocha/hpc-data';
import { C, CLASSES, dataLoader } from '@unocha/hpc-ui';
import SettingsIcon from '@mui/icons-material/Settings';
import { LanguageKey, t } from '../../../i18n';
import { AppContext, getEnv } from '../../context';
import React, { useState } from 'react';
import {
  decodeFilters,
  encodeFilters,
  FilterKey,
  isKey,
  parseFormFilters,
  parseOrganizationFilters,
} from '../../utils/parse-filters';
import {
  OrganizationHeaderID,
  TableHeadersProps,
  decodeTableHeaders,
  encodeTableHeaders,
  isCompatibleTableHeaderType,
  isTableHeadersPropsOrganization,
} from '../../utils/table-headers';
import { Strings } from '../../../i18n/iface';
import { parseUpdatedCreatedBy } from '../../utils/map-functions';
import { OrganizationFilterValues } from '../filters/filter-organization-table';
import {
  ChipDiv,
  Query,
  RenderChipsRow,
  StyledLoader,
  TableHeaderButton,
  TableRowClick,
  TopRowContainer,
  handleTableSettingsInfoClose,
} from './table-utils';
import { Link, useNavigate } from 'react-router-dom';
import * as paths from '../../paths';
import { util } from '@unocha/hpc-core';
import { LocalStorageSchema } from '../../utils/local-storage-type';
import tw from 'twin.macro';
import NoResultTable from './no-result';

export interface OrganizationTableProps {
  headers: TableHeadersProps<OrganizationHeaderID>[];
  initialValues: OrganizationFilterValues;
  rowsPerPageOption: number[];
  query: Query;
  setQuery: (newQuery: Query) => void;
}

export default function OrganizationTable(props: OrganizationTableProps) {
  const env = getEnv();
  const chipSpacing = { m: 0.5 };
  const rowsPerPageOptions = props.rowsPerPageOption;
  const filters = decodeFilters(props.query.filters, props.initialValues);
  const [tableInfoDisplay, setTableInfoDisplay] = useState(
    util.getLocalStorageItem<LocalStorageSchema>('tableSettings', true)
  );
  const parsedFilters = parseFormFilters<
    keyof Strings['components']['organizationsFilter']['filters'],
    OrganizationFilterValues
  >(filters, props.initialValues);
  const [query, setQuery] = [props.query, props.setQuery];
  const [openSettings, setOpenSettings] = useState(false);
  const navigate = useNavigate();
  const state = dataLoader([query], () =>
    env.model.organizations.searchOrganizations({
      search: {
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
        ...parseOrganizationFilters(parsedFilters).search,
      },
    })
  );

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
    const nonSafeTypedTableHeaders = decodeTableHeaders(
      query.tableHeaders,
      lang,
      'organizations'
    );
    const tableHeaders = isTableHeadersPropsOrganization(
      nonSafeTypedTableHeaders
    )
      ? nonSafeTypedTableHeaders
      : [];
    return (
      <>
        {data.organizations.map((row) => (
          <TableRowClick
            key={`${row.id}`}
            onClick={() => navigate(paths.organization(row.id))}
          >
            {tableHeaders.map((column) => {
              if (!column.active) {
                return null;
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
                            cat.parentID === null
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
                            cat.parentID !== null
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
                        ? row.locations.map(
                            (x, index) =>
                              `${x.name}${
                                index === row.locations.length - 1 ? '' : ', '
                              }`
                          )
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
    data: organizations.SearchOrnganizationResult;
  }) => {
    const nonSafeTypedTableHeaders = decodeTableHeaders(
      query.tableHeaders,
      lang,
      'organizations'
    );
    const tableHeaders = isTableHeadersPropsOrganization(
      nonSafeTypedTableHeaders
    )
      ? nonSafeTypedTableHeaders
      : [];
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
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
          {(data) => {
            if (parseInt(data.count) === 0) {
              return <NoResultTable />;
            }
            return (
              <>
                <ChipDiv>
                  <RenderChipsRow
                    tableType="organizationsFilter"
                    tableFilters={parsedFilters}
                    lang={lang}
                    chipSpacing={chipSpacing}
                    handleChipDelete={handleChipDelete}
                  />
                  <TopRowContainer>
                    <Link
                      style={{ alignSelf: 'center' }}
                      to={paths.addOrganization()}
                    >
                      Add Organization
                    </Link>
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
                            query,
                            setQuery
                          )}
                          onClick={(element) => {
                            if (isCompatibleTableHeaderType(element)) {
                              setQuery({
                                ...query,
                                tableHeaders: encodeTableHeaders(
                                  element,
                                  'organizations',
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
                            <Alert
                              severity="info"
                              onClose={() =>
                                handleTableSettingsInfoClose(
                                  setTableInfoDisplay
                                )
                              }
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
                          }
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
                    <TableComponent lang={lang} data={data} />
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
            );
          }}
        </StyledLoader>
      )}
    </AppContext.Consumer>
  );
}
