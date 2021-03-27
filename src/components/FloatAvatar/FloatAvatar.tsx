import * as React from 'react';
import './FloatAvatar.less';
import store from '../../store/index';
import { setUserToken } from '../../store/actionCreators';

interface IState {
  visible: boolean
}

interface IProps {
  handleMenuClick: Function,
  jumpRouter: Function
}


class FloatAvatar extends React.Component<IProps, IState> {

  public state: IState = {
    visible: false
  }

  // 显示浮层
  public showAvatarFloat = () => {
    this.setState({
      visible: true
    })
  }

  // 隐藏浮层
  public hideAvatarFloat = () => {
    this.setState({
      visible: false
    })
  }

  // 实施操作
  doOperator = (index: number) => {
    const { id } = store.getState().userInfo;
    switch(index) {
      case 0:
        // 点击我的主页
        this.props.jumpRouter(`/user/home?id=${id}`);
        break;
      case 1:
        // 点击个人设置
        this.props.jumpRouter(`/update?id=${id}`);
        break;
      case 2:
        // 点击退出操作
        this.logout();
        break;
      default:
        break;
    }
  }

  // 用户退出
  logout = () => {
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
    this.props.handleMenuClick({
      key: '/home'
    });
  }

  render() {
    // 列表
    const avatarList = [
      {
        name: '我的主页',
        url: require('../../assets/images/myspace.png').default
      },
      {
        name: '个人设置',
        url: require('../../assets/images/personal_setting.png').default
      },
      {
        name: '退出',
        url: require('../../assets/images/logout.png').default
      }
    ];
    const { visible } = this.state;
    return (
      <div className={"float_wrapper " + ((!visible) ? "float_wrapper_none" : "")}>
        <ul style={{ width: '100%' }}>
          {
            avatarList.map((item, index) => {
              return (
                <li onClick={() => this.doOperator(index)} key={index}>
                  <div className="img_item">
                    <img src={item.url} alt={item.name} />
                  </div>
                  <div className="text">{item.name}</div>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}

export default FloatAvatar;