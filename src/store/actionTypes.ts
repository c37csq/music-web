// action类型
export type action = {
  type: string,
  value: any
}

// 改变全局路由
export const CHANGE_ROUTE = 'changeRoute';

// 切换状态看是否是登录还是注册
export const CHANGE_LOGIN_STATUS = 'changeLoginStatus';

// 设置store中的userInfo和token
export const SET_USER_TOKEN = 'setUserToken';

// 添加一条音乐到播放列表
export const ADD_MUSIC_LIST = 'addMusicList';

// 设置当前播放的音乐
export const SET_CURRENT_MUSIC = 'setCurrentMusic';

// 删除一条音乐
export const DELETE_MUSIC = 'deleteMusic';


