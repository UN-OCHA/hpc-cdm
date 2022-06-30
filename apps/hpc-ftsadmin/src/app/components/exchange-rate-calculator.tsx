import {
  alpha,
  Button,
  ButtonBase,
  ButtonProps,
  Collapse,
  Link,
  styled as muiStyled,
  TextField,
} from '@mui/material';
import { Box } from '@mui/system';
import { C, dataLoader } from '@unocha/hpc-ui';
import { forwardRef, useMemo, useState } from 'react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { getEnv } from '../context';

const LinkStyledButton = muiStyled(ButtonBase)(({ theme }) => ({
  fontSize: 'inherit',
  fontFamily: 'inherit',
  color: theme.palette.primary.main,
  outline: 'revert',
  textDecoration: 'underline',
  textDecorationColor: alpha(theme.palette.primary.dark, 0.4),
}));
interface Props {
  strings: {
    amountUSD: string;
    calculateExchangeRate: string;
    calculateOriginalCurrency: string;
    calculateUSD: string;
    exchangeRateUsed: string;
    fundingAmountOriginal: string;
    toggle: string;
    treasuryLinkText: string;
    loader: {
      loading: string;
      error: string;
      retry: string;
      notFound: {
        title: string;
        info: string;
      };
    };
  };
}

export default function ExchangeRateCalculator(props: Props) {
  const { strings } = props;
  const [expanded, setExpanded] = useState(false);
  const [amountUSD, setAmountUSD] = useState<string | null>(null);
  const [exchangeRate, setExhangeRate] = useState<string | null>(null);
  const [origAmount, setOrigAmount] = useState<string | null>(null);

  const CalculateButton = useMemo(
    () =>
      forwardRef<HTMLAnchorElement, ButtonProps>((buttonProps, ref) => {
        let handleClick: (() => void) | null = null;
        let text = strings.calculateUSD;

        if (exchangeRate && origAmount) {
          handleClick = () =>
            setAmountUSD(
              (parseFloat(origAmount) / parseFloat(exchangeRate)).toFixed(0)
            );
        } else if (amountUSD && exchangeRate) {
          handleClick = () =>
            setOrigAmount(
              (parseFloat(exchangeRate) * parseFloat(amountUSD)).toFixed(0)
            );

          text = strings.calculateOriginalCurrency;
        } else if (amountUSD && origAmount) {
          handleClick = () =>
            setExhangeRate(
              (parseFloat(origAmount) / parseFloat(amountUSD)).toFixed(4)
            );

          text = strings.calculateExchangeRate;
        }

        return (
          <Button
            {...buttonProps}
            {...(handleClick ? { onClick: handleClick } : { disabled: true })}
          >
            {text}
          </Button>
        );
      }),
    [exchangeRate, amountUSD, origAmount, strings]
  );

  const currencyLoader = dataLoader(
    [],
    getEnv().model.currencies.getCurrencies
  );

  return (
    <>
      <C.CurrencyField
        label={strings.amountUSD}
        value={amountUSD}
        onChange={(event) => setAmountUSD(event.target.value)}
        {...(amountUSD && { InputLabelProps: { shrink: true } })}
      />
      <LinkStyledButton
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        disableRipple
      >
        {expanded ? <MdRemove /> : <MdAdd />} {strings.toggle}
      </LinkStyledButton>
      <Collapse in={expanded}>
        <Box sx={{ marginTop: 2, marginBottom: 5 }}>
          <C.SkeletonLoader
            loader={currencyLoader}
            strings={strings.loader}
            skeletonProps={{ height: 56 }}
          >
            {(currencies) => (
              <C.CurrencyField
                currencyOptions={currencies}
                label={strings.fundingAmountOriginal}
                value={origAmount}
                onChange={(event) => setOrigAmount(event.target.value)}
                {...(origAmount && { InputLabelProps: { shrink: true } })}
              />
            )}
          </C.SkeletonLoader>
          <TextField
            label={strings.exchangeRateUsed}
            value={exchangeRate}
            onChange={(event) => setExhangeRate(event.target.value)}
            {...(exchangeRate && { InputLabelProps: { shrink: true } })}
          />
          <Link href="https://treasury.un.org/operationalrates/OperationalRates.php">
            {strings.treasuryLinkText}
          </Link>
        </Box>

        <CalculateButton fullWidth variant="outlined" size="large" />
      </Collapse>
    </>
  );
}
