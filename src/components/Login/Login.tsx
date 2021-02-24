import * as React from 'react';
import { Modal } from 'antd';
import LoginForm from '../LoginForm/LoginForm';
import LoginIndex from '../LoginIndex/LoginIndex';
import RegesterForm from '../RegesterForm/RegesterForm';
import store from '../../store/index';
import { changeLoginStatus } from '../../store/actionCreators';
import ModalDrag from '../ModalDrag/ModalDrag';
import { CloseOutlined } from '@ant-design/icons';

interface IState {
  status: string,
  visible: boolean
}

interface IProps {
  visible: boolean,
  closeModal: Function,
}


class Login extends React.Component<IProps, IState> {

  private regesterForm: React.RefObject<RegesterForm>;
  private loginForm: React.RefObject<LoginForm>;
  constructor(props: IProps) {
    super(props);

    // 获取注册子组件
    this.regesterForm = React.createRef();

    // 获取登录子组件
    this.loginForm = React.createRef();
  }

  state: IState = {
    status: store.getState().status,
    visible: false
  }

  // 点击注册或登录
  changeStatus = (status: string): void => {
    const action = changeLoginStatus(status);
    store.dispatch(action);
    this.setState({ status: store.getState().status })
  }


  // 通过 status 返回 Modal 对应标题
  getTitle = (status: string): string => {
    let title = '';
    switch (status) {
      case 'login':
        title = '账号密码登录';
        break;
      case 'regester':
        title = '用户注册';
        break;
      default:
        title = '登录';
    }
    return title;
  }

  // 设置 Modal 内容
  getModalContent = (status: string) => {
    let content;
    switch (status) {
      case 'login':
        content = <LoginForm closeModal={this.closeModal} ref={this.loginForm} />
        break;
      case 'regester':
        content = <RegesterForm ref={this.regesterForm} />
        break;
      default:
        content = <LoginIndex changeStatus={this.changeStatus} />;
    }
    return content;
  }

  // 设置 Modal 底部
  getFooter = (status: string) => {
    let footer;
    switch (status) {
      case 'login':
        footer = <div className="login_footer">
          <span onClick={() => this.changeStatus('index')} className="other_login">&lt;
          其他方式登录
                  </span>
          <span className="regester" onClick={() => this.changeStatus('regester')} >
            没有账号？立即注册 &gt;
                  </span>
        </div>;
        break;
      case 'regester':
        footer = <div className="regester_footer">
          <span className="regester_footer" onClick={() => this.changeStatus('login')}>
            &lt; 返回登录
                    </span>
          <span onClick={() => this.changeStatus('index')} className="other_login">
            其他方式登录&gt;
                    </span>
        </div>;
        break;
      default:
        footer = null;
    }
    return footer;
  }

  // 关闭弹框
  closeModal = (status: string): void => {
    if (status === 'regester') {
      // 重置注册表单
      (this.regesterForm as any).current.resetRegesterForm();
    } else if (status === 'login') {
      (this.loginForm as any).current.resetLoginForm();
    }
    const { closeModal } = this.props;
    if (closeModal) {
      closeModal();
    }
  }

  render() {

    const { visible } = this.props;

    const { status } = this.state;

    // 定义拖动标题
    const title = <ModalDrag title={this.getTitle(status)} />
    return (
      <Modal
        closeIcon={<CloseOutlined style={{color: '#ffffff'}}/>}
        title={title}
        visible={visible}
        onCancel={() => this.closeModal(status)}
        maskClosable={false}
        footer={this.getFooter(status)}>
        {
          this.getModalContent(status)
        }
      </Modal>
    );
  }
}

export default Login;