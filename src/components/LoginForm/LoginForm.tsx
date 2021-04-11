import * as React from 'react';
import './LoginForm.less';
import { Form, Button, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { LOGIN_FORM, LOGIN_INFO } from '../../global';
import { rsaEncrypt } from '../../utils/jsencrypt';
import { PUBLIC_KEY } from '../../config/key';
import { loginUser } from '../../api/index';
import store from '../../store/index';
import { setUserToken } from '../../store/actionCreators';

interface IProps {
  closeModal: Function,
}

class LoginForm extends React.Component<IProps, {}> {

  private loginForm: any;
  constructor(props: IProps) {
    super(props);

    // 表单
    this.loginForm = React.createRef();
  }

  // 重置注册表单
  resetLoginForm = () => {
    this.loginForm.current.resetFields();
  }

  // 用户登录提交
  onFinish = async (values: LOGIN_FORM) => {

    // RSA对密码加密
    values.password = rsaEncrypt(values.password, PUBLIC_KEY);

    // 请求接口
    const result = await loginUser(values);
    if ((result as LOGIN_INFO).status === 200) {

      // token
      const token = (result as LOGIN_INFO).token;

      // userInfo
      const userInfo = (result as LOGIN_INFO).data;

      // 将token储存到sessionStorage
      sessionStorage.setItem('token', token);

      // 将用户信息储存到sessionStorage
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
      message.info((result as LOGIN_INFO).msg);

      // 重置表单
      this.resetLoginForm();

      // 关闭弹窗
      this.props.closeModal();

      // 改变store中的状态
      const action = setUserToken({
        token,
        userInfo
      });
      store.dispatch(action);
    } else {
      message.error((result as LOGIN_INFO).msg);
    }
  }

  render() {
    return (
      <div className="login_wrapper">
        <Form
          ref={this.loginForm}
          style={{ width: '260px' }}
          name="login"
          onFinish={this.onFinish}
        >
          <Form.Item
            name="username"
            rules={
              [
                { required: true, message: '请输入用户名' },
                { min: 6, max: 10, message: '用户名长度要在6到10之间' }
              ]
            }
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={
              [
                { required: true, message: '请输入密码' },
                { min: 6, max: 12, message: '密码长度要在6到18之间' }
              ]
            }
          >
            <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button style={{ width: '100%' }} type="primary" htmlType="submit">
              登录
              </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

export default LoginForm;