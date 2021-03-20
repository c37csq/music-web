import * as React from 'react';
import './SongList.less';
import { message, Radio, Table, Tooltip } from 'antd';
import { GlobalContext } from '../../index/default';
import { RESPONSE_INFO, SONG, SONG_PARAMS } from '../../../global';
import store from '../../../store';
import { addHot, downSong, getSongs, saveMusic } from '../../../api';
import { addMusicList } from '../../../store/actionCreators';
import { useEffect, useState } from 'react';
import ShareMusic from '../../../components/ShareMusic/ShareMusic';
import Login from '../../../components/Login/Login';

interface IProps { }

const SongList = (props: IProps, ref: any) => {

  const { search } = (props as any).location;
  // 取到id
  const id = parseInt(search.replace(/^\?/, '').split('=')[1]);

  const [urlId, setId] = useState(id);

  const [visible, setVisible] = useState(false);

  const [shareMusic, setShareMusic] = useState({
    id: -1,
    song_name: "",
    song_singer: "",
    song_url: "",
    song_hot: 0
  });

  // 页码
  const [pageNum, setPageNum] = useState(1);

  const [pageSaveNum, setPageSaveNum] = useState(1);

  const [operationId, setOperationId] = useState(0);

  const [songList, setSongList] = useState([]);

  const [saveList, setSaveList] = useState([]);

  // 状态 最新/最热
  const [status, setStatus] = useState('hot');

  const [shareVisible, setShareVisible] = useState(false);

  const currentSong = store.getState().currentMusic;

  const [currentMusic, setCurrentMusic] = useState(currentSong);

  useEffect(() => {
    // other code
    getSongList({
      status,
      typeId: 0,
      user_id: urlId
    });
    getSaveList({
      status,
      typeId: 0,
      user_id: urlId,
      type: 'save'
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    // other code
    // 取消订阅
    const cancelSub = store.subscribe(() => {
      const currentMusic = store.getState().currentMusic;
      setCurrentMusic(currentMusic);
    });
    return () => {
      cancelSub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取我推荐歌曲列表
  const getSongList = async (params: SONG_PARAMS) => {
    const songList = await getSongs(params);
    setSongList((songList as any).result);
  }

  // 获取我收藏歌曲列表
  const getSaveList = async (params: SONG_PARAMS) => {
    const songList = await getSongs(params);
    setSaveList((songList as any).result);
  }


  // 播放音乐
  const playMusic = async (obj: any, record: any) => {
    const currentMusic = store.getState().currentMusic;
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

  // 页码样式修改
  const itemRender = (current: number, type: string, originalElement: any) => {
    if (type === 'prev') {
      return <span>上一页</span>;
    }
    if (type === 'next') {
      return <span>下一页</span>;
    }
    return originalElement;
  }

  // 收藏音乐
  const saveMusicToOwn = async (item: SONG) => {
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
        // 刷新收藏歌曲列表
        getSaveList({
          status,
          typeId: 0,
          user_id: urlId,
          type: 'save'
        })
      }
    } else {
      showModal();
    }
  }

  // 展示操作
  const showOperation = (e: any, record: any) => {
    setOperationId(record.id);
  }

  // 隐藏
  const hideOperation = (e: any, record: any) => {
    setOperationId(0);
  }

  // 添加音乐到全局播放列表
  const addMusic = async (record: SONG) => {
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

  // 显示弹窗
  const showModal = () => {
    setVisible(true);
  }

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
  }

  // 关闭弹窗
  const closeShareModal = () => {
    setShareVisible(false);
  }

  // 显示分享弹框
  const showShareModal = () => {
    setShareVisible(true);
  }

  // 分享音乐
  const shareMusicToSpace = async (item: SONG) => {
    const { username, id, avatar_url } = store.getState().userInfo;
    if (username && avatar_url && id) {
      showShareModal();
      const song = {
        id: item.id,
        song_name: item.song_name,
        song_singer: item.song_singer,
        song_url: item.song_url,
        song_hot: item.song_hot,
      }
      setShareMusic(song);
    } else {
      showModal();
    }
  }

  // 去歌曲详情页面
  const goDetail = (record: SONG) => {
    (props as any).history.push(`/songdetail?id=${record.id}`);
  }

  // 下载歌曲
  const downSongs = async (record: SONG) => {
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
      showModal();
    }
  }

  // 翻页事件
  const pageChange = async (e: any) => {
    const { current } = e;
    setPageNum(current);
  }

  // 翻页事件
  const pageSaveChange = async (e: any) => {
    const { current } = e;
    setPageSaveNum(current);
  }

  // 改变列表状态
  const changeStatus = async (e: any) => {
    setStatus(e.target.value);
  }

  // 表格的行列
  const columns = [
    {
      title: ' ', dataIndex: 'index', width: 75, render: (text: number, record: any, index: number) =>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <span>{index + 1}</span>
          <GlobalContext.Consumer>
            {(obj: any) =>
              <div onClick={() => playMusic(obj, record)} className="img_stop">
                <Tooltip title="播放">
                  <img
                    className={(currentMusic as SONG).id === record.id ? 'img_playing' : 'img_stopping'}
                    src={require('../../../assets/images/stop.png').default}
                    alt="未播放" />
                  <img
                    className={(currentMusic as SONG).id === record.id ? 'img_stopping' : 'img_playing'}
                    src={require('../../../assets/images/playing.png').default}
                    alt="正在播放" />
                </Tooltip>
              </div>
            }
          </GlobalContext.Consumer>
        </div>
    },
    {
      title: '歌曲标题', dataIndex: 'song_name', width: 130, ellipsis: true, render: (text: string, record: SONG) => <span className="song_name" onClick={() => goDetail(record)}>{text}</span>
    },
    { title: '歌手', dataIndex: 'song_singer', ellipsis: true, width: 120 },
    {
      title: '发布时间', dataIndex: 'create_time', ellipsis: true, width: 105, render: (text: string, record: any, index: number) =>
        <div>
          <div className={record.id === operationId ? 'none' : 'block'}>{text}</div>
          <div style={{ display: operationId === record.id ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="img_operator" onClick={() => addMusic(record)}>
              <Tooltip title="添加">
                <img src={require('../../../assets/images/add.png').default} alt="添加" />
              </Tooltip>
            </div>
            <div className="img_operator" onClick={() => saveMusicToOwn(record)}>
              <Tooltip title="收藏">
                <img src={require('../../../assets/images/save.png').default} alt="收藏" />
              </Tooltip>
            </div>
            <div className="img_operator" onClick={() => shareMusicToSpace(record)}>
              <Tooltip title="分享">
                <img src={require('../../../assets/images/send.png').default} alt="分享" />
              </Tooltip>
            </div>
            <div className="img_operator" onClick={() => downSongs(record)}>
              <Tooltip title="下载">
                <img src={require('../../../assets/images/down.png').default} alt="下载" />
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
              <img src={require('../../../assets/images/hot.png').default} alt="热度" />
            </span>
          &nbsp;
          <span>{text}</span>
          </Tooltip>
        </div>
    },
  ];

  return (
    <div className="home_page">
      <ShareMusic
        shareMusic={shareMusic}
        userId={id}
        closeModal={closeShareModal}
        title="发布动态"
        visible={shareVisible} />
      <Login closeModal={closeModal} visible={visible} />
      <div className="table_header">
        <div>
          <span className="table_title">我推荐的歌曲</span>
          <span className="table_count">共 {songList.length} 首歌</span>
        </div>
        <div>
          <Radio.Group onChange={changeStatus} defaultValue={status} buttonStyle="solid">
            <Radio.Button value="hot">最热</Radio.Button>
            <Radio.Button value="new">最新</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <div className="table_parent">
        <Table
          size="small"
          pagination={{
            total: songList.length,
            pageSize: 10,
            showSizeChanger: false,
            current: pageNum,
            size: 'small',
            itemRender: itemRender
          }}
          columns={columns}
          onRow={record => {
            return {
              onMouseEnter: event => { showOperation(event, record) }, // 鼠标移入行
              onMouseLeave: event => { hideOperation(event, record) },
            };
          }}
          rowKey="id"
          dataSource={songList}
          onChange={pageChange}
        />
      </div>
      <div className="table_header">
        <div>
          <span className="table_title">我收藏的歌曲</span>
          <span className="table_count">共 {saveList.length} 首歌</span>
        </div>
        <div>
          <Radio.Group onChange={changeStatus} defaultValue={status} buttonStyle="solid">
            <Radio.Button value="hot">最热</Radio.Button>
            <Radio.Button value="new">最新</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <div className="table_parent">
        <Table
          size="small"
          pagination={{
            total: saveList.length,
            pageSize: 10,
            showSizeChanger: false,
            current: pageSaveNum,
            size: 'small',
            itemRender: itemRender
          }}
          columns={columns}
          onRow={record => {
            return {
              onMouseEnter: event => { showOperation(event, record) }, // 鼠标移入行
              onMouseLeave: event => { hideOperation(event, record) },
            };
          }}
          rowKey="id"
          dataSource={saveList}
          onChange={pageSaveChange}
        />
      </div>
    </div>
  )
}

export default SongList;