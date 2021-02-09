import * as React from 'react';
import './RegesterForm.less';
import { Form, Button, Input, message } from 'antd';
import UploadAvatar from '../Upload/Upload';
import { REGESTER_FORM, RESPONSE_INFO } from '../../global';
import { regesterUser } from '../../api/index';
import { PUBLIC_KEY } from '../../config/key';
import { rsaEncrypt } from '../../utils/jsencrypt';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

class RegesterForm extends React.Component<{}, {}> {
  
  private picture: React.RefObject<UploadAvatar>;
  private regesterForm: any;
  constructor(props: {}) {
    super(props);

    // 创建用来保存ref标识的标签对象的容器
    this.picture = React.createRef();

    // 表单
    this.regesterForm = React.createRef();
  }

  // 用户注册提交
  onFinish = async (values: REGESTER_FORM) => {
    // 获取头像url地址
    const avatar = (this.picture as any).current.getImgs()[0];
    // 判断俩次密码是否一致
    if (values.password !== values.confirm_password) {
       return message.error('俩次密码要一致！');
    }
    // 判断是否上传头像
    if (!avatar) {
      return message.error('请上传头像！');
    } else {
      values.avatar = avatar;
    }
    // RSA对密码加密
    values.password = rsaEncrypt(values.password, PUBLIC_KEY);
    values.confirm_password = rsaEncrypt(values.confirm_password, PUBLIC_KEY);

    // 请求接口
    const result = await regesterUser(values);
    if ((result as RESPONSE_INFO).status === 300) return message.error('用户名已存在！');
    else if ((result as RESPONSE_INFO).status === 301) return message.error('俩次密码需要一致！');
    else {
      message.success('注册成功！');
      // 重置表单
      this.resetRegesterForm();
    }
  }

  // 重置注册表单
  resetRegesterForm = () => {
    this.regesterForm.current.resetFields();
  }

  render() {
    return (
      <div className="regester_form_wrapper">
        <Form
          ref={this.regesterForm}
          style={{ width: '260px' }}
          initialValues={{ username: '', password: '', confirm_password: '', avatar: '' }}
          onFinish={this.onFinish}
          name="regester"
        >
          <Form.Item
            name="username"
            rules={
              [
                { required: true, message: '请输入用户名' }, 
                { min: 6, max: 10, message: '用户名长度要在1到10之间' }
              ]
            }
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 12, message: '密码长度要在6到18之间' }
            ]
          }
          >
            <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="请确认密码" />
          </Form.Item>
          <Form.Item
            name="avatar"
          >
            <UploadAvatar ref={this.picture} />
          </Form.Item>
          <Form.Item>
            <Button style={{ width: '100%' }} type="primary" htmlType="submit">
              注册
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

export default RegesterForm;