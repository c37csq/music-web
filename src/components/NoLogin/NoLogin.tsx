import * as React from 'react';
import './NoLogin.less';
import { Result, Button } from 'antd';
import Login from '../Login/Login';

interface IState {
  visible: boolean
}

interface IProps {
}

class NoLogin extends React.Component<IProps, IState> {

  state: IState = {
    visible: false
  }

  // 显示登录弹框
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  // 关闭弹框
  closeModal = (): void => {
    this.setState({
      visible: false
    });
  }

  render() {
    const { visible } = this.state;
    return (
      <div style={{height: '100%'}}>
        <Login closeModal={this.closeModal} visible={visible} />
        <Result
          status="403"
          subTitle="对不起，你还没有登录，无法访问此页面"
          extra={
            <div>
              <Button onClick={this.showModal} type="primary">登录</Button>
            </div>
          }
        />
      </div>
    );
  }
}

export default NoLogin;