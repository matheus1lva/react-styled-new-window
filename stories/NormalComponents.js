import React from 'react';
import { StyledWindowPortal } from '../src/index';


export const NormalComponents = () => {
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
            <StyledWindowPortal
              onClose={() =>
                setWindow(false)
              }
              autoClose={autoClose}
              copyStyles={true}
            >
              <div id={"123123"}>fantastic</div>
            </StyledWindowPortal>
          )}
        </div>
      );
}