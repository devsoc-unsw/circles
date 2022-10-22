/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ErrorInfo } from 'react';
import { redirect } from 'react-router-dom';
import { Button, Modal, Space } from 'antd';
import { FEEDBACK_LINK } from 'config/constants';
import S from './styles';

type Props = {
  children?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error({ error, errorInfo });
    this.setState({ errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children } = this.props;

    const resetData = () => {
      // localStorage.clear();
      window.location.href = '/degree-wizard';
    };

    const returnUnharmed = () => {
      window.location.href = '/course-selector';
    };

    const openWarning = () => {
      Modal.warning({
        title: 'Are you sure?',
        content: 'This will delete all course and planner data...',

        okText: 'Reset Data!',
        okCancel: true,
        okButtonProps: {
          danger: true
        },
        onOk: resetData,

        cancelText: 'No, go back!'
      });
    };

    if (hasError) {
      // You can render any custom fallback UI
      return (
        <S.Container>
          <h1>An error has occurred. You should never see this...</h1>
          <S.TextBody>
            <p>
              Unfortunately, due to a bug in Circles, an error has occurred. If you want to help us
              fix this bug, please let us know! We would greatly appreciate it!
            </p>
            <p>
              Fill in this form{' '}
              <a href={FEEDBACK_LINK} target="_blank" rel="noreferrer">
                here
              </a>{' '}
              to inform us how the error occurred! Please also include brief description on the
              steps that led up to the error and a copy of the error messages seen below.
            </p>
            <Space wrap>
              <Button onClick={returnUnharmed} type="primary">
                Return to Circles
              </Button>
              <Button onClick={openWarning} type="primary" danger>
                Reset Data
              </Button>
            </Space>
          </S.TextBody>
          <h3>Error</h3>
          <p>{JSON.stringify(error, Object.getOwnPropertyNames(error))}</p>
          <h3>Error Info</h3>
          <p>{errorInfo?.componentStack.toString()}</p>
        </S.Container>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
