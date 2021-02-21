import './Buttons.less';
import React, { useState } from 'react';
import store from '../../store';
import { addHot, saveMusic, downSong } from '../../api';
import { LIKE_PERSONS_ITEM, RESPONSE_INFO, SONG } from '../../global';
import { message } from 'antd';
import Login from '../Login/Login';
import { addMusicList } from '../../store/actionCreators';

interface IProps {
  song_id: number,
  song_detail: SONG,
  getSongDetail: Function,
  obj: any
}

const Buttons = (props: IProps, ref: any) => {

  // 获取全局用户信息
  const userInfo = store.getState().userInfo;

  const { song_id, song_detail, getSongDetail, obj } = props;
  // visible
  const [visible, setVisible] = useState(false);

  // 收藏歌曲
  const save = async () => {
    const params = {
      type: 'save',
      user_id: userInfo.id,
      song_id: song_id
    }
    const res = await saveMusic(params);
    if ((res as RESPONSE_INFO).status === 200) {
      message.info('收藏成功！');
      getSongDetail(song_id);
    }
  }

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
  }

  // 显示弹窗
  const showModal = () => {
    setVisible(true);
  }

  // 取消收藏歌曲
  const disSave = async () => {
    const params = {
      type: 'disSave',
      user_id: userInfo.id,
      song_id: song_id
    }
    const res = await saveMusic(params);
    if ((res as RESPONSE_INFO).status === 200) {
      message.info('取消收藏成功！');
      getSongDetail(song_id);
    }
  }

  // 判断当前登录用户是否收藏该歌曲
  const checkUserIsSaveMusic = () => {
    return song_detail.likePersons.filter((item: LIKE_PERSONS_ITEM) => item.user_id === userInfo.id).length > 0;
  }

  // 播放音乐
  const playMusic = async (obj: any, song_detail: SONG) => {
    const currentMusic = store.getState().currentMusic;
    if ((currentMusic as SONG).id === song_detail.id) return;
    // 播放音乐
    obj.playMusic(song_detail);
    // 增加该条歌曲热度
    const res = await addHot({ song_id: song_detail.id, song_hot: song_detail.song_hot });
  }

  // 下载歌曲
  const downMusic = async (record: SONG) => {
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

  // 添加音乐到全局播放列表
  const addMusic = async (record: SONG) => {
    // 向store中的音乐列表添加一个音乐
    const musicList = store.getState().musicList;
    if (musicList.find((item: SONG) => item.id === record.id)) {
      return message.info('歌曲已经在列表！');
    } else {
      const action = addMusicList(record);
      store.dispatch(action);
      // 增加该条歌曲热度
      const res = await addHot({ song_id: record.id, song_hot: record.song_hot });
      if ((res as any).isSuccess) {
        message.success('添加到播放列表成功！');
      }
    }
  }

  return (
    <div className="buttons">
      <Login closeModal={closeModal} visible={visible} />
      <div className="play">
        <div className="play_music" onClick={() => playMusic(obj, song_detail)}>
          <div className="play_music_img">
            <img src={require('../../assets/images/song_detail_play.png').default} alt="播放" />
          </div>
          <span className="play_text">播放</span>
        </div>
        <div className="save_to_list" onClick={() => addMusic(song_detail)}>
          <img src={require('../../assets/images/song_detail_addlist.png').default} alt="添加到歌单" />
        </div>
      </div>
      <div className="common">
        {
          checkUserIsSaveMusic() ? (
            <div className="save_content" onClick={disSave}>
              <div className="save_content_text">
                取消收藏
              </div>
            </div>
          ) : (
              <div className="save_content" onClick={save}>
                <div className="save_content_text">
                  收 藏
                </div>
              </div>
            )
        }
      </div>
      <div className="common">
        <div className="save_content">
          <div className="save_content_text">
            分 享
          </div>
        </div>
      </div>
      <div className="common" onClick={() => downMusic(song_detail)}>
        <div className="save_content">
          <div className="save_content_text">
            下 载
          </div>
        </div>
      </div>
    </div>
  )
}

export default Buttons;