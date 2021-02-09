// 图片上传的类型
export type imgItem = {
  uid: string,
  name: string,
  status: string,
  url: string
}

// 删除用户头像参数
export type AVATAR_PROPS = {
  url: string
}

// 删除用户头像返回类型
export type delAvatarResponse = {
  status: number,
  msg: string
}

// 用户注册参数类型声明
export type REGESTER_FORM = {
  username: string,
  password: string,
  confirm_password: string,
  avatar: string
}


// 分享音乐参数类型
export type ADDMUSIC_FORM = {
  song_name: string,
  song_singer: string,
  song_album?: string,
  song_url: string,
  song_type: Array<SONG_ITEM>,
  song_introduce: string,
  create_user: string,
  create_id: number,
  create_time: number
}

// 用户登录提交参数类型声明
export type LOGIN_FORM = {
  username: string,
  password: string
}

// 用户注册返回信息
export type RESPONSE_INFO = {
  msg: string,
  status: number,
}

// 返回用户信息类型
export type USERINFO = {
  username: string,
  id: number,
  avatar_url: string
}

// 用户登录返回信息
export type LOGIN_INFO = {
  msg: string,
  status: number,
  token: string,
  data: USERINFO
}

// 定义改变头像状态传值类型
export type AVATAR_PROP = {
  token: string,
  avatar_url: string
}

export interface SONG_ITEM  {
  id: number,
  name: string
}

export interface IMG_MAP {
  [name: string]: string
}

// 歌曲类别类型
export type SONG_TYPES = {
  '语种': Array<SONG_ITEM>,
  '风格': Array<SONG_ITEM>,
  '场景': Array<SONG_ITEM>,
  '情感': Array<SONG_ITEM>,
  '主题': Array<SONG_ITEM>
}

// 歌曲列表项
export type SONG = {
  id: number,
  song_name: string,
  song_singer: string,
  song_url: string,
  song_introduce: string,
  song_album: string,
  create_user: string,
  create_id: string,
  create_time: string,
  song_hot: number,
  type: SONG_TYPE[],
  likePersons: LIKE_PERSONS_ITEM[] |[]
}

export type LIKE_PERSONS_ITEM = {
  user_id: number,
  username: string,
  avatar_url: string
}

// 定义store状态的类型
export type STORE = {
  route: string,
  status: string
  token: string,
  userInfo: USERINFO,
  musicList: Array<SONG>
}

// 定义获取歌曲列表的参数
export type SONG_PARAMS = {
  status: string,
  typeId: number
}

// 增加歌曲热度参数类型
export type ADD_HOT = {
  song_id: number,
  song_hot: number
}

// 下载歌曲传递参数类型
export type DOWN_SONG = {
  id: number
}

// 通过id请求歌曲详情
export type GET_SONG_DETAIL = {
  id: number
}

// 歌曲类别类型
export type SONG_TYPE = {
  typeName: string,
  typeId: number
}

// 评论参数类型
export type COMMENT = {
  username: string,
  avatar_url: string,
  add_time: number,
  content: string,
  song_id: number,
  user_id: number
}

// 获取评论列表
export type COMMENT_LIST = {
  song_id: number
}

// 评论列表类型
export type COMMENTS = {
  id: number,
  likeCounts: number,
  username: string,
  avatar_url: string,
  add_time: string,
  content: string,
  song_id: number,
  user_id: number,
  children: Array<CHILD_COMMENT_ITEM> | [],
  likePersons: Array<PARENT_COMMENT_LIKE> | []
}

// 评论子级列表项
export type CHILD_COMMENT_ITEM = {
  childId: number,
  childLikeCounts: number,
  childUsername: string,
  childAvatarUrl: string,
  childAddTime: string,
  childContent: string,
  childUserId: number,
  relyPerson: string,
  parentId: number,
  likePersons: Array<CHILD_COMMENT_LIKE> | []
}

export type CHILD_COMMENT_LIKE = {
  id: number,
  username: string,
  userId: number,
  commentChildId: number
}

export type PARENT_COMMENT_LIKE = {
  id: number,
  username: string,
  userId: number,
  commentParentId: number
}

// 回复类型
export type RELY = {
  id: number,
  parentId: number,
  relyPerson: string
}

// 回复评论参数类型
export type RELY_COMMENT = {
  parentId: number,
  username: string,
  avatar_url: string,
  add_time: number,
  content: string,
  user_id: number,
  relyPerson: string
}

// 点赞需要的参数类型
export type GOOD = {
  type: string,
  username: string,
  user_id: number,
  toPersonName: string,
  toPersonId: number,
  commentId: number,
  likeCounts: number
}

// 取消点赞参数类型
export type DISGOOD = {
  type: string,
  user_id: number,
  commentId: number,
  likeCounts: number
}

// 删除评论
export type DELETE_COMMENT = {
  type: string,
  id: number,
  childId: number | number[]
}

// 收藏歌曲传递的参数
export type SAVE_MUSIC = {
  user_id: number,
  song_id: number
}