import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { StyleSheetManager } from 'styled-components';

type WindowProps = {
  toolbar?: Boolean | ((props: WindowProps, window: Window) => Boolean);
  location?: Boolean | ((props: WindowProps, window: Window) => Boolean);
  directories?: Boolean | ((props: WindowProps, window: Window) => Boolean);
  status?: Boolean | ((props: WindowProps, window: Window) => Boolean);
  menubar?: Boolean | ((props: WindowProps, window: Window) => Boolean);
  scrollbars?: Boolean | ((props: WindowProps, window: Window) => Boolean);
  resizable?: Boolean | ((props: WindowProps, window: Window) => Boolean);
  width?: Number | ((props: WindowProps, window: Window) => Number);
  height?: Number | ((props: WindowProps, window: Window) => Number);
  top?: Number | ((props: WindowProps, window: Window) => Number);
  left?: Number | ((props: WindowProps, window: Window) => Number);
};

type Props = {
  onClose: ((this: WindowEventHandlers, ev: Event) => any) | null;
  autoClose: boolean;
  title?: string;
  name?: string;
  windowProps?: WindowProps;
  children: ReactNode;
  copyStyles: boolean;
};

type State = {
  externalWindow: Window | null;
};

class ReactNewWindowStyles extends React.PureComponent<Props, State> {
  static defaultProps = {
    onClose: () => {},
    title: 'New Window',
    name: '',
    copyStyles: false,
    windowProps: {
      toolbar: false,
      location: false,
      directories: false,
      status: false,
      menubar: false,
      scrollbars: true,
      resizable: true,
      width: 500,
      height: 400,
      top: (props: WindowProps, window: Window) =>
        window.screen.height / 2 - window.outerHeight / 2,
      left: (props: WindowProps, window: Window) =>
        window.screen.width / 2 - window.outerWidth / 2,
    },
  };

  private container: HTMLElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      externalWindow: null,
    };
    this.container = document.createElement('div');
  }

  componentDidMount() {
    this.setState(
      {
        externalWindow: window.open(
          '',
          this.props.name,
          this.windowPropsToString()
        ),
      },
      () => {
        if (this.state.externalWindow != null) {
          this.state.externalWindow.onunload = this.props.onClose;

          const title = this.state.externalWindow.document.createElement(
            'title'
          );
          title.innerText = !!this.props.title ? this.props.title : '';
          this.state.externalWindow.document.head.appendChild(title);

          this.state.externalWindow.document.body.appendChild(this.container);

          if (this.props.copyStyles) {
            // @ts-ignore
            setTimeout(
              () => copyStyles(document, this.state.externalWindow.document),
              0
            );
          }

          // Inject global style
          Array.from(document.head.getElementsByTagName('STYLE'))
            .filter(
              style =>
                (style as HTMLStyleElement).innerText.indexOf(
                  '\n/* sc-component-id: sc-global'
                ) != -1
            )
            .forEach(style => {
              if (this.state.externalWindow != null) {
                this.state.externalWindow.document.head.appendChild(
                  style.cloneNode(true)
                );
              }
            });
        }
      }
    );

    if (this.props.autoClose) {
      window.addEventListener('unload', this.closeExternalWindow);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.autoClose && this.props.autoClose) {
      // autoClose became enabled
      window.addEventListener('unload', this.closeExternalWindow);
    }

    if (prevProps.autoClose && !this.props.autoClose) {
      // autoClose became disabled
      window.removeEventListener('unload', this.closeExternalWindow);
    }
  }

  componentWillUnmount() {
    if (this.props.autoClose) {
      window.removeEventListener('unload', this.closeExternalWindow);
    }

    this.closeExternalWindow();
  }

  closeExternalWindow = () => {
    if (this.state.externalWindow && !this.state.externalWindow.closed) {
      this.state.externalWindow.close();
    }
  };

  windowPropsToString() {
    const mergedProps: { [key: string]: any } = {
      ...ReactNewWindowStyles.defaultProps.windowProps,
      ...this.props.windowProps,
    };

    return Object.keys(mergedProps)
      .map(key => {
        switch (typeof mergedProps[key]) {
          case 'function':
            return `${key}=${mergedProps[key].call(this, mergedProps, window)}`;
          case 'boolean':
            return `${key}=${mergedProps[key] ? 'yes' : 'no'}`;
          default:
            return `${key}=${mergedProps[key]}`;
        }
      })
      .join(',');
  }

  render() {
    if (!!this.state.externalWindow) {
      return (
        <StyleSheetManager target={this.state.externalWindow.document.head}>
          <div>
            {ReactDOM.createPortal(this.props.children, this.container)}
          </div>
        </StyleSheetManager>
      );
    } else {
      return null;
    }
  }
}

function copyStyles(source: any, target: any) {
  Array.from(source.styleSheets).forEach((styleSheet: any) => {
    // For <style> elements
    let rules;
    try {
      rules = styleSheet.cssRules;
    } catch (err) {
      console.error(err);
    }
    if (rules) {
      const newStyleEl = source.createElement('style');

      // Write the text of each rule into the body of the style element
      Array.from(styleSheet.cssRules).forEach((cssRule: any) => {
        const { cssText, type } = cssRule;
        let returnText = cssText;
        // Check if the cssRule type is CSSImportRule (3) or CSSFontFaceRule (5) to handle local imports on a about:blank page
        // '/custom.css' turns to 'http://my-site.com/custom.css'
        if ([3, 5].includes(type)) {
          returnText = cssText
            .split('url(')
            .map((line: any) => {
              if (line[1] === '/') {
                return `${line.slice(0, 1)}${
                  window.location.origin
                }${line.slice(1)}`;
              }
              return line;
            })
            .join('url(');
        }
        newStyleEl.appendChild(source.createTextNode(returnText));
      });

      target.head.appendChild(newStyleEl);
    } else if (styleSheet.href) {
      // for <link> elements loading CSS from a URL
      const newLinkEl = source.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      target.head.appendChild(newLinkEl);
    }
  });
}

export { ReactNewWindowStyles };
