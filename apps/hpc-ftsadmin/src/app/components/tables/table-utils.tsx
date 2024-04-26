import tw from 'twin.macro';
import { LanguageKey, t } from '../../../i18n';
import { FilterKey, Filter, isKey } from '../../utils/parse-filters';
import EllipsisText from '../../utils/ellipsis-text';
import { Chip, IconButton, TableRow, Tooltip } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { C } from '@unocha/hpc-ui';
import { util } from '@unocha/hpc-core';
import { LocalStorageSchema } from '../../utils/local-storage-type';

export type Query = {
  page: number;
  rowsPerPage: number;
  orderBy: string;
  orderDir: string;
  filters: string;
  tableHeaders: string;
  prevPageCursor?: number;
  nextPageCursor?: number;
};

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
  const chipList: Array<JSX.Element> = [];
  let key: keyof typeof tableFilters;
  for (key in tableFilters) {
    const savedKey = key;
    const val = tableFilters[savedKey];
    if (!val) return;
    const { displayValue } = val;
    chipList.push(
      <Tooltip
        key={savedKey}
        title={
          <div style={{ textAlign: 'start', width: 'auto' }}>
            {displayValue.split('<||>').map((filter) => (
              <li
                key={filter}
                style={{
                  textAlign: 'start',
                  marginTop: '0',
                  marginBottom: '0',
                  listStyle:
                    displayValue.split('<||>').length > 1 ? 'inherit' : 'none',
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
                {displayValue.split('<||>').map((filter, index) => (
                  <ChipFilterValues key={index}>
                    <EllipsisText maxWidth={400}>
                      {/\[(.*)\]/.test(filter) // We do this in order to shorten organization names
                        ? filter.match(/\[(.*)\]/)?.[1]
                        : filter}
                    </EllipsisText>
                  </ChipFilterValues>
                ))}
              </div>
            </div>
          }
          size="small"
          color="primary"
          onDelete={() => handleChipDelete(savedKey)}
          deleteIcon={<CancelRoundedIcon sx={tw`-ms-1! me-1!`} />}
        />
      </Tooltip>
    );
  }
  return chipList;
};

/** Handle function to control the information text in the Draggable List components of tables */
export const handleTableSettingsInfoClose = (
  setTableInfoDisplay: React.Dispatch<React.SetStateAction<boolean | undefined>>
) => {
  util.setLocalStorageItem<LocalStorageSchema>('tableSettings', false);
  setTableInfoDisplay(false);
};
