import * as React from 'react';
import './LoginIndex.less';
import { Button } from 'antd';

interface IProps {
  changeStatus: Function
}

class LoginIndex extends React.Component<IProps, {}> {

  render() {
    const { changeStatus } = this.props;
    // 第三方登录图标列表
    const iconList = [
      {
        name: 'QQ登录',
        url: require('../../assets/images/QQ.png').default
      },
      {
        name: '微信登录',
        url: require('../../assets/images/weixin.png').default
      },
      {
        name: '百度登录',
        url: require('../../assets/images/baidu.png').default
      },
      {
        name: 'Github登录',
        url: require('../../assets/images/github.png').default
      }
    ];
    return (
      <div className="login_index">
        <div className="left">
          <div className="bg_img"></div>
          <div className="btns">
            <Button onClick={() => changeStatus('login')} style={{ background: '#3080CC' }} type="primary">账号密码登录</Button>
            <Button onClick={() => changeStatus('regester')} style={{ background: '#F4F4F4' }}>注册</Button>
          </div>
        </div>
        <div className="right">
          {
            iconList.map((item, index) => {
              return (
                <div key={index} className="login_item">
                  <div className="left_img">
                    <img src={item.url} alt={item.name} />
                  </div>
                  <div className="right_text">{item.name}</div>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default LoginIndex;