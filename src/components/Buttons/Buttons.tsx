import './Buttons.less';
import React from 'react';
import store from '../../store';
import { getSongDetailById, saveMusic } from '../../api';
import { LIKE_PERSONS_ITEM, RESPONSE_INFO, SONG } from '../../global';
import { message } from 'antd';

interface IProps {
  song_id: number,
  song_detail: SONG,
  getSongDetail: Function
}

const Buttons = (props: IProps, ref: any) => {

  // 获取全局用户信息
  const userInfo = store.getState().userInfo;

  const { song_id, song_detail, getSongDetail } = props;

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

  return (
    <div className="buttons">
      <div className="play">
        <div className="play_music">
          <div className="play_music_img">
            <img src={require('../../assets/images/song_detail_play.png').default} alt="播放" />
          </div>
          <span className="play_text">播放</span>
        </div>
        <div className="save_to_list">
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
      <div className="common">
        <div className="save_content">
          <div className="save_content_text">
            下 载
          </div>
        </div>
      </div>
      <div className="common">
        <div className="save_content">
          <div className="save_content_text">
            评 论
          </div>
        </div>
      </div>
    </div>
  )
}

export default Buttons;