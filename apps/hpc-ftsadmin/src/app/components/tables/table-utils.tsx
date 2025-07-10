import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Chip, IconButton, TableHead, TableRow, Tooltip } from '@mui/material';
import { C } from '@unocha/hpc-ui';
import tw from 'twin.macro';
import { type LanguageKey, t } from '../../../i18n';
import { SPECIAL_SEPARATOR } from '../../utils/constants';
import {
  type Filter,
  type FilterKey,
  type FilterValue,
  type Filters,
  isKey,
} from '../../utils/parse-filters';
import type {
  FlowHeaderID,
  KeywordHeaderID,
  OrganizationHeaderID,
} from '../../utils/table-headers';
import EllipsisText from '../ellipsis-text';
import { FLOWS_FILTER_INITIAL_VALUES } from '../filters/filter-flows-table';
import { ORGANIZATIONS_FILTER_INITIAL_VALUES } from '../filters/filter-organization-table';
import { PENDING_FLOWS_FILTER_INITIAL_VALUES } from '../filters/filter-pending-flows-table';

export type Query = {
  orderDir: 'ASC' | 'DESC';
  tableHeaders: string;
};

export type FlowQuery = Query & {
  page: number;
  rowsPerPage: number;
  orderBy: FlowHeaderID;
  filters: string;
};

export type OrganizationQuery = Query & {
  page: number;
  rowsPerPage: number;
  orderBy: OrganizationHeaderID;
  filters: string;
};

export type KeywordQuery = Query & {
  orderBy: KeywordHeaderID;
};

export type SetQuery<T extends Query> = (newQuery: T) => void;

export const StyledLoader = tw(C.Loader)`
  mx-auto
`;
export const ChipDiv = tw.div`
  relative
  w-full
`;
export const TopRowContainer = tw.div`
  flex
  justify-end
`;

export const StickyTableHead = tw(TableHead)`
  sticky
  top-0
  z-10
  bg-white
`;

export const TableHeaderButton = tw(IconButton)`
  h-min
  self-center
  mx-2
`;
export const TableRowClick = tw(TableRow)`
  transition-all
  hover:shadow-md
  bg-blend-hue
  hover:bg-opacity-20
  hover:cursor-pointer
`;
const ChipFilterValues = tw.div`
  bg-unocha-secondary-light
  inline-flex
  mx-1
  px-2
  rounded-full
`;

const ORGANIZATION_ABBREVIATION_REGEX = /\[(.*)\]/;

export const RenderChipsRow = ({
  tableFilters,
  lang,
  handleChipDelete,
  tableType,
  chipSpacing = { m: 0.5 },
}: {
  tableFilters: Filter<FilterKey>;
  lang: LanguageKey;
  handleChipDelete: <T extends FilterKey>(fieldName: T) => void;
  tableType: 'organizationsFilter' | 'flowsFilter' | 'pendingFlowsFilter';
  chipSpacing?: { m: number };
}) => {
  const isKeyOf = <T extends Filters>(
    initialValue: T,
    key: FilterKey
  ): key is keyof T & FilterKey => {
    return Object.keys(initialValue).includes(key.toString());
  };

  const isValueInInitialValue = (
    val: {
      value: FilterValue;
      displayValue: string;
    },
    key: FilterKey
  ) => {
    switch (tableType) {
      case 'flowsFilter': {
        if (isKeyOf(FLOWS_FILTER_INITIAL_VALUES, key)) {
          return (
            JSON.stringify(FLOWS_FILTER_INITIAL_VALUES[key]) ===
            JSON.stringify(val.value)
          );
        }
        break;
      }
      case 'organizationsFilter': {
        if (isKeyOf(ORGANIZATIONS_FILTER_INITIAL_VALUES, key)) {
          return (
            JSON.stringify(ORGANIZATIONS_FILTER_INITIAL_VALUES[key]) ===
            JSON.stringify(val.value)
          );
        }
        break;
      }
      case 'pendingFlowsFilter': {
        if (isKeyOf(PENDING_FLOWS_FILTER_INITIAL_VALUES, key)) {
          return (
            JSON.stringify(PENDING_FLOWS_FILTER_INITIAL_VALUES[key]) ===
            JSON.stringify(val.value)
          );
        }
        break;
      }
    }
  };

  const chipList: JSX.Element[] = [];
  let key: keyof typeof tableFilters;
  for (key in tableFilters) {
    const savedKey = key;
    const val = tableFilters[savedKey];
    if (!val) {
      return;
    }
    const { displayValue } = val;
    chipList.push(
      <Tooltip
        key={savedKey}
        title={
          <div style={{ textAlign: 'start', width: 'auto' }}>
            {displayValue.split(SPECIAL_SEPARATOR).map((filter) => (
              <li
                key={filter}
                style={{
                  textAlign: 'start',
                  marginTop: '0',
                  marginBottom: '0',
                  listStyle:
                    displayValue.split(SPECIAL_SEPARATOR).length > 1
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
          key={`chip_${savedKey}`}
          sx={{
            ...chipSpacing,
            position: 'relative',
          }}
          label={
            <div>
              <span>
                {`${t.t(lang, (s) =>
                  isKey(s.components[tableType].filters, savedKey)
                    ? s.components[tableType].filters[savedKey]
                    : ''
                )}: `}
              </span>
              <div
                style={{
                  display: 'inline-block',
                  maxWidth: '1000px',
                }}
              >
                {displayValue.split(SPECIAL_SEPARATOR).map((filter, index) => (
                  <ChipFilterValues key={index}>
                    <EllipsisText maxWidth={400}>
                      {ORGANIZATION_ABBREVIATION_REGEX.test(filter) // We do this in order to shorten organization names
                        ? filter.match(ORGANIZATION_ABBREVIATION_REGEX)?.[1]
                        : filter}
                    </EllipsisText>
                  </ChipFilterValues>
                ))}
              </div>
            </div>
          }
          size="small"
          color="primary"
          onDelete={
            isValueInInitialValue(val, savedKey)
              ? undefined
              : () => handleChipDelete(savedKey)
          }
          deleteIcon={<CancelRoundedIcon sx={tw`-ms-1! me-1!`} />}
        />
      </Tooltip>
    );
  }
  return chipList;
};
