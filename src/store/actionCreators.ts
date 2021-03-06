import { CHANGE_SHARE_STATUS, CLEAR_MUSIC, CHANGE_ROUTE, DELETE_MUSIC, CHANGE_LOGIN_STATUS, action, SET_USER_TOKEN, ADD_MUSIC_LIST, SET_CURRENT_MUSIC } from './actionTypes';

// 改变全局路由
export const changeRoute = (value: any): action => ({
  type: CHANGE_ROUTE,
  value
});

// 改变登录状态
export const changeLoginStatus = (value: any): action => ({
  type: CHANGE_LOGIN_STATUS,
  value
});

// 设置 储存用户信息和token到store
export const setUserToken = (value: any): action => ({
  type: SET_USER_TOKEN,
  value
});

// 设置 向全局音乐列表添加一条歌曲
export const addMusicList = (value: any): action => ({
  type: ADD_MUSIC_LIST,
  value
})

// 设置 全局播放的音乐
export const setCurrentMusic = (value: any): action => ({
  type: SET_CURRENT_MUSIC,
  value
})

// 从音乐列表里删除一个数据
export const deleteMusicFromMusicList = (value: any): action => ({
  type: DELETE_MUSIC,
  value
})

// 清空歌曲列表
export const clearMusicList = (value: any): action => ({
  type: CLEAR_MUSIC,
  value
})

// 改变分享状态
export const changeShareStatus = (value: any): action => ({
  type: CHANGE_SHARE_STATUS,
  value
})


