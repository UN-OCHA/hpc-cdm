import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import { Link } from 'react-router';
import tw from 'twin.macro';
import paths from '../../paths';

const WarningContainer = tw.div`
  border border-solid
  border-yellow-600
  flex
  items-center
  rounded-sm
  text-gray-900
  bg-yellow-100
  bg-opacity-50
`;

const IconContainer = tw.div`
  flex
  items-center
  p-1
`;
const WarningText = tw.span`
  p-3
`;

const FlowLinkWarning = ({
  text,
  link,
}: {
  text: string;
  link?: { id: number; versionID: number };
}) => {
  return (
    <WarningContainer>
      <IconContainer>
        <GppMaybeIcon
          style={{
            fontSize: '40px',
            fill: '#D18E00',
          }}
        />
      </IconContainer>
      <WarningText>
        {text}
        {link && (
          <Link
            to={paths.flow(link.id, link.versionID)}
            target="_blank"
          >{`${link.id}v${link.versionID}`}</Link>
        )}
      </WarningText>
    </WarningContainer>
  );
};

export default FlowLinkWarning;
