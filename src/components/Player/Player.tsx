import './Player.less';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { message, Tooltip } from 'antd'
import store from '../../store/index';
import { RESPONSE_INFO, SONG } from '../../global';
import { getTime } from '../../utils/utils';
import { setCurrentMusic } from '../../store/actionCreators';
import MusicList from '../../components/MusicList/MusicList';
import Login from '../Login/Login';
import { saveMusic } from '../../api/index';
import ShareMusic from '../ShareMusic/ShareMusic';

interface IProps { }

const Player = (props: IProps, ref: any) => {

  // 播放状态  一开始是暂停的
  const [status, setStatus] = useState(false);
  // 当前播放的音乐
  const [currentMusic, setCurrentSong] = useState<any>({
    id: -1,
    song_name: "",
    song_singer: "",
    song_url: "",
    song_hot: 0
  });
  // 当前播放时间
  const [currentTime, setCurrentTime] = useState("00:00");
  // 总时间
  const [totalTime, setTotalTime] = useState("00:00");
  // 歌曲进度条是否可以拖动
  const [processItemMove, setProcessItemMove] = useState(false);
  // 音量进度条是否可以拖动
  const [volumeProgressItemMove, setVolumeProgressItemMove] = useState(false);
  // 音量控制面板是否显示
  const [volumeControl, setVolumeControl] = useState(false);

  // 弹窗显示
  const [visible, setVisible] = useState(false);

  // 分享音乐弹窗显示
  const [shareVisible, setShareVisible] = useState(false);

  // 分享的音乐
  const [shareMusic, setShareMusic] = useState({
    id: -1,
    song_name: "",
    song_singer: "",
    song_url: "",
    song_hot: 0
  });

  const playModeStorage = sessionStorage.getItem('playMode');
  const playModeSession = playModeStorage ? JSON.parse(playModeStorage) : 1;
  // 当前的播放模式  1列表循环 2随机 3单曲
  const [playMode, setPlayMode] = useState(playModeSession);
  // 歌单列表是否显示
  const [isMusicListShow, setMusicListShow] = useState(false);

  // 获取音频元素节点
  const audioRef = useRef<HTMLAudioElement>(null);
  // 获取已经播放进度条的元素节点
  const progressPlayedRef = useRef<HTMLDivElement>(null);
  // 获取拖动节点的元素
  const progressItemRef = useRef<HTMLDivElement>(null);
  // 获取缓存条的节点元素
  const progressBufferedRef = useRef<HTMLDivElement>(null);
  // 获取音量调节进度条
  const volumeProgressRef = useRef<HTMLDivElement>(null);
  // 当前音量
  const volumeProgressCurrentRef = useRef<HTMLDivElement>(null);
  // 音量调节小圆圈
  const volumeProgressItemRef = useRef<HTMLDivElement>(null);
  // 播放总进度条
  const progressRef = useRef<HTMLDivElement>(null);

  // 监听store中的数据
  store.subscribe(() => {
    const currentMusic = store.getState().currentMusic;

    // 设置当前歌曲
    setCurrentSong(currentMusic);
  });

  // 挂载后
  useEffect(() => {
    // other code
    const audio = audioRef.current;
    // 解决音量拖动问题
    bindEvent();
    const currentMusic = store.getState().currentMusic;
    if (currentMusic.id < 0) {
      setStatus(false);
    }
    if (audio) {
      audio.autoplay = true;
      // 一定要重新设置
      setProcessItemMove(processItemMove);
      sessionStorage.setItem('playMode', JSON.stringify(playMode));
      setPlayMode(playMode);
      // 重新设置currentSong
      setCurrentSong(currentMusic);
      // 这里需要设置audio的canplay事件监听  监听浏览器是否能播放
      const checkIsCanPlay = function () {
        //获取总时间
        const totalTime = parseInt((audio as any).duration);
        setTotalTime(getTime(totalTime));
      }
      audio.addEventListener('canplay', checkIsCanPlay, false);
      // 播放中添加时间变化监听
      const changeProgressStyle = function () {
        //获取当前播放时间
        const currentTime = parseInt((audio.currentTime).toString());
        // 缓存对象
        const buffered = audio.buffered;
        // 当前播放进度
        const progressPlayed = progressPlayedRef.current;
        const progressItem = progressItemRef.current;
        // 缓存条节点
        const progressBuffered = progressBufferedRef.current;
        // 当前缓存时间
        let bufferTime = 0;
        if (buffered.length !== 0) {
          bufferTime = buffered.end(buffered.length - 1);
        }
        // 当前缓存缓存宽度计算 500是进度条宽度
        const bufferWidth = 500 * (bufferTime / audio.duration);
        // 当前播放宽度计算 500是进度条宽度
        const playWidth = 500 * (audio.currentTime / audio.duration);
        // 如果正在拖动进度条的时候，不监听播放进度
        if (!processItemMove) {
          if (progressPlayed) {
            progressPlayed.style.width = `${playWidth}px`;
          }
          if (progressItem) {
            // 为什么要减四，因为小圆圈有半径
            progressItem.style.left = `${playWidth - 4}px`;
          }
          setCurrentTime(getTime(currentTime));
          if (progressBuffered) {
            progressBuffered.style.width = `${bufferWidth}px`;
          }
        }
      }
      audio.addEventListener('timeupdate', changeProgressStyle, false);
      // 当前音乐播放完毕
      // 播放完毕后的事件
      const endedPlayMusic = function () {
        const state = store.getState();
        const musicList = state.musicList;
        const currentMusic = state.currentMusic;
        if (musicList.length > 0 && currentMusic) {
          // 找到当前播放音乐的在播放列表的索引
          const currentIndex = musicList.findIndex((item: SONG) => item.id === currentMusic.id);
          // 列表循环
          if (playMode === 1) {
            // 循环播放
            if (musicList[currentIndex + 1]) {
              setCurrentSong(musicList[currentIndex + 1]);
              // 设置全局store正在播放的音乐
              const currentMusicAction = setCurrentMusic(musicList[currentIndex + 1]);
              store.dispatch(currentMusicAction);
              // 切歌后相关操作
              onSwitchAction();
            } else {
              // 设置当前播放音乐
              setCurrentSong(musicList[0]);
              // 设置全局store当前正在播放的音乐
              const currentMusicAction = setCurrentMusic(musicList[0]);
              store.dispatch(currentMusicAction);
              onSwitchAction();
            }
          }
          // 随机播放
          else if (playMode === 2) {
            const randomIndex = Math.floor(Math.random() * musicList.length);
            if (musicList[randomIndex]) {
              setStoreMusic(musicList[randomIndex]);
              onSwitchAction();
            }
          } else if (playMode === 3) {
            onSwitchAction();
          }
        } else {
          onSwitchAction();
        }
      }
      audio.addEventListener("ended", endedPlayMusic, false);
      // 初始化音量
      initVolumeProcess(audio);
      // 初始化模式
      initPlayMode();
      return () => {
        audio.removeEventListener('canplay', checkIsCanPlay, false);
        audio.removeEventListener('timeupdate', changeProgressStyle, false);
        audio.removeEventListener('ended', endedPlayMusic, false);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processItemMove, playMode, status, volumeControl]);

  useEffect(() => {
    setStatus(false);
  }, []);

  // 将方法暴露给父组件
  useImperativeHandle((ref), () => {
    // 这里return 的对象里面方法和属性可以被父组件调用
    return {
      onPlay() {
        onPlay();
      },
      onPause() {
        onPause();
      },
      hideMusicList() {
        toggleMusicList();
      },
      isMusicListShow,
      volumeControl,
      hideVolume() {
        onVolumeControl();
      }
    }
  });

  // 如果拖到外面就绑定document
  const bindEvent = () => {
    document.onmouseup = function (e) {
      if (volumeControl) {
        setVolumeProgressItemMove(false);
      }
      // 阻止事件冒泡
      e.stopPropagation();
      // 这里的判断是关键，一定要判断是处于processItemMove=true的状态，表示当前正在拖动进度条，不然会导致mouseUp和onClick事件的传播问题
      if (processItemMove) {
        // 松开后置item为禁止拖动的状态
        setProcessItemMove(false);
        setProgress(e, "dragEnd");
      }
    }
  }

  // 初始化音量
  const initVolumeProcess = (audio: HTMLAudioElement) => {
    // 获取当前音量条高度
    const volumeProgress = volumeProgressRef.current;
    // 当前音量
    const volumeProgressCurrent = volumeProgressCurrentRef.current;
    // 小圆球
    const volumeProgressItem = volumeProgressItemRef.current;
    // 储存里的音量
    let volumePercentageStorage = sessionStorage.getItem('volumePercentage');
    let volume = volumePercentageStorage ? JSON.parse(volumePercentageStorage) : 0.5;
    // 当前音量条高度
    let volumeProgressLength;
    if (volumeProgress) {
      volumeProgressLength = volumeProgress.offsetHeight;
    }
    // 设置音量进度条
    if (volumeProgressCurrent) {
      volumeProgressCurrent.style.height = `${(volumeProgressLength as any) * volume}px`;
    }
    // 设置小圆球位置
    if (volumeProgressItem) {
      // 需要减去小圆球的半径
      volumeProgressItem.style.bottom = `${(volumeProgressLength as any) * volume - 6}px`
    }

    // 设置音量
    audio.volume = volume;
  };

  // 初始化模式
  const initPlayMode = () => {
    const playModeStorage = sessionStorage.getItem('playMode');

    const playMode = playModeStorage ? JSON.parse(playModeStorage) : 1;
    setPlayMode(playMode);
  }

  // 切歌后相关操作，如果正在播放中，则切歌后还是会直接播放，如果处于暂停，则切歌后不会直接播放
  const onSwitchAction = () => {
    resetProcess();
    const audio = audioRef.current;
    if (status) {
      if (audio) {
        audio.autoplay = true;
        onPlay();
      }
    } else {
      if (audio) {
        audio.autoplay = false;
      }
    }
  }

  // 重新设置当前缓存和播放进度状态，用于切歌后进度条显示
  const resetProcess = () => {
    const progressPlayed = progressPlayedRef.current;
    const progressItem = progressItemRef.current;
    if (progressPlayed) {
      progressPlayed.style.width = "0px";
    }
    if (progressItem) {
      progressItem.style.left = "-4px";
    }
  }

  // 播放
  const onPlay = () => {
    // 没有音乐不允许点击
    const musicList = store.getState().musicList;
    const currentMusic = store.getState().currentMusic;
    const audio = audioRef.current;
    if (musicList.length === 0) {
      return;
    } else {
      // 当前没有播放音乐
      if (currentMusic.id < 0) {
        // 设置当前正在播放的音乐
        const currentMusicAction = setCurrentMusic(musicList[0]);
        store.dispatch(currentMusicAction);
      }
      if (audio) {
        audio.play().catch(() => {
          return;
        });
        setStatus(true);
      }
    }
  };

  // 暂停
  const onPause = () => {
    const audio = audioRef.current;
    if (audio) {
      setStatus(false);
      audio.pause();
    }
  };

  // 音量控制面板显示与隐藏
  const onVolumeControl = () => {
    setVolumeControl(!volumeControl)
  }

  // 音量控制小圆圈按下事件
  const onVolumeProgressItemMouseDown = () => {
    // 设置当前进入可拖动状态
    setVolumeProgressItemMove(true);
  }

  // 音量item鼠标抬起方法监听
  const onVolumeProgressItemMouseUp = (e: any) => {
    if (volumeProgressItemMove) {
      setVolumeProgressItemMove(false);
    }
  };

  // 音量item鼠标拖拽方法监听
  const onVolumeProgressItemMove = (e: any) => {
    if (volumeProgressItemMove) {
      onVolumeProgressSet(e);
    }
  };

  // 设置音量控制条
  const onVolumeProgressSet = (e: any) => {
    // 获取当前音量条高度
    let progressLength;
    // 获取当前偏移量
    let volumeOffsetHeight;
    // 当前音量进度比例
    let volumePercentage = 0;
    // 音量控件外层
    const volumeProgress = volumeProgressRef.current;
    // 拖动小球的高度
    const volumeProgressItem = volumeProgressItemRef.current;
    // 音量进度条实际
    const volumeProgressCurrent = volumeProgressCurrentRef.current;
    if (volumeProgress) {
      progressLength = volumeProgress.offsetHeight;
      volumeOffsetHeight = progressLength - (e.clientY - volumeProgress.getBoundingClientRect().top);
      if (volumeOffsetHeight < 0) {
        volumeOffsetHeight = 0;
      }

      if (volumeOffsetHeight > progressLength) {
        volumeOffsetHeight = progressLength;
      }
      // 音量控制比例
      volumePercentage = volumeOffsetHeight / progressLength;
      // 储存到sessionStorage中
      sessionStorage.setItem('volumePercentage', JSON.stringify(volumePercentage));
      // 设置进度条
      if (volumeProgressCurrent) {
        volumeProgressCurrent.style.height = `${volumeOffsetHeight}px`;
      }
      // 设置小球距离底部的值
      if (volumeProgressItem) {
        volumeProgressItem.style.bottom = `${volumeOffsetHeight - 6}px`;
      }

      // 设置音量
      const audio = audioRef.current;
      if (audio) {
        audio.volume = volumePercentage;
      }
    }
  }

  // 点击播放的进度条
  const onProgressClick = (e: any) => {
    const currentMusic = store.getState().currentMusic;
    if (currentMusic.id < 0 || !status) return;
    setProgress(e, 'click');
  }

  // 设置进度条进度
  const setProgress = (e: any, key: string) => {
    // 播放进度条
    const progressPlayed = progressPlayedRef.current;
    // 播放总宽度
    const progress = progressRef.current;
    // 小圆圈
    const progressItem = progressItemRef.current;
    // 音频
    const audio = audioRef.current;
    if (progress && progressPlayed && audio && progressItem) {
      // 偏移宽度
      let offsetWidth = e.pageX - progressPlayed.getBoundingClientRect().left;
      if (offsetWidth < 0) {
        offsetWidth = 0;
      }
      if (offsetWidth > progress.offsetWidth) {
        offsetWidth = progress.offsetWidth;
      }
      // 偏移比例
      let offsetPercentage = offsetWidth / progress.offsetWidth;
      // 当前播放时间
      let currentTime = audio.duration * offsetPercentage;
      if (key === 'click' || key === 'dragMove') {
        // 设置当前进度条偏移位置
        progressPlayed.style.width = `${offsetWidth}px`;
        progressItem.style.left = `${offsetWidth - 4}px`;
        setCurrentTime(getTime(currentTime as number));
      }
      if (key === 'dragEnd' || key === 'click') {
        (audio as any).currentTime = currentTime;
      }
    }
  }

  // 音乐进度条小圆球 moouseDown
  const onProgressItemMouseDown = (e: any) => {
    const currentMusic = store.getState().currentMusic;
    if (currentMusic.id < 0 || !status) return;
    // 阻止事件冒泡
    e.stopPropagation();
    // 按下后小圆圈为可拖动状态
    setProcessItemMove(true);
  }

  // 音乐进度条小圆圈 移动事件
  const onProgressItemMouseMove = (e: any) => {
    const currentMusic = store.getState().currentMusic;
    if (currentMusic.id < 0 || !status) return;
    // 阻止事件冒泡
    e.stopPropagation();
    if (processItemMove) {
      setProgress(e, "dragMove");
    }
  }

  // 音乐进度条小圆 mouse up 事件
  const onProgressItemMouseUp = (e: any) => {
    const currentMusic = store.getState().currentMusic;
    if (currentMusic.id < 0 || !status) return;
    // 阻止事件冒泡
    e.stopPropagation();
    // 这里的判断是关键，一定要判断是处于processItemMove=true的状态，表示当前正在拖动进度条，不然会导致mouseUp和onClick事件的传播问题
    if (processItemMove) {
      // 松开后置item为禁止拖动的状态
      setProcessItemMove(false);
      setProgress(e, "dragEnd");
    }
  }

  // 切换上一首歌曲
  const previousMusic = () => {
    const musicList = store.getState().musicList;
    const currentMusic = store.getState().currentMusic;
    // 当前没歌 直接返回
    if (currentMusic.id < 0) return;
    if (musicList.length > 1 && currentMusic.id > 0) {
      if (playMode === 1 || playMode === 3) {
        const currentIndex = musicList.findIndex((item: SONG) => item.id === currentMusic.id);
        // 如果上一首歌存在
        if ((musicList[currentIndex - 1])) {
          setStoreMusic(musicList[currentIndex - 1]);
          onSwitchAction();
        } else {
          setStoreMusic(musicList[musicList.length - 1]);
          onSwitchAction();
        }
      } else if (playMode === 2) {
        const randomIndex = Math.floor(Math.random() * musicList.length);
        if (musicList[randomIndex]) {
          setStoreMusic(musicList[randomIndex]);
          onSwitchAction();
        }
      }
    } else {
      setCurrentMusicTime();
    }
  }

  // 下一首歌
  const nextMusic = () => {
    const musicList = store.getState().musicList;
    const currentMusic = store.getState().currentMusic;
    if (currentMusic.id < 0) return;
    if (musicList.length >= 1 && currentMusic.id > 0) {
      // 循环播放
      if (playMode === 1 || playMode === 3) {
        const currentIndex = musicList.findIndex((item: SONG) => item.id === currentMusic.id);
        if (musicList[currentIndex + 1]) {
          setStoreMusic(musicList[currentIndex + 1]);
          onSwitchAction();
        } else {
          setStoreMusic(musicList[0]);
          onSwitchAction();
        }
      } else if (playMode === 2) {
        const randomIndex = Math.floor(Math.random() * musicList.length);
        if (musicList[randomIndex]) {
          setStoreMusic(musicList[randomIndex]);
          onSwitchAction();
        }
      }
    } else {
      setCurrentMusicTime();
    }
  }

  // 重置切歌后的时间
  const setCurrentMusicTime = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      onSwitchAction();
    }
  }

  // 切换播放模式
  const onPlayModeChange = (playMode: number) => {
    if (playMode === 3) {
      setPlayMode(1);
    } else {
      setPlayMode(playMode + 1);
    }
  }

  // 设置当前正在播放的音乐
  const setStoreMusic = (data: SONG) => {
    // 设置当前正在播放的音乐
    const currentMusicAction = setCurrentMusic({
      id: data.id,
      song_name: data.song_name,
      song_singer: data.song_singer,
      song_url: data.song_url,
      song_hot: data.song_hot,
      song_album: data.song_album
    });
    store.dispatch(currentMusicAction);
  }

  // 打开或关闭音乐列表
  const toggleMusicList = () => {
    setMusicListShow(!isMusicListShow);
  }

  // 收藏音乐
  const saveCurrentMusic = async () => {
    const currentMusic = store.getState().currentMusic;
    const { username, id, avatar_url } = store.getState().userInfo;
    if (currentMusic.id < 0) return message.info('当前没有音乐！');
    if (username && avatar_url && id) {
      const params = {
        type: 'save',
        user_id: id,
        song_id: currentMusic.id
      }
      const res = await saveMusic(params);
      if ((res as RESPONSE_INFO).status === 444) {
        message.info('你已收藏该音乐了！');
      } else if ((res as RESPONSE_INFO).status === 200) {
        message.info('收藏成功！');
      }
    } else {
      showModal();
    }
  }

  // 分享当前音乐
  const shareCurrentMusic = async () => {
    const { username, id, avatar_url } = store.getState().userInfo;
    const currentMusic = store.getState().currentMusic;
    if (currentMusic.id < 0) return message.info('当前没有音乐！');
    if (username && avatar_url && id) {
      showShareModal();
      const song = {
        id: currentMusic.id,
        song_name: currentMusic.song_name,
        song_singer: currentMusic.song_singer,
        song_url: currentMusic.song_url,
        song_hot: currentMusic.song_hot,
      }
      setShareMusic(song);
    } else {
      showModal();
    }
  }

  // 显示弹窗
  const showModal = () => {
    setVisible(true);
  }

  // 显示分享弹窗
  const showShareModal = () => {
    setShareVisible(true);
  }

  // 关闭分享弹窗
  const closeShareModal = () => {
    setShareVisible(false);
  }

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
  }
  const { id } = store.getState().userInfo;

  const { song_url, song_singer, song_name } = currentMusic;
  return (
    <div className="player_wrapper">
      <Login closeModal={closeModal} visible={visible} />
      <ShareMusic
        shareMusic={shareMusic}
        userId={id}
        closeModal={closeShareModal}
        title="分享音乐"
        visible={shareVisible} />
      {/* 主要内容 */}
      <div
        className="audio_content"
        onMouseMove={onProgressItemMouseMove}
        onMouseUp={onProgressItemMouseUp}>
        <div className="play_content">
          {/* 左侧控制器 */}
          <div className="left_controller">
            <div className="prev" onClick={previousMusic}>
              <Tooltip title="上一首">
                <img width="28" src={require('../../assets/images/next.png').default} alt="上一首" />
              </Tooltip>
            </div>
            <div className="play">
              <Tooltip title="播放">
                <img
                  width="36"
                  onClick={onPlay}
                  className={status ? 'img_stop' : 'img_play'}
                  src={require('../../assets/images/play_music.png').default}
                  alt="播放" />
                <img
                  width="42"
                  onClick={onPause}
                  className={status ? 'img_play' : 'img_stop'}
                  src={require('../../assets/images/stop_music.png').default}
                  alt="暂停" />
              </Tooltip>
            </div>
            <div className="next" onClick={nextMusic}>
              <Tooltip title="下一首">
                <img width="28" src={require('../../assets/images/next.png').default} alt="上一首" />
              </Tooltip>
            </div>
          </div>
          {/* 中间进度条 */}
          <div className="main_controller">
            <div className="music_controller">
              <div className="music_info">
                <span className="title_info">{song_name}</span>
                <span className="author_info">{song_singer}</span>
              </div>
              <div className="process_time">
                <div
                  className="process_wrapper"
                  ref={progressRef}
                  onClick={onProgressClick}>
                  <div className="process">
                    <div className="progress_buffered" ref={progressBufferedRef}></div>
                    <div className="progress_played" ref={progressPlayedRef}>
                      <div
                        className="process_item"
                        ref={progressItemRef}
                        onMouseDown={onProgressItemMouseDown}>
                        <div className="process_item_inside"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="time">
                  <span className="current_time">{currentTime}</span>
                  /
                  <span className="total_time">{totalTime}</span>
                </div>
              </div>
            </div>
          </div>
          {/* 加入歌单和分享 */}
          <div className="right_folder">
            <div className="save_music" onClick={saveCurrentMusic}>
              <Tooltip title="收藏">
                <img src={require('../../assets/images/save_music.png').default} alt="收藏音乐" />
              </Tooltip>
            </div>
            <div className="share_music" onClick={shareCurrentMusic}>
              <Tooltip title="分享">
                <img src={require('../../assets/images/share_music.png').default} alt="分享音乐" />
              </Tooltip>
            </div>
          </div>
          {/* 右侧音量调节，循环调节，歌单查看 */}
          <div className="right_control">
            <div
              className="volume_controller"
              style={{ visibility: volumeControl ? "visible" : "hidden" }}
              onMouseMove={onVolumeProgressItemMove}
              onMouseUp={onVolumeProgressItemMouseUp}>
              <div
                className="volume_progress"
                onClick={onVolumeProgressSet}
                ref={volumeProgressRef}>
                <div className="volume_current" ref={volumeProgressCurrentRef}>
                  <div
                    className="volume_item"
                    ref={volumeProgressItemRef}
                    onMouseDown={onVolumeProgressItemMouseDown}
                    onMouseUp={onVolumeProgressItemMouseUp}
                  >
                    <div className="volume_item_inside" />
                  </div>
                </div>
              </div>
            </div>
            <div className="volume_img" onClick={onVolumeControl}>
              <Tooltip title="调节音量">
                <img src={require('../../assets/images/volume_img.png').default} alt="音量调节" />
              </Tooltip>
            </div>
            <div className={playMode === 1 ? 'mode_img' : 'active'} onClick={() => onPlayModeChange(playMode)}>
              <Tooltip title="循环">
                <img src={require('../../assets/images/around.png').default} alt="循环" />
              </Tooltip>
            </div>
            <div className={playMode === 2 ? 'mode_img' : 'active'} onClick={() => onPlayModeChange(playMode)}>
              <Tooltip title="随机">
                <img src={require('../../assets/images/random.png').default} alt="随机" />
              </Tooltip>
            </div>
            <div className={playMode === 3 ? 'mode_img' : 'active'} onClick={() => onPlayModeChange(playMode)}>
              <Tooltip title="单曲">
                <img src={require('../../assets/images/single.png').default} alt="单曲" />
              </Tooltip>
            </div>
            <div className="list_img" onClick={toggleMusicList}>
              <Tooltip title="列表">
                <img src={require('../../assets/images/list_img.png').default} alt="列表" />
              </Tooltip>
            </div>
          </div>
          {/* 歌单组件 */}
          {
            isMusicListShow && (
              <MusicList
                showModal={showModal}
                resetProcess={resetProcess}
                onPause={onPause}
                nextMusic={nextMusic}
                onPlay={onPlay}
                toggleMusicList={toggleMusicList} />
            )
          }
          {/* 播放器基础组件 */}
          <audio style={{ visibility: 'hidden' }} src={song_url} ref={audioRef} />
        </div>
      </div>
    </div>
  )
}

export default forwardRef(Player);
