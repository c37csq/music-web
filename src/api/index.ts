import ajax from './ajax';
import { ADDMUSIC_FORM, ADD_DYNAMIC, ADD_HOT, AVATAR_PROPS, COMMENT, COMMENT_LIST, DELETE_COMMENT, DISGOOD, DISGOOD_DYNAMIC, DOWN_SONG, GET_SONG_DETAIL, GOOD, GOOD_DYNAMIC, LOGIN_FORM, REGESTER_FORM, RELY_COMMENT, SAVE_MUSIC, SONG_PARAMS } from '../global'

// 基本路径
export const BASE = 'http://127.0.0.1:7001/default';

// 图片访问基本路径
export const BASE_IMG = 'http://127.0.0.1:7001';

// 上传用户头像路径
export const BASE_AVATAR_URL = `${BASE}/uploadAvatar`;

// 上传音频路径
export const BASE_VIDEO_URL = `${BASE}/uploadVideo`;

// 删除用户头像
export const deleteAvatar = (params: AVATAR_PROPS) => ajax(BASE + '/deleteAvatar', params, 'POST');

// 删除上传的歌曲
export const deleteVideo = (params: AVATAR_PROPS) => ajax(BASE + '/deleteVideo', params, 'POST');

// 用户注册
export const regesterUser = (params: REGESTER_FORM) => ajax(BASE + '/regesterUser', params, 'POST');

// 用户登录
export const loginUser = (params: LOGIN_FORM) => ajax(BASE + '/loginUser', params, 'POST');

// 歌曲分类
export const getSongTypes = () => ajax(BASE + '/getSongsTypes');

// 分享歌曲
export const shareSongs = (params: ADDMUSIC_FORM) => ajax(BASE + '/shareSongs', params, 'POST');

// 获取歌曲列表
export const getSongs = (params: SONG_PARAMS) => ajax(BASE + '/getSongs', params);

// 增加歌曲热度
export const addHot = (params: ADD_HOT) => ajax(BASE + '/addHot', params, 'POST');

// 下载歌曲
export const downSong = (params: DOWN_SONG) => ajax(BASE + '/downSong', params, 'POST', { responseType: 'blob' });

// 根据歌曲类别获取歌曲详情
export const getSongDetailById = (params: GET_SONG_DETAIL) => ajax(BASE + '/getSongDetailById', params);

// 发表评论
export const submitComment = (params: COMMENT) => ajax(BASE + '/submitComment', params, 'POST');

// 获取评论列表
export const getCommentList = (params: COMMENT_LIST) => ajax(BASE + '/getCommentList', params);

// 回复评论
export const relyComment = (params: RELY_COMMENT) => ajax(BASE + '/relyComment', params, 'POST');

// 回复动态
export const relyDynamic = (params: RELY_COMMENT) => ajax(BASE + '/relyDynamic', params, 'POST');

// 点赞
export const goodToPerson = (params: GOOD) => ajax(BASE + '/goodToPerson', params, 'POST');

// 取消点赞
export const disGoodToPerson = (params: DISGOOD) => ajax(BASE + '/disGoodToPerson', params, 'POST');

// 删除评论
export const deleteComment = (params: DELETE_COMMENT) => ajax(BASE + '/deleteComment', params, 'POST');

// 收藏歌曲
export const saveMusic = (params: SAVE_MUSIC) => ajax(BASE + '/saveMusic', params, 'POST');

// 获取同类歌曲
export const getSameListById = (params: { type: number[], song_id: number }) => ajax(BASE + '/getSameListById', params, 'POST');

// 通过id获取列表
export const getDynamicList = (params: { id: number }) => ajax(BASE + '/getDynamicList', params);

// 通过歌曲关键词获取列表
export const getSongsByLike = (params: { like: string }) => ajax(BASE + '/getSongsByLike', params);

// 添加动态
export const addDynamic = (params: ADD_DYNAMIC) => ajax(BASE + '/addDynamic', params, 'POST');

// 动态列表点赞
export const goodToDynamic = (params: GOOD_DYNAMIC) => ajax(BASE + '/goodToDynamic', params, 'POST');

// 取消点赞
export const disGoodToDynamic = (params: DISGOOD_DYNAMIC) => ajax(BASE + '/disGoodToDynamic', params, 'POST');

// 删除评论
export const deleteDynamic = (params: DELETE_COMMENT) => ajax(BASE + '/deleteDynamic', params, 'POST');
