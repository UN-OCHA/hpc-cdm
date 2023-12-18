import tw from 'twin.macro';
import { LanguageKey, t } from '../../../i18n';
import {
  FilterKeys,
  ParsedFlowsFilter,
  Filter,
  isKey,
} from '../../utils/parse-filters';
import EllipsisText from '../../utils/ellipsis-text';
import {
  Chip,
  CircularProgress,
  IconButton,
  TableRow,
  Tooltip,
} from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { C, dataLoader } from '@unocha/hpc-ui';
import { getEnv } from '../../context';

export type Query = {
  page: number;
  rowsPerPage: number;
  orderBy: string;
  orderDir: string;
  filters: string;
  tableHeaders: string;
  prevPageCursor?: string;
  nextPageCursor?: string;
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
export const RejectPendingFlowsButton = tw(C.ButtonSubmit)`
mt-8
`;

const ChipFilterValues = tw.div`
bg-unocha-secondary-light
inline-flex
mx-1
px-2
rounded-full
`;
export const RenderChipsRow = ({
  parsedFilters,
  lang,
  handleChipDelete,
  tableType,
  chipSpacing = { m: 0.5 },
}: {
  parsedFilters: Filter<FilterKeys>;
  lang: LanguageKey;
  handleChipDelete: <T extends FilterKeys>(fieldName: T) => void;
  tableType: 'organizationsFilter' | 'flowsFilter' | 'pendingFlowsFilter';
  chipSpacing?: { m: number };
}) => {
  const chipList: Array<JSX.Element> = [];
  let key: keyof typeof parsedFilters;
  for (key in parsedFilters) {
    const savedKey = key;
    const val = parsedFilters[savedKey];
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

const TotalAmountUSDContainer = tw.div`
self-center
`;
const AmountSpan = tw.span`
font-bold
`;
interface TotalAmountUSDProps {
  lang: LanguageKey;
  parsedFilters: ParsedFlowsFilter;
  abortSignal?: AbortSignal;
  setAmount: (value: string) => void;
  amount?: string;
}
export const TotalAmountUSD = ({
  lang,
  parsedFilters,
  abortSignal,
  setAmount,
  amount,
}: TotalAmountUSDProps) => {
  const env = getEnv();
  return (
    <TotalAmountUSDContainer>
      <span>{t.t(lang, (s) => s.components.flowsTable.totalAmount)}</span>
      {!amount ? (
        <C.Loader
          loader={dataLoader([], () =>
            env.model.flows.getTotalAmountUSD({
              ...parsedFilters,
              signal: abortSignal,
            })
          )}
          strings={{
            ...t.get(lang, (s) => s.components.loader),
            notFound: {
              ...t.get(lang, (s) => s.components.notFound),
              ...t.get(lang, (s) => s.components.flowsTable.notFound),
            },
          }}
          customLoadingElement={<CircularProgress size={15} />}
        >
          {(totalAmountUSDData) => {
            setAmount(
              totalAmountUSDData.searchFlowsTotalAmountUSD.totalAmountUSD
            );
            return (
              <AmountSpan>
                {totalAmountUSDData.searchFlowsTotalAmountUSD.totalAmountUSD}{' '}
                USD
              </AmountSpan>
            );
          }}
        </C.Loader>
      ) : (
        <AmountSpan>{amount} USD</AmountSpan>
      )}
    </TotalAmountUSDContainer>
  );
};
