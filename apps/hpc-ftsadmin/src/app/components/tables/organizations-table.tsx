import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';

import { type organizations } from '@unocha/hpc-data';
import { C, CLASSES, useDataLoader } from '@unocha/hpc-ui';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../../i18n';
import { type Strings } from '../../../i18n/iface';
import { AppContext, getEnv } from '../../context';
import paths from '../../paths';
import { EMPTY_CELL } from '../../utils/constants';
import {
  decodeFilters,
  encodeFilters,
  type FilterKey,
  isKey,
  parseFormFilters,
  parseOrganizationFilters,
} from '../../utils/parse-filters';
import {
  decodeTableHeaders,
  encodeTableHeaders,
  getDraggableTableHeaders,
  isCompatibleTableHeaderType,
  type OrganizationHeaderID,
} from '../../utils/table-headers';
import { parseUpdatedCreatedBy, valueToInteger } from '../../utils/utils';
import { type OrganizationFilterValues } from '../filters/filter-organization-table';
import InfoAlert from '../info-alert';
import MergeModal from '../merge-modal';
import NoResultTable from './no-result';
import {
  ChipDiv,
  type OrganizationQuery,
  RenderChipsRow,
  type SetQuery,
  StickyTableHead,
  StyledLoader,
  TableHeaderButton,
  TableRowClick,
  TopRowContainer,
} from './table-utils';

const ButtonWrapper = tw.div`
  self-center
  me-4
`;
export interface OrganizationTableProps {
  initialValues: OrganizationFilterValues;
  rowsPerPageOptions: readonly number[];
  query: OrganizationQuery;
  setQuery: SetQuery<OrganizationQuery>;
  abortSignal: AbortSignal;
}

export default function OrganizationTable(props: OrganizationTableProps) {
  const { initialValues, rowsPerPageOptions, abortSignal } = props;
  const env = getEnv();

  const chipSpacing = { m: 0.5 };

  const [query, setQuery] = [props.query, props.setQuery];
  const filters = decodeFilters(query.filters, initialValues);
  const parsedFilters = parseFormFilters<
    keyof Strings['components']['organizationsFilter']['filters'],
    OrganizationFilterValues
  >(filters, initialValues);

  const [shouldOpenSettings, setShouldOpenSettings] = useState(false);
  const navigate = useNavigate();

  const { tableHeaders: queryTableHeaders, ...observableQueryParams } = query;

  const [state, load] = useDataLoader([observableQueryParams], () =>
    env.model.organizations.searchOrganizations({
      search: {
        limit: query.rowsPerPage,
        offset: query.page * query.rowsPerPage,
        orderBy: query.orderBy,
        orderDir: query.orderDir,
        signal: abortSignal,
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
        filters: encodeFilters(filters, initialValues),
      });
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
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

  const TableRowsComponent = ({
    lang,
    data,
  }: {
    lang: LanguageKey;
    data: organizations.SearchOrganizationResult;
  }) => {
    const tableHeaders = decodeTableHeaders({
      queryParam: queryTableHeaders,
      lang,
      table: 'organizations',
    });
    return (
      <>
        {data.organizations.map((row) => (
          <TableRowClick
            key={`${row.id}`}
            onClick={() => navigate(paths.organization(row.id))}
            sx={{
              '&:hover': {
                backgroundColor: tw`bg-unocha-primary bg-opacity-10`,
              },
            }}
            data-test={`organizations-table-row-${row.id}`}
          >
            {tableHeaders.map((column) => {
              if (!column.isActive) {
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
                      data-test="organizations-table-id"
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
                      data-test="organizations-table-name"
                    >
                      {row.name}
                    </TableCell>
                  );
                case 'organization.abbreviation':
                  return (
                    <TableCell
                      key={`${row.id}_organization.abbreviation`}
                      size="small"
                      data-test="organizations-table-abbreviation"
                    >
                      {row.abbreviation}
                    </TableCell>
                  );
                case 'organization.type':
                  return (
                    <TableCell
                      key={`${row.id}_organization.type`}
                      size="small"
                      data-test="organizations-table-type"
                    >
                      {(() => {
                        const res = row.categories.filter(
                          (cat) =>
                            cat.group === 'organizationType' &&
                            cat.parentID === null
                        );
                        return res.length > 0
                          ? res.map((x) => x.name)
                          : EMPTY_CELL;
                      })()}
                    </TableCell>
                  );
                case 'organization.subType':
                  return (
                    <TableCell
                      key={`${row.id}_organization.subType`}
                      size="small"
                      data-test="organizations-table-subType"
                    >
                      {(() => {
                        const res = row.categories.filter(
                          (cat) =>
                            cat.group === 'organizationType' &&
                            cat.parentID !== null
                        );
                        return res.length > 0
                          ? res.map((x) => x.name)
                          : EMPTY_CELL;
                      })()}
                    </TableCell>
                  );
                case 'organization.location':
                  return (
                    <TableCell
                      key={`${row.id}_organization.location`}
                      size="small"
                      data-test="organizations-table-location"
                    >
                      {row.locations.length > 0
                        ? row.locations.map(
                            (x, index) =>
                              `${x.name}${
                                index === row.locations.length - 1 ? '' : ', '
                              }`
                          )
                        : EMPTY_CELL}
                    </TableCell>
                  );
                case 'organization.createdBy':
                  return (
                    <TableCell
                      key={`${row.id}_organization.createdBy`}
                      size="small"
                      data-test="organizations-table-created-by"
                    >
                      {parseUpdatedCreatedBy(row.create)}
                      {}
                    </TableCell>
                  );
                case 'organization.updatedBy':
                  return (
                    <TableCell
                      key={`${row.id}_organization.updatedBy`}
                      size="small"
                      data-test="organizations-table-updated-by"
                    >
                      {parseUpdatedCreatedBy(row.update)}
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
    data: organizations.SearchOrganizationResult;
  }) => {
    const tableHeaders = decodeTableHeaders({
      queryParam: queryTableHeaders,
      lang,
      table: 'organizations',
    });
    return (
      <Table size="small">
        <StickyTableHead>
          <TableRow>
            {tableHeaders.map((header) => {
              if (!header.isActive) {
                return null;
              }
              return (
                <TableCell
                  size="small"
                  key={`${header.identifierID}_${header.label}`}
                  data-test={`organization-table-header-${header.label}`}
                  {...(header.isSortable &&
                    query.orderBy === header.identifierID && {
                      'aria-sort':
                        query.orderDir === 'ASC' ? 'ascending' : 'descending',
                    })}
                >
                  {header.isSortable ? (
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
                          (s) => s.components.organizationsTable.sortBy
                        )}
                        <br />
                      </span>
                      {t.t(
                        lang,
                        (s) =>
                          s.components.organizationsTable.headers[header.label]
                      )}
                    </TableSortLabel>
                  ) : (
                    t.t(
                      lang,
                      (s) =>
                        s.components.organizationsTable.headers[header.label]
                    )
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </StickyTableHead>
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
              ...t.get(lang, (s) => s.components.organizationsTable.notFound),
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
                    <ButtonWrapper>
                      <C.ButtonLink
                        to={paths.addOrganization()}
                        text={t.t(
                          lang,
                          (s) => s.components.organizationsTable.addOrganization
                        )}
                        color="neutral"
                      />
                    </ButtonWrapper>
                    <MergeModal type="organization" load={load} />
                    <TableHeaderButton
                      size="small"
                      onClick={() => setShouldOpenSettings(!shouldOpenSettings)}
                    >
                      <SettingsIcon />
                    </TableHeaderButton>
                    <Modal
                      open={shouldOpenSettings}
                      onClose={() => setShouldOpenSettings(!shouldOpenSettings)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          maxHeight: '70vh',
                          overflowY: 'auto',
                          borderRadius: '10px',
                        }}
                      >
                        <C.DraggableList
                          title={t.t(
                            lang,
                            (s) =>
                              s.components.organizationsTable.tableSettings
                                .title
                          )}
                          buttonText={t.t(
                            lang,
                            (s) =>
                              s.components.organizationsTable.tableSettings.save
                          )}
                          queryValues={getDraggableTableHeaders({
                            queryParam: queryTableHeaders,
                            lang,
                            table: 'organizations',
                            query,
                            setQuery,
                          })}
                          onClick={(element) => {
                            if (isCompatibleTableHeaderType(element)) {
                              setQuery({
                                ...query,
                                tableHeaders: encodeTableHeaders({
                                  headers: element,
                                  table: 'organizations',
                                  query,
                                  setQuery,
                                }),
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
                                (s) =>
                                  s.components.flowsTable.tableSettings.info
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
                      count={valueToInteger(data.count)}
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
                  sx={tw`shrink-0`}
                  data-test="organization-table-pagination"
                  rowsPerPageOptions={rowsPerPageOptions}
                  component="div"
                  count={valueToInteger(data.count)}
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
