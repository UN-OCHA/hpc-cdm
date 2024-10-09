import tw from 'twin.macro';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

const WarningContainer = tw.div`
  border border-solid
  border-yellow-600
  flex
  rounded-[4px]
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

const FlowLinkWarning = ({ text }: { text: string }) => {
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
      <WarningText>{text}</WarningText>
    </WarningContainer>
  );
};

export default FlowLinkWarning;
