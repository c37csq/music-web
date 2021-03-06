import * as React from 'react';
import './header.less';
import { Menu, Input, Avatar } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import store from '../../store/index';
import { changeRoute } from '../../store/actionCreators';
import Login from '../Login/Login';
import FloatAvatar from '../FloatAvatar/FloatAvatar';
import { SONG } from '../../global';
import { getSongsByLike } from '../../api';
import Float from '../Float/Float';

interface HeaderProps extends RouteComponentProps {
  hideMusicListAndVolume: (event: any) => void
}

declare type menuItem = {
  pathname: string,
  label: string
}

interface HeaderState {
  menuList: Array<menuItem>,
  visible: boolean,
  token: string,
  avatar_url: string,
  route: string,
  likeList: Array<SONG>,
  value: string,
  focus: boolean
}


class Header extends React.Component<HeaderProps, HeaderState> {

  private avatarFloat: React.RefObject<FloatAvatar>;
  constructor(props: HeaderProps) {
    super(props);

    // 订阅store
    this.cancelSub = store.subscribe(() => {
      const state = store.getState();
      if (state.userInfo && state.token) {
        this.setState({
          token: state.token,
          avatar_url: state.userInfo.avatar_url,
          route: store.getState().route
        });
      } else {
        this.setState({
          token: '',
          avatar_url: '',
          // route: '/home'
          route: store.getState().route
        });
      }
    })
    // 获取头像浮层子组件
    this.avatarFloat = React.createRef();
  }

  state: HeaderState = {
    menuList: [
      { pathname: '/home', label: '发现音乐' },
      { pathname: '/addmusic', label: '分享音乐' },
      { pathname: '/myspace', label: '我的空间' },
    ],
    visible: false,
    token: store.getState().token,
    avatar_url: store.getState().userInfo.avatar_url,
    route: store.getState().route,
    likeList: [],
    value: '',
    focus: false
  }

  // 点击菜单
  public handleMenuClick = (e: any): void => {
    const action = changeRoute(e.key);
    this.props.history.push({ pathname: e.key });
    store.dispatch(action);
  };

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

  // 取消订阅方法就是订阅的返回值
  cancelSub = () => { };

  componentWillUnmount() {
    // 取消redux订阅
    this.cancelSub();
  }

  // 显示 头像 浮层
  showAvatarFloat = (token: string | null) => {
    if (!token) {
      return;
    }
    const avatar = this.avatarFloat.current;
    if (avatar) {
      avatar.showAvatarFloat();
    }
  }

  // 隐藏 头像 浮层
  hideAvatarFloat = (token: string | null) => {
    if (!token) {
      return;
    }
    const avatar = this.avatarFloat.current;
    if (avatar) {
      avatar.hideAvatarFloat();
    }
  }

  // 跳转路由
  jumpRouter = (route: string) => {
    this.props.history.replace(route);
  }

  // 搜索回调
  search = (e: any) => {
    e.persist();
    this.setState({
      focus: true
    })
    this.getList(e.target.value)
  }

  // 获取搜索列表
  getList = async (val: string) => {
    if (val === "") {
      this.setState({
        likeList: []
      })
      return;
    }
    const res = await getSongsByLike({
      like: val
    })
    this.setState({
      likeList: (res as any).result,
      value: val
    })
  }

  componentDidMount() {
    // 监听路由改变
    this.props.history.listen(route => {
      const action = changeRoute(route.pathname);
      store.dispatch(action);
    })
  }

  public render() {
    let { menuList, visible, token, avatar_url, route, focus, likeList, value } = this.state;
    const { hideMusicListAndVolume } = this.props;
    return (
      <header onClick={hideMusicListAndVolume} className="Header_Container">
        <div className="Header_Content_Wrapper">
          <div className="Header_Title_Wrapper">
            音乐交流空间
          </div>
          <div className="Header_Menu_Wrapper">
            <Menu onClick={this.handleMenuClick} selectedKeys={[route]} mode="horizontal">
              {
                menuList.map((item: menuItem) => (
                  <Menu.Item key={item.pathname}>{item.label}</Menu.Item>
                ))
              }
            </Menu>
          </div>
          <div onMouseLeave={() => this.hideAvatarFloat(token)} onMouseOver={() => this.showAvatarFloat(token)} className="Header_Avatar_Wrapper">
            {
              token ? (
                <div style={{ cursor: 'pointer', position: 'relative' }}>
                  <Avatar src={avatar_url} size={50} />
                  <FloatAvatar jumpRouter={this.jumpRouter} handleMenuClick={this.handleMenuClick} ref={this.avatarFloat} />
                </div>
              ) : (
                <div className="login_button" onClick={this.showModal}>
                  <p>登录</p>
                </div>
              )
            }
          </div>
          <div className="Header_Input_Wrapper">
            <div>
              <Input onChange={this.search} placeholder="请输入音乐" prefix={<SearchOutlined />} />
              <Float
                focus={focus}
                likeList={likeList}
                value={value} />
            </div>
          </div>
          <Login closeModal={this.closeModal} visible={visible} />
        </div>
      </header>
    )
  }
}

export default withRouter(Header);