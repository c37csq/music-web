import './MusicList.less';
import React, { useEffect, useRef } from 'react';
import { message, Tooltip } from 'antd';
import store from '../../store';
import { RESPONSE_INFO, SONG } from '../../global';
import { downSong, saveMusic } from '../../api';
import { setCurrentMusic, deleteMusicFromMusicList, clearMusicList } from '../../store/actionCreators';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps {
  toggleMusicList: (event: any) => void,
  onPlay: Function,
  nextMusic: Function,
  onPause: Function,
  resetProcess: Function,
  showModal: Function
};

const MusicList = (props: IProps, ref: any) => {

  // 歌曲列表
  const musicList = store.getState().musicList;
  // 当前播放歌曲
  const currentMusic = store.getState().currentMusic;
  // 内容列表
  const listRef = useRef<HTMLDivElement>(null);

  const musicListRef = useRef<HTMLDivElement>(null);
  // 可视区域列表
  const contentRef = useRef<HTMLDivElement>(null);
  // 滚动条列表
  const barRef = useRef<HTMLDivElement>(null);
  // 滚动条列表容器
  const barWrapperRef = useRef<HTMLDivElement>(null);

  const { toggleMusicList, onPlay, nextMusic, onPause, resetProcess, showModal } = props;

  useEffect(() => {
    // other code
    initBarHeight();
    scrollWheel();
    scrollDrag();
    scrollClick();
    setCurrentMusicPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听store中的数据
  store.subscribe(() => {
    setCurrentMusicPosition();
  });

  // 初始化滚动条高度
  const initBarHeight = () => {
    const list = listRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    if (list && content && bar) {
      // 可视区域宽高
      let contentHeight = content.offsetHeight;
      // 列表宽高
      let listHeight = list.offsetHeight;
      if (listHeight < contentHeight) {
        bar.style.height = 0 + 'px';
      } else {
        // 滚动条高度
        let barHeight = (contentHeight / listHeight) * contentHeight;
        // 设置滚动条高度
        bar.style.height = `${barHeight}px`;
      }
    }
  }

  // 移动列表
  const listMove = () => {
    const list = listRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    const barWrapper = barWrapperRef.current;
    if (list && content && bar && barWrapper) {
      const percentH = bar.offsetTop / (barWrapper.offsetHeight - bar.offsetHeight);
      const contentMoveH = Math.floor(percentH * (list.offsetHeight - content.offsetHeight));
      list.style.top = `-${contentMoveH}px`;
    }
  }

  // 滚轮事件
  const scrollWheel = () => {
    // 速度
    var num = 8;
    const list = listRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    if (list && content && bar) {
      content.addEventListener('wheel', (e: any) => {
        e.preventDefault();
        // 滑块往上走
        if (e.wheelDelta > 0) {
          bar.style.top = bar.offsetTop - num + "px";
          if (bar.offsetTop <= 0) { //判断上临界
            bar.style.top = 0 + 'px';
          }
        } else {
          // 滑块往下走
          bar.style.top = bar.offsetTop + num + "px";
          if (bar.offsetTop + bar.offsetHeight > content.offsetHeight) {//判断下临界值
            bar.style.top = content.offsetHeight - bar.offsetHeight + 'px';
          }
        }
        listMove();
      })
    }
  }

  // 滚动条拖动事件
  const scrollDrag = () => {
    const list = listRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    const musicList = musicListRef.current;
    if (list && content && bar && musicList) {
      bar.onmousedown = function (event: any) {
        let e = event || window.event;
        e.preventDefault();
        let e_y = event.pageY //鼠标Y点 
        document.onmousemove = function (ev: any) {
          var chay = ev.pageY - e_y;
          bar.style.top = bar.offsetTop + chay + 'px';
          e_y = ev.pageY;
          if (bar.offsetTop <= 0) { //判断上临界
            bar.style.top = 0 + 'px';
          }
          if (bar.offsetTop + bar.offsetHeight > content.offsetHeight) {//判断下临界值
            bar.style.top = content.offsetHeight - bar.offsetHeight + 'px';
          }
          listMove();
        }
        musicList.onmousemove = function (ev: any) {
          var chay = ev.pageY - e_y;
          bar.style.top = bar.offsetTop + chay + 'px';
          e_y = ev.pageY;
          if (bar.offsetTop <= 0) { //判断上临界
            bar.style.top = 0 + 'px';
          }
          if (bar.offsetTop + bar.offsetHeight > content.offsetHeight) {//判断下临界值
            bar.style.top = content.offsetHeight - bar.offsetHeight + 'px';
          }
          listMove();
        }
        document.onmouseup = function (e) {
          document.onmousemove = null;
          musicList.onmousemove = null;
        }
        musicList.onmouseup = function (e) {
          document.onmousemove = null;
          musicList.onmousemove = null;
        }
      }
    }
  }

  // 滚动条点击事件
  const scrollClick = () => {
    const list = listRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    const barWrapper = barWrapperRef.current;
    if (list && content && bar && barWrapper) {
      barWrapper.onclick = function (e: any) {
        let heightY = e.clientY;
        let barWrapperToTop = barWrapper.getBoundingClientRect().top;
        let distance = heightY - barWrapperToTop;
        if (barWrapper.offsetHeight - distance < bar.offsetHeight) {
          bar.style.top = `${barWrapper.offsetHeight - bar.offsetHeight}px`;
        }
        if (distance > bar.offsetHeight / 2 && distance < bar.offsetHeight) {
          bar.style.top = `${distance - (bar.offsetHeight / 2)}`;
        }
        if (distance <= (bar.offsetHeight / 2)) {
          bar.style.top = 0 + 'px';
        }
        if (distance >= bar.offsetHeight) {
          bar.style.top = `${distance - (bar.offsetHeight / 2)}`;
        }
        listMove();
      }
    }
  }

  // 将正在播放的歌曲放到列表中间位置
  const setCurrentMusicPosition = () => {
    // 歌曲列表
    const musicList = store.getState().musicList;
    // 当前播放歌曲
    const currentMusic = store.getState().currentMusic;
    // 当前歌曲在播放列表的索引
    const currentIndex = musicList.findIndex((item: SONG) => item.id === currentMusic.id);
    const list = listRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    const barWrapper = barWrapperRef.current;
    let barTop = 0;
    if (bar && content && barWrapper && list) {
      if (musicList.length <= 9) return;
      if (currentIndex <= 4) {
        barTop = 0;
      } else if (currentIndex >= musicList.length - 4) {
        barTop = barWrapper.offsetHeight - bar.offsetHeight;
      } else {
        barTop = ((currentIndex - 4) * 28) / (list.offsetHeight - content.offsetHeight) * (barWrapper.offsetHeight - bar.offsetHeight);
      }
      bar.style.top = `${barTop}px`;
    }
    listMove();
  }

  // 下载音乐
  const downLoadMusic = async (e: any, item: SONG) => {
    e.stopPropagation();
    const res = await downSong({ id: item.id });
    if (res) {
      let url = window.URL.createObjectURL(res);
      let link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', `${item.song_name} - ${item.song_singer} - ${item.song_album || '暂无'}.mp3`);
      document.body.appendChild(link);
      link.click();
    }
  }

  // 播放音乐
  const playMusic = (e: any, item: SONG) => {
    // 设置当前正在播放的音乐
    const currentMusicAction = setCurrentMusic({
      id: item.id,
      song_name: item.song_name,
      song_singer: item.song_singer,
      song_url: item.song_url,
      song_hot: item.song_hot,
      song_album: item.song_album
    });
    store.dispatch(currentMusicAction);
    onPlay();
  }

  // 设置list高度
  const setListHeight = () => {
    const list = listRef.current;
    if (list) {
      list.style.height = `${list.offsetHeight - 28}px`
    }
  }

  // 删除歌曲
  const deleteMusic = (e: any, item: SONG) => {
    e.stopPropagation();
    // 从播放列表删除当前的音乐
    const deleteMusicAction = deleteMusicFromMusicList(item);
    store.dispatch(deleteMusicAction);
    const currentMusic = store.getState().currentMusic;
    const musicList = store.getState().musicList;
    if (item.id === currentMusic.id) {
      nextMusic();
    }
    if (musicList.length === 0) {
      // 设置当前正在播放为空
      const currentMusicAction = setCurrentMusic({
        id: -1,
        song_name: "",
        song_singer: "",
        song_url: "",
        song_hot: "",
        song_album: ""
      });
      store.dispatch(currentMusicAction);
      onPause();
    }
    setListHeight();
    initBarHeight();
    setCurrentMusicPosition();
  }

  // 清除歌曲
  const clearMusic = () => {
    // 从播放列表删除当前的音乐
    const clearMusicAction = clearMusicList([]);
    const currentMusicAction = setCurrentMusic({
      id: -1,
      song_name: "",
      song_singer: "",
      song_url: "",
      song_hot: 0,
      song_album: ""
    });
    store.dispatch(currentMusicAction);
    store.dispatch(clearMusicAction);
    resetProcess();
    onPause();
  }

  // 去详情
  const goDetail = (e: any, record: SONG) => {
    e.stopPropagation();
    (props as any).history.replace(`/songdetail?id=${record.id}`);
  }

  // 收藏全部
  const saveAllMusic = async () => {
    const { username, id, avatar_url } = store.getState().userInfo;
    const musicList = store.getState().musicList;
    if (musicList.length === 0) return message.info('列表没有歌曲！');
    if (username && avatar_url && id) {
      const params = {
        type: 'saveAll',
        user_id: id,
        song_id: musicList.map((item: any) => item.id)
      }
      const res = await saveMusic(params);
      if ((res as RESPONSE_INFO).status === 200) {
        message.info('收藏成功！');
      }
    } else {
      showModal();
    }
  }

  return (
    <div className="musicList" ref={musicListRef}>
      <div className="music-list-head">
        <div className="music-list-head-title">
          播放列表({musicList.length})
        </div>
        <div className="music-list-head-collect" onClick={saveAllMusic}>
          <div className="save_all">
            <Tooltip title="收藏全部">
              <img className="save_all_img" src={require('../../assets/images/save_music.png').default} alt="收藏全部" />
            </Tooltip>
          </div>
          <div className="music-list-common-text">收藏全部</div>
        </div>
        <span className="music-list-head-line"></span>
        <div className="music-list-head-clear">
          <div className="delete_all">
            <img className="delete_all_img" src={require('../../assets/images/delete.png').default} alt="删除" />
          </div>
          <div className="music-list-common-text" onClick={clearMusic}>清除</div>
        </div>
        <div className="music-list-head-close" onClick={toggleMusicList}>
          <img className="music-list-head-close-img" src={require('../../assets/images/close.png').default} alt="关闭" />
        </div>
      </div>
      <div className="music-list-body" ref={contentRef}>
        {
          musicList.length === 0 ? (
            <div className="no-data">暂无歌曲，快去添加吧</div>
          ) : (
              <div className="music-list-body-content" ref={listRef}>
                <ul className="music-list-body-ul">
                  {
                    musicList && musicList.length > 0 && musicList.map((item: SONG) => {
                      return (
                        <li
                          key={item.id}
                          onClick={(e) => playMusic(e, item)}
                          className="music-list-li">
                          <div className={`col ${currentMusic.id === item.id ? 'music-list-li-col-block' : 'music-list-li-col-1'}`}>
                            <div className="music_list_playing">
                              <img src={require('../../assets/images/music_list_playing.png').default} alt="播放中" />
                            </div>
                          </div>
                          <div className="col music-list-li-col-2">
                            <span className="music-list-li-text">
                              {item.song_name}
                            </span>
                          </div>
                          <div className="col music-list-li-col-3">
                            <div className="save">
                              <Tooltip title="收藏">
                                <img src={require('../../assets/images/save_music.png').default} alt="收藏音乐" />
                              </Tooltip>
                            </div>
                            <div className="share">
                              <Tooltip title="分享">
                                <img src={require('../../assets/images/share_music.png').default} alt="分享音乐" />
                              </Tooltip>
                            </div>
                            <div className="download" onClick={(e) => downLoadMusic(e, item)}>
                              <Tooltip title="下载">
                                <img src={require('../../assets/images/music_list_download.png').default} alt="下载音乐" />
                              </Tooltip>
                            </div>
                            <div className="delete" onClick={(e) => deleteMusic(e, item)}>
                              <Tooltip title="删除">
                                <img className="delete_all_img" src={require('../../assets/images/delete.png').default} alt="删除" />
                              </Tooltip>
                            </div>
                          </div>
                          <div className="col music-list-li-col-4">
                            <Tooltip title={item.song_singer}>
                              <span className="music-list-li-text">
                                {item.song_singer}
                              </span>
                            </Tooltip>
                          </div>
                          <div className="col music-list-li-col-5">
                            <Tooltip title={item.song_album ? item.song_album : '暂无'}>
                              <span className="music-list-li-text">
                                {item.song_album || '暂无'}
                              </span>
                            </Tooltip>
                          </div>
                          <div className="col music-list-li-col-6">
                            <div onClick={(e) => goDetail(e, item)}>
                              <Tooltip title="查看来源">
                                <img src={require('../../assets/images/src.png').default} alt="查看来源" />
                              </Tooltip>
                            </div>
                          </div>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
            )
        }
        <div className="music-list-wrapper" ref={barWrapperRef}>
          <div className="music-list-bar" ref={barRef}></div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(MusicList);