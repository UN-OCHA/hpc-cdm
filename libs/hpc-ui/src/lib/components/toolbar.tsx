import { styled } from '../theme';

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  padding: ${(p) => p.theme.marginPx.md}px 0 ${(p) => p.theme.marginPx.md}px
    ${(p) => p.theme.marginPx.sm}px;
`;

export default Toolbar;
