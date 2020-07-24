import { styled } from '../theme';

export default styled.div`
  display: flex;
  padding: ${(p) => p.theme.marginPx.md}px 0 ${(p) => p.theme.marginPx.md}px
    ${(p) => p.theme.marginPx.sm}px;
`;
