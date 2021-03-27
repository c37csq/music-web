import { Button, Form, Input, message, Radio, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { getUserInfo, updateUserInfo } from '../../api';
import { RESPONSE_INFO } from '../../global';
import store from '../../store';
import { setUserToken } from '../../store/actionCreators';
import './Update.less';

const { Option } = Select;

interface IProps extends RouteComponentProps { }

const Update = (props: IProps, ref: any) => {

  const { search } = (props as any).location;

  const [form] = Form.useForm();

  // 取到id
  const id = parseInt(search.replace(/^\?/, '').split('=')[1]);

  const [ageList, setAgeList] = useState<any[]>([]);

  const [urlId, setId] = useState(id);

  // 用户信息不是储存在本地的
  const [user, setUser] = useState({
    id: -1,
    avatar_url: "",
    sex: "",
    username: "",
    dynamicCounts: 0,
    likeCounts: 0,
    concernedCounts: 0,
    introduce: "",
    age: "",
    fans: [],
    concernPerson: []
  });

  useEffect(() => {
    // other code
    createAgeList();
    getUserDetail(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 创建年龄数组
  const createAgeList = () => {
    let ageList = [];
    for (let i = 1; i < 101; i++) {
      ageList.push(i);
    }
    ageList.push("");
    setAgeList(ageList);
  }

  // 获取用户信息
  const getUserDetail = async (id: number) => {
    const res = await getUserInfo({
      user_id: id
    });
    if (!(res as any).data.age) {
      (res as any).data.age = "";
    }
    setUser((res as any).data);
    form.setFieldsValue({
      username: (res as any).data.username,
      introduce: (res as any).data.introduce,
      sex: (res as any).data.sex,
      age: (res as any).data.age
    });
  }

  // 提交
  const onFinish = async (values: any) => {
    const params = {
      id: urlId,
      ...values
    }
    const res = await updateUserInfo(params);
    if ((res as RESPONSE_INFO).status === 200) {
      message.info('修改成功,请重新登陆！');
      logout();
    }
  }

  // 用户退出
  const logout = () => {
    // 清除用户信息
    sessionStorage.removeItem('userInfo');
    // 清除token
    sessionStorage.removeItem('token');
    // 清除store中的数据
    const action = setUserToken({
      token: '',
      userInfo: {}
    });
    store.dispatch(action);
    // 跳转首页
    props.history.push('/home');
  }

  return (
    <div className="Update_Container">
      <div className="Update_Content_Wrapper">
        <div className="update_header">
          <div className="update_title">个人设置</div>
        </div>
        <div className="update_content">
          <div className="left">
            <Form
              onFinish={onFinish}
              form={form}
              labelCol={{ span: 4 }}
              layout="horizontal"
              initialValues={{ username: user.username, introduce: user.introduce, sex: user.sex, age: user.age, avatar_url: user.avatar_url }}
            >
              <Form.Item
                name="username"
                rules={
                  [
                    { required: true, message: '请输入用户名' },
                    { min: 6, max: 10, message: '用户名长度要在6到10之间' }
                  ]
                }
                label="昵称：">
                <Input />
              </Form.Item>
              <Form.Item
                name="introduce"
                label="介绍："
                rules={
                  [
                    { min: 0, max: 300, message: '介绍最多300字！' }
                  ]
                }>
                <Input.TextArea
                  showCount
                  maxLength={300}
                  rows={7} />
              </Form.Item>
              <Form.Item
                name="sex"
                label="性别：">
                <Radio.Group>
                  <Radio value="male">男</Radio>
                  <Radio value="female">女</Radio>
                  <Radio value="">保密</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                name="age"
                label="年龄：">
                <Select
                  style={{ width: 100 }}>
                  {
                    ageList.map(item => (
                      <Option key={item} value={item}>{item || "未知"}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" style={{marginLeft: '57px', marginTop: '20px'}} type="primary">提交</Button>
              </Form.Item>
            </Form>
          </div>
          <div className="right">
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(Update);
