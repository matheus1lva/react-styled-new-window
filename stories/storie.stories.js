import React from 'react';
import styled from 'styled-components';

import { StyledComponents } from './MyComponent';

export default {
  title: 'styled-components',
  component: styledComponents
}

const Div = styled.div`
  background: red;
`;

export const styledComponents = () => {
   return (
    <StyledComponents />
   )
};
