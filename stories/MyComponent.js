import React from 'react';
import styled from 'styled-components';

import { ReactNewWindowStyles } from '../src/index';

const Div = styled.div`
  background: red;
`;

export const StyledComponents = () => {
    const [window, setWindow] = React.useState(false);
    const [autoClose, setAutoClose] = React.useState(false);
    return (
        <div>
          <button
            onClick={() =>
              setWindow((prev) => {
                return !prev;
              })
            }
          >
            Click me to {window ? 'close' : 'open'} the window
          </button>
  
          <p>
            <label>
              <input
                type="checkbox"
                checked={autoClose}
                onChange={() =>
                  setAutoClose((prev) => !prev)
                }
              />
              Auto close child window when parent is closed
            </label>
          </p>
  
          {window && (
            <ReactNewWindowStyles
              onClose={() =>
                setWindow(false)
              }
              autoClose={autoClose}
            >
              <Div>fantastic</Div>
            </ReactNewWindowStyles>
          )}
        </div>
      );
};