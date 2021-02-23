import * as React from 'react';
import { Layout } from 'antd';
import { Redirect, Route, Switch } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Home from '../home/home';
import AddMusic from '../AddMusic/AddMusic';
import NoFoundPage from '../404';
import MySpace from '../MySpace/MySpace';
import { addMusicList, setCurrentMusic } from '../../store/actionCreators';
import store from '../../store';
import { SONG } from '../../global';
import Player from '../../components/Player/Player';
import './Default.less';
import SongDetail from '../SongDetail/SongDetail';

const { Content } = Layout;


interface IPlayerRef {
  onPause: Function,
  onPlay: Function,
  hideMusicList: Function,
  hideVolume: Function
}

export const GlobalContext = React.createContext({});

class Default extends React.Component<{}, {}> {

  private player: React.RefObject<any>;
  constructor(props: {}) {
    super(props);

    // 获取播放器组件
    this.player = React.createRef<IPlayerRef>();
  }

  // 播放音乐
  playMusic = (data: SONG) => {
    const musicList = store.getState().musicList;
    if (musicList.find((item: SONG) => item.id === data.id)) {
      // 设置当前正在播放的音乐
      const currentMusicAction = setCurrentMusic(data);
      store.dispatch(currentMusicAction);
      // 不需要添加歌曲了
    } else {
      // 向store中的音乐列表添加一个音乐
      const action = addMusicList(data);
      store.dispatch(action);
      // 设置当前正在播放的音乐
      const currentMusicAction = setCurrentMusic(data);
      store.dispatch(currentMusicAction);
    }
    // 并播放音乐
    this.player.current?.onPlay();
  }

  // 隐藏音乐列表和调节音量列表
  hideMusicList = () => {
    const isMusicListShow = this.player.current?.isMusicListShow;
    if (isMusicListShow) {
      this.player.current?.hideMusicList();
    }
  }

  // 隐藏调节音量列表
  hideVolume = () => {
    const volumeControl = this.player.current?.volumeControl;
    if (volumeControl) {
      this.player.current?.hideVolume();
    }
  }

  // 隐藏播放列表和音量列表
  hideMusicListAndVolume = () => {
    this.hideMusicList();
    this.hideVolume();
  }

  render() {
    const globalData = {
      playMusic: this.playMusic,
      hideMusicList: this.hideMusicList,
      hideVolume: this.hideVolume
    };
    return (
      <GlobalContext.Provider
        value={globalData}>
        <Layout className="layout">
          <Header hideMusicListAndVolume={this.hideMusicListAndVolume} />
          <Content>
            <div onClick={this.hideMusicListAndVolume} className="Container">
              <div className="Component-Wrapper">
                <Switch>
                  <Redirect exact from="/" to="/home" />
                  <Route path="/home" exact component={Home} />
                  <Route path="/addmusic" component={AddMusic} />
                  <Route path="/myspace" component={MySpace} />
                  <Route path="/songdetail" component={SongDetail} />
                  <Route component={NoFoundPage} />
                </Switch>
              </div>
            </div>
          </Content>
          <Footer hideMusicListAndVolume={this.hideMusicListAndVolume} />
          <Player ref={this.player} />
        </Layout>
      </GlobalContext.Provider>
    );
  }
}

export default Default;
