import { styled } from '../theme';

export default styled.button`
  display: inline-flex;
  align-items: center;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 3px 9px;
  font-weight: bold;
  color: #fff;
  background: none;

  > svg {
    margin: -20px 3px;
  }

  > span {
    margin: 0 3px;
  }

  &:hover,
  &:focus {
    opacity: 0.6;
  }
`;
