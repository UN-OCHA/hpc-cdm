import tw from 'twin.macro';
import { getContext } from '../../context';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import { t } from '../../../i18n';

const Container = tw.div`text-center w-full flex-col justify-center`;
const NoMarginTopP = tw.p`mt-0`;
const NoMarginBottomH3 = tw.h3`mb-0`;

const NoResultTable = () => {
  const lang = getContext().lang;
  return (
    <Container>
      <PageviewOutlinedIcon fontSize="inherit" sx={tw`text-[75px]`} />
      <NoMarginBottomH3>
        {t.t(lang, (s) => s.components.noResultTable.title)}
      </NoMarginBottomH3>
      <NoMarginTopP>
        {t.t(lang, (s) => s.components.noResultTable.description)}
      </NoMarginTopP>
    </Container>
  );
};
export default NoResultTable;
