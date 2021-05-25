import styled, { css } from 'styled-components';

export const ComboboxRoot = styled.ul<{ isOpen: boolean }>`
  ${({ isOpen }) =>
    isOpen &&
    css`
      top: -9999px;
      left: -9999px;
      position: absolute;
      padding: 0;
      margin: 0;
      z-index: 11;
      background: white;
      width: 300px;
      border-radius: 0 0 2px 2px;
      box-shadow: rgba(0, 0, 0, 0.133) 0 3.2px 7.2px 0,
        rgba(0, 0, 0, 0.11) 0 0.6px 1.8px 0;
    `}
`;

export const ComboboxItem = styled.div<{ highlighted: boolean }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 400;
  padding: 0 8px;
  border-radius: 0;
  min-height: 36px;
  user-select: none;
  color: rgb(32, 31, 30);
  background: ${({ highlighted }) =>
    !highlighted ? 'transparent' : 'rgb(237, 235, 233)'};
  cursor: pointer;

  :hover {
    background-color: ${({ highlighted }) =>
      !highlighted ? 'rgb(243, 242, 241)' : 'rgb(237, 235, 233)'};
  }
`;
