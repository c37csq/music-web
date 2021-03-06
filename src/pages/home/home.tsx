import * as React from 'react';
import { getSongTypes, getSongs, addHot, downSong, saveMusic } from '../../api/index';
import SongType from '../../components/SongType/SongType';
import SongTable from '../../components/SongTable/SongTable';
import './home.less';
import { RESPONSE_INFO, SONG, SONG_ITEM, SONG_PARAMS, SONG_TYPES } from '../../../src/global';
import { message, Tooltip } from 'antd';
import store from '../../store';
import { GlobalContext } from '../index/default';
import { addMusicList } from '../../store/actionCreators';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Login from '../../components/Login/Login';
import ShareMusic from '../../components/ShareMusic/ShareMusic';

interface IState {
  songTypes: SONG_TYPES,
  songType: Array<SONG_ITEM>,
  songList: Array<SONG>,
  currentMusic: SONG | {},
  operationId: number,
  visible: boolean,
  shareVisible: boolean,
  shareMusic: {
    id: number,
    song_name: string,
    song_singer: string,
    song_url: string,
    song_hot: number
  }
}

interface IProps extends RouteComponentProps {

}

interface ISongTableRef {
  status: string
}

class Home extends React.Component<IProps, IState> {

  private songType: React.RefObject<SongType>;
  private songTable: React.RefObject<any>;
  constructor(props: IProps) {
    super(props);

    // 订阅store
    this.cancelSub = store.subscribe(() => {
      const state = store.getState();
      this.setState({
        currentMusic: state.currentMusic
      })
    })

    this.songType = React.createRef();

    this.songTable = React.createRef<ISongTableRef>();
  }

  state: IState = {
    songTypes: {
      '语种': [],
      '风格': [],
      '场景': [],
      '情感': [],
      '主题': []
    },
    songType: [],
    songList: [],
    currentMusic: store.getState().currentMusic,
    operationId: 0,
    visible: false,
    shareVisible: false,
    shareMusic: {
      id: -1,
      song_name: "",
      song_singer: "",
      song_url: "",
      song_hot: 0
    }
  }

  async componentDidMount() {
    // 获取歌曲分类
    const res = await getSongTypes();

    // 获取歌曲列表数据
    this.getSongList({
      status: 'hot',
      typeId: 0
    });

    this.setState({
      songTypes: (res as any).data
    })
  }

  // 取消订阅方法就是订阅的返回值
  cancelSub = () => { };

  componentWillUnmount() {
    // 取消redux订阅
    this.cancelSub()
  }

  // 获取列表数据
  getSongList = async (params: SONG_PARAMS) => {
    const songList = await getSongs(params);

    this.setState({
      songList: (songList as any).result
    })
  }

  // 触发songType更新
  getSongItem = (data: Array<SONG_ITEM>) => {
    this.setState({
      songType: data
    })
  }

  // 播放音乐
  playMusic = async (obj: any, record: any) => {
    const { currentMusic } = this.state;
    if ((currentMusic as SONG).id === record.id) return;
    // 播放音乐
    obj.playMusic({
      id: record.id,
      song_name: record.song_name,
      song_url: record.song_url,
      song_hot: record.song_hot,
      song_singer: record.song_singer,
      song_album: record.song_album
    });
    // 增加该条歌曲热度
    const res = await addHot({ song_id: record.id, song_hot: record.song_hot });
    console.log(res);
  }

  // 获取子组件的状态
  getStatus = () => {
    let status: string = this.songTable.current?.status;
    return status;
  }

  // 获取子组件的操作id
  getOperationId = () => {
    let operationId: number = this.songTable.current?.operationId;
    return operationId;
  }

  // 设置父组件operationId
  setParentOperationId = (operationId: number) => {
    this.setState({
      operationId
    });
  }

  // 添加音乐到全局播放列表
  addMusic = async (record: SONG) => {
    // 向store中的音乐列表添加一个音乐
    const musicList = store.getState().musicList;
    if (musicList.find((item: SONG) => item.id === record.id)) {
      return message.success('歌曲已经在列表！');
    } else {
      const action = addMusicList({
        id: record.id,
        song_name: record.song_name,
        song_url: record.song_url,
        song_hot: record.song_hot,
        song_singer: record.song_singer,
        song_album: record.song_album
      });
      store.dispatch(action);
      // 增加该条歌曲热度
      const res = await addHot({ song_id: record.id, song_hot: record.song_hot });
      if ((res as any).isSuccess) {
        message.success('添加到播放列表成功！');
      }
    }
  }

  // 设置分页为1
  setPage = (params: any) => {
    this.songTable.current?.pageChange(params);
  }

  // 下载歌曲
  downSong = async (record: SONG) => {
    const { username, id, avatar_url } = store.getState().userInfo;
    if (username && avatar_url && id) {
      const res = await downSong({ id: record.id });
      if (res) {
        let url = window.URL.createObjectURL(res);
        let link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', `${record.song_name} - ${record.song_singer} - ${record.song_album ? record.song_album : '暂无'}.mp3`);
        document.body.appendChild(link);
        link.click();
      }
    } else {
      this.showModal();
    }
  }

  // 显示弹窗
  showModal = () => {
    this.setState({
      visible: true
    });
  }

  // 关闭弹窗
  closeModal = () => {
    this.setState({
      visible: false
    });
  }

  // 关闭弹窗
  closeShareModal = () => {
    this.setState({
      shareVisible: false
    })
  }

  // 显示分享弹框
  showShareModal = () => {
    this.setState({
      shareVisible: true
    });
  }

  // 收藏音乐
  saveMusic = async (item: SONG) => {
    const { username, id, avatar_url } = store.getState().userInfo;

    if (username && avatar_url && id) {
      const params = {
        type: 'save',
        user_id: id,
        song_id: item.id
      }
      const res = await saveMusic(params);
      if ((res as RESPONSE_INFO).status === 444) {
        message.info('你已收藏该音乐！');
      } else if ((res as RESPONSE_INFO).status === 200) {
        message.info('收藏成功！');
      }
    } else {
      this.showModal();
    }
  }

  // 分享音乐
  shareMusic = async (item: SONG) => {
    const { username, id, avatar_url } = store.getState().userInfo;
    if (username && avatar_url && id) {
      this.showShareModal();
      const song = {
        id: item.id,
        song_name: item.song_name,
        song_singer: item.song_singer,
        song_url: item.song_url,
        song_hot: item.song_hot,
      }
      this.setState({
        shareMusic: song
      });
    } else {
      this.showModal();
    }
  }

  // 去歌曲详情页面
  goDetail = (record: SONG) => {
    (this.props as any).history.push(`/songdetail?id=${record.id}`);
  }

  public render() {
    const { songTypes, songType, songList, currentMusic, operationId } = this.state;
    const { id } = store.getState().userInfo;

    // 表格的行列
    const columns = [
      {
        title: ' ', dataIndex: 'index', width: 75, render: (text: number, record: any, index: number) =>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <span>{index + 1}</span>
            <GlobalContext.Consumer>
              {(obj: any) =>
                <div onClick={() => this.playMusic(obj, record)} className="img_stop">
                  <Tooltip title="播放">
                    <img
                      className={(currentMusic as SONG).id === record.id ? 'img_playing' : 'img_stopping'}
                      src={require('../../assets/images/stop.png').default}
                      alt="未播放" />
                    <img
                      className={(currentMusic as SONG).id === record.id ? 'img_stopping' : 'img_playing'}
                      src={require('../../assets/images/playing.png').default}
                      alt="正在播放" />
                  </Tooltip>
                </div>
              }
            </GlobalContext.Consumer>
          </div>
      },
      {
        title: '歌曲标题', dataIndex: 'song_name', width: 130, ellipsis: true, render: (text: string, record: SONG) => <span className="song_name" onClick={() => this.goDetail(record)}>{text}</span>
      },
      { title: '歌手', dataIndex: 'song_singer', ellipsis: true, width: 120 },
      {
        title: '发布时间', dataIndex: 'create_time', ellipsis: true, width: 95, render: (text: string, record: any, index: number) =>
          <div>
            <div className={record.id === operationId ? 'none' : 'block'}>{text}</div>
            <div style={{ display: operationId === record.id ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="img_operator" onClick={() => this.addMusic(record)}>
                <Tooltip title="添加">
                  <img src={require('../../assets/images/add.png').default} alt="添加" />
                </Tooltip>
              </div>
              <div className="img_operator" onClick={() => this.saveMusic(record)}>
                <Tooltip title="收藏">
                  <img src={require('../../assets/images/save.png').default} alt="收藏" />
                </Tooltip>
              </div>
              <div className="img_operator" onClick={() => this.shareMusic(record)}>
                <Tooltip title="分享">
                  <img src={require('../../assets/images/send.png').default} alt="分享" />
                </Tooltip>
              </div>
              <div className="img_operator" onClick={() => this.downSong(record)}>
                <Tooltip title="下载">
                  <img src={require('../../assets/images/down.png').default} alt="下载" />
                </Tooltip>
              </div>
            </div>
          </div>
      },
      { title: '专辑', dataIndex: 'song_album', ellipsis: true, width: 150, render: (text: string) => text ? text : '暂无' },
      {
        title: '热度', dataIndex: 'song_hot', width: 70, render: (text: number) =>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="热度">
              <span className="img_hot">
                <img src={require('../../assets/images/hot.png').default} alt="热度" />
              </span>
            &nbsp;
            <span>{text}</span>
            </Tooltip>
          </div>
      },
    ];
    const { visible, shareVisible, shareMusic } = this.state;

    return (
      <div className="Home_Content_Wrapper">
        <ShareMusic
          shareMusic={shareMusic}
          userId={id}
          closeModal={this.closeShareModal}
          title="发布动态"
          visible={shareVisible} />
        <Login closeModal={this.closeModal} visible={visible} />
        <SongType
          getSongItem={this.getSongItem}
          getSongList={this.getSongList}
          status={this.getStatus()}
          setPage={this.setPage}
          count={1}
          ref={this.songType}
          title="全部类别"
          desc="选择分类，最多选一个"
          songTypes={songTypes} />
        <SongTable
          getSongList={this.getSongList}
          setParentOperationId={this.setParentOperationId}
          songType={songType}
          songList={songList}
          columns={columns}
          ref={this.songTable} />
      </div>
    )
  }
}

export default withRouter(Home);