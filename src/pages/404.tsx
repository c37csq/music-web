import { Button, Result } from 'antd';
import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

const NoFoundPage: React.FC<RouteComponentProps> = (prop) => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <Button type="primary" onClick={() => prop.history.goBack()}>
        返回
      </Button>
    }
  />
);

export default withRouter(NoFoundPage);
