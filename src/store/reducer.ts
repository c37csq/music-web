import { SONG } from '../global';
import { CHANGE_ROUTE, CHANGE_LOGIN_STATUS, action, SET_USER_TOKEN, ADD_MUSIC_LIST, SET_CURRENT_MUSIC, DELETE_MUSIC, CLEAR_MUSIC } from './actionTypes';

// 从sessionStorage取出 route 的值
let routeStorage = sessionStorage.getItem('route');

// 从sessionStorage取出musicList的值
let musicListStorage = sessionStorage.getItem('musicList');

// 从sessionStorage取出currentMusic的值
let currentMusicStorage = sessionStorage.getItem('currentMusic');

// 从localStorage取出 token 的值
let tokenStorage = sessionStorage.getItem('token');

// 取出userInfo
let userStorage = sessionStorage.getItem('userInfo');

// 如果sessionStorage没有值则为‘/home’ 否则就为sessionStorage值
let routeUrl: string = routeStorage ? routeStorage : '/home';

// 如果localStorage没有token就为空，否则就为localStorage的值
let token: string = tokenStorage ? tokenStorage : '';

// 如果sessionStorage没有值则为{}, 否则就为sessionStorage
let userInfo = userStorage ? JSON.parse(userStorage) : {};

// 如果sessionStorage没有musicList就为空，否则就为sessionStorage的值
let musicList = musicListStorage ? JSON.parse(musicListStorage) : [];

// 如果sessionStorage没有musicList就为空，否则就为sessionStorage的值
let currentMusic = currentMusicStorage ? JSON.parse(currentMusicStorage) : {
  id: -1,
  song_name: "",
  song_singer: "",
  song_url: "",
  song_introduce: "",
  song_album: "",
  create_user: "",
  create_id: "",
  create_time: "",
  song_hot: 0,
  type: [],
  likePersons: []
};

const initState = {
  // 全局路由
  route: routeUrl,
  // 是注册还是登录
  status: 'index',
  // token
  token: token,
  // 用户信息
  userInfo: userInfo,
  // 播放的音乐的列表
  musicList: musicList,
  // 当前播放的音乐
  currentMusic: currentMusic
} //初始数据

const reducer = (state = initState, action: action) => {  //就是一个方法函数
  const newState = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case CHANGE_ROUTE:
      newState.route = action.value;
      sessionStorage.setItem("route", newState.route);
      return newState;
    case CHANGE_LOGIN_STATUS:
      newState.status = action.value;
      return newState;
    case SET_USER_TOKEN:
      newState.token = action.value.token;
      newState.userInfo = action.value.userInfo;
      return newState;
    case ADD_MUSIC_LIST:
      newState.musicList.push(action.value);
      sessionStorage.setItem("musicList", JSON.stringify(newState.musicList));
      return newState;
    case SET_CURRENT_MUSIC:
      newState.currentMusic = action.value;
      sessionStorage.setItem("currentMusic", JSON.stringify(newState.currentMusic));
      return newState;
    case DELETE_MUSIC:
      const index = newState.musicList.findIndex((item: SONG) => item.id === action.value.id);
      newState.musicList.splice(index, 1);
      sessionStorage.setItem("musicList", JSON.stringify(newState.musicList));
      return newState;
    case CLEAR_MUSIC:
      newState.musicList = action.value;
      sessionStorage.setItem("musicList", JSON.stringify(newState.musicList));
      return newState;
  }
  return state;
}

export default reducer;