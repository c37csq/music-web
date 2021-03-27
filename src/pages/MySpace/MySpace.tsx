import * as React from 'react';
import './MySpace.less';
import { Button, message, Tooltip } from 'antd';
import store from '../../store/index';
import NoLogin from '../../components/NoLogin/NoLogin';
import { useEffect, useState } from 'react';
import Comment from '../../components/Comment/Comment';
import ShareMusic from '../../components/ShareMusic/ShareMusic';
import { addHot, deleteDynamic, disGoodToDynamic, disLikePerson, getDynamicList, getFans, getUserInfo, goodToDynamic, likePerson } from '../../api';
import { CHILD_COMMENT_LIKE, PARENT_COMMENT_LIKE, RELY, RESPONSE_INFO, USERINFO } from '../../global';
import { stopBubble } from '../../utils/utils';
import { GlobalContext } from '../index/default';

interface IProps { }

const MySpace = (props: IProps, ref: any) => {

  const [token, setToken] = useState(store.getState().token);

  const [userId, setUserId] = useState(store.getState().userInfo.id);

  // 用户信息不是储存在本地的
  const [user, setUser] = useState({
    id: -1,
    avatar_url: "",
    sex: "",
    username: "",
    dynamicCounts: 0,
    likeCounts: 0,
    concernedCounts: 0,
    introduce: "",
    age: null,
    fans: [],
    concernPerson: []
  });

  const [dynamicList, setDynamicList] = useState([]);

  const [fansList, setFansList] = useState([]);

  // 父级评论鼠标hover的项
  const [parentHoverId, setParentHoverId] = useState(0);

  // 子级评论鼠标hover的项
  const [childHoverId, setChildHoverId] = useState(0);

  // 当前哪个评论框显示
  const [showId, setShowId] = useState(0);

  // 回复哪个人
  const [relyToInfo, setRelyTo] = useState<RELY>({
    id: 0,
    relyPerson: '',
    parentId: 0
  });

  // 弹出框显示
  const [modalVisible, setModalVisible] = useState(false);
  // 获取全局用户信息
  const userInfo = store.getState().userInfo;

  useEffect(() => {
    // other code
    if (userId && userId > 0) {
      getList(userId);
      getUserDetail(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    // other code
    // 取消订阅
    // 监听store中的数据
    const cancelSub = store.subscribe(() => {
      const state = store.getState();
      setToken(state.token);
      setUserId(state.userInfo.id);
    });
    return () => {
      cancelSub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 请求动态列表数据
  const getList = async (id: number) => {
    const params = {
      id: id
    }
    const res = await getDynamicList(params);
    setDynamicList((res as any).arr);
  }

  //获取粉丝列表
  const getFansList = async (fans: number[]) => {
    const params = {
      idArrs: fans
    }
    const res = await getFans(params);
    setFansList((res as any).result);
  }

  // 获取用户信息
  const getUserDetail = async (id: number) => {
    const res = await getUserInfo({
      user_id: id
    });
    setUser((res as any).data);
    getFansList((res as any).data.fans);
  }

  // 鼠标移入事件
  const showDelete = (id: number) => {
    setParentHoverId(id);
  }

  // 鼠标移出事件
  const hideDelete = (id: number) => {
    setParentHoverId(0);
  }

  // 取消关注
  const disLikeIt = async (item: {
    id: number,
    username: string,
    avatar_url: string,
    introduce: string
  }) => {
    const params = {
      user_id: userId,
      likeUserId: item.id,
      concernCounts: user.concernedCounts
    }
    const res = await disLikePerson(params);
    if ((res as RESPONSE_INFO).status === 200) {
      message.info((res as RESPONSE_INFO).msg);
      getUserDetail(userId);
    }
  }

  // 关注
  const likeIt = async (item: {
    id: number,
    username: string,
    avatar_url: string,
    introduce: string
  }) => {
    const params = {
      user_id: userId,
      likeUserId: item.id,
      concernCounts: user.concernedCounts
    }
    const res = await likePerson(params);
    if ((res as RESPONSE_INFO).status === 200) {
      message.info((res as RESPONSE_INFO).msg);
      getUserDetail(userId);
    }
  }

  // 鼠标移入子评论
  const showChildDelete = (e: any, id: number) => {
    stopBubble(e);
    setChildHoverId(id);
  }

  // 鼠标移出子评论
  const hideChildDelete = (e: any) => {
    stopBubble(e);
    setChildHoverId(0);
  }

  // 判断当前评论是否是当前用户评论
  const checkUserComment = (userInfo: USERINFO, id: number): boolean => {
    let flag = false;
    if (userInfo) {
      if (userInfo.id === id) {
        flag = true;
      }
    }
    return flag;
  }

  // 判断当前用户是否点赞
  const checkUserGood = (userInfo: USERINFO, likePersons: Array<CHILD_COMMENT_LIKE> | Array<PARENT_COMMENT_LIKE>): boolean => {
    let flag = false;
    if (userInfo) {
      likePersons.forEach((item: CHILD_COMMENT_LIKE | PARENT_COMMENT_LIKE) => {
        if (item.id === userInfo.id) {
          flag = true;
        }
      })
    }
    return flag;
  }

  // 播放音乐
  const playMusic = async (obj: any, record: any) => {
    // 播放音乐
    obj.playMusic(record);
    // 增加该条歌曲热度
    const res = await addHot({ song_id: record.id, song_hot: record.song_hot });
    console.log(res);
  }

  // 分享动态
  const share = () => {
    setModalVisible(true);
  }

  // 关闭
  const closeModal = () => {
    setModalVisible(false);
  }

  // 点赞父级列表
  const goodToParentPerson = async (item: any) => {
    let params = {
      type: 'parent',
      username: userInfo.username,
      user_id: userInfo.id,
      toPersonName: item.username,
      toPersonId: item.user_id,
      dynamicId: item.id,
      likeCounts: item.likeCounts
    }
    const res = await goodToDynamic(params);
    if ((res as any).status === 200) {
      message.info('点赞成功！');
      getList(userId);
    }
  }

  // 点赞子列表
  const goodToChildPerson = async (item: any) => {
    let params = {
      type: 'children',
      username: userInfo.username,
      user_id: userInfo.id,
      toPersonName: item.childUsername,
      toPersonId: item.childUserId,
      dynamicId: item.childId,
      likeCounts: item.childLikeCounts
    }
    const res = await goodToDynamic(params);
    if ((res as any).status === 200) {
      message.info('点赞成功！');
      getList(userId);
    }
  }

  // 取消父级列表点赞
  const cancelParentGood = async (item: any) => {
    let params = {
      type: 'parent',
      user_id: userInfo.id,
      dynamicId: item.id,
      likeCounts: item.likeCounts
    }
    const res = await disGoodToDynamic(params);
    if ((res as any).status === 200) {
      message.info('取消点赞成功！');
      getList(userId);
    }
  }

  // 取消父级列表点赞
  const cancelChildGood = async (item: any) => {
    let params = {
      type: 'children',
      user_id: userInfo.id,
      dynamicId: item.childId,
      likeCounts: item.childLikeCounts
    }
    const res = await disGoodToDynamic(params);
    if ((res as any).status === 200) {
      message.info('取消点赞成功！');
      getList(userId);
    }
  }

  // 删除评论
  const deleteParent = async (item: any) => {
    let params;
    if (item.children.length === 0) {
      params = {
        type: 'parent',
        id: item.id,
        user_id: item.user_id,
        dynamicCounts: user.dynamicCounts,
        childId: 0
      }
    } else {
      params = {
        type: 'parent',
        id: item.id,
        user_id: item.user_id,
        dynamicCounts: user.dynamicCounts,
        childId: (item.children as any).map((item: any) => item.childId)
      }
    }
    const res = await deleteDynamic(params);
    if ((res as any).status === 200) {
      message.info('删除成功！');
      getUserDetail(userId);
      getList(userId);
    }
  }

  // 删除子评论
  const deleteChild = async (item: any) => {
    let params = {
      type: 'children',
      id: 0,
      childId: item.childId
    };
    const res = await deleteDynamic(params);
    if ((res as any).status === 200) {
      message.info('删除成功！');
      getList(userId);
    }
  }

  // 回复
  const relyTo = (item: RELY) => {
    if (item.parentId === showId) {
      setShowId(0);
      setRelyTo({
        id: 0,
        relyPerson: '',
        parentId: 0
      });
    } else {
      setShowId(item.parentId);
      setRelyTo(item);
    }
  }

  // 阻止拖拽
  const refuse = (e: any): boolean => {
    e.preventDefault();
    return false;
  }

  return (
    <div className="MySpace_Container">
      {
        token ? (
          <GlobalContext.Consumer>
            {
              (obj: any) =>
                <div className="MySpace_Content_Wrapper">
                  <div className="left">
                    <div className="left_header">
                      <div className="left_header_title">
                        动态
                      </div>
                      <div className="share">
                        <Button
                          onClick={share}
                          className="text-submit"
                          size="small"
                          type="primary">发动态</Button>
                      </div>
                    </div>
                    <div className="list">
                      {
                        (dynamicList || []).length === 0 ? (
                          <div className="no_dynamic">
                            <div className="no_dynamic_img">
                              <img onDragStart={(e) => refuse(e)} src={require('../../assets/images/no_data.png').default} alt="暂无动态" />
                              <div>暂无动态</div>
                            </div>
                          </div>
                        ) : (
                          <div className="list_content">
                            {
                              dynamicList.map((item: any) => {
                                return (
                                  <div
                                    onMouseOver={() => showDelete(item.id)}
                                    onMouseOut={() => hideDelete(item.id)}
                                    className="list_item"
                                    key={item.id}>
                                    <a href={`/#/user/home?id=${item.user_id}`} className="avatar">
                                      <img onDragStart={(e) => refuse(e)} src={item.avatar_url} alt="头像" />
                                    </a>
                                    <div className="list_item_content">
                                      <div className="comment_list_item_username"><a href={`/#/user/home?id=${item.user_id}`} className="username">{item.username}</a> 分享单曲</div>
                                      <div className="comment_list_item_speak word_wrap">
                                        {item.content}
                                      </div>
                                      <div className="share_music">
                                        <div
                                          className="left_img">
                                          <img
                                            onDragStart={(e) => refuse(e)}
                                            onClick={() => playMusic(obj, item.song)}
                                            src={require('../../assets/images/play_music.png').default} alt="播放" />
                                        </div>
                                        <div className="right_info">
                                          <a href={`/#/songdetail?id=${item.song.id}`} className="name">{item.song.song_name}</a>
                                          <div className="singer">{item.song.song_singer}</div>
                                        </div>
                                      </div>
                                      <div className="item_operator">
                                        <div className="time">{item.add_time}</div>
                                        <div className="operator">
                                          <div
                                            onClick={() => deleteParent(item)}
                                            style={{ display: `${checkUserComment(userInfo, item.user_id) && parentHoverId === item.id ? 'block' : 'none'}` }}
                                            className="delete">删除</div>
                                          <span
                                            style={{ display: `${checkUserComment(userInfo, item.user_id) && parentHoverId === item.id ? 'block' : 'none'}` }}
                                            className="divide">|</span>
                                          <div className="good">
                                            <div
                                              onClick={() => cancelParentGood(item)}
                                              style={{ display: `${checkUserGood(userInfo, item.likePersons) ? 'inline-block' : 'none'}` }}
                                              className="good_img">
                                              <Tooltip title="取消点赞">
                                                <img onDragStart={(e) => refuse(e)} src={require('../../assets/images/good.png').default} alt="取消点赞" />
                                              </Tooltip>
                                            </div>
                                            <div
                                              onClick={() => goodToParentPerson(item)}
                                              style={{ display: `${checkUserGood(userInfo, item.likePersons) ? 'none' : 'inline-block'}` }}
                                              className="disgood_img">
                                              <Tooltip title="点赞">
                                                <img onDragStart={(e) => refuse(e)} src={require('../../assets/images/disgood.png').default} alt="点赞" />
                                              </Tooltip>
                                            </div>
                                            <span className="good_counts">
                                              &nbsp;&nbsp;
                                          {
                                                item.likeCounts === 0 ? "" : `(${item.likeCounts})`
                                              }
                                            </span>
                                          </div>
                                          <span>|</span>
                                          <div className="rely" onClick={() => relyTo({
                                            id: item.id,
                                            parentId: item.id,
                                            relyPerson: item.username
                                          })}>评论</div>
                                        </div>
                                      </div>
                                      <div className="child_list">
                                        {
                                          item.children.length > 0 && item.children.map((child: any, index: number) => {
                                            return (
                                              <div
                                                onMouseOver={(e) => showChildDelete(e, child.childId)}
                                                onMouseOut={(e) => hideChildDelete(e)}
                                                key={child.childId}
                                                className="comment_child_item">
                                                <a href={`/#/user/home?id=${child.childUserId}`} className="comment_child_item_avatar">
                                                  <img onDragStart={(e) => refuse(e)} src={child.childAvatarUrl} alt="头像" />
                                                </a>
                                                <div className="comment_child_item_content">
                                                  <a href={`/#/user/home?id=${child.childUserId}`} className="comment_child_item_username">{child.childUsername}</a>&emsp;
                                            <span>回复</span>&emsp;
                                            <span className="comment_child_item_username">@{child.relyPerson}</span>
                                                  <div className="comment_child_item_speak word_wrap">
                                                    {child.childContent}
                                                  </div>
                                                  <div className="comment_child_item_operator">
                                                    <div className="time">{child.childAddTime}</div>
                                                    <div className="operator">
                                                      <div
                                                        onClick={() => deleteChild(child)}
                                                        style={{ display: `${checkUserComment(userInfo, child.childUserId) && childHoverId === child.childId ? 'block' : 'none'}` }}
                                                        className="delete"
                                                      >删除</div>
                                                      <span
                                                        style={{ display: `${checkUserComment(userInfo, child.childUserId) && childHoverId === child.childId ? 'block' : 'none'}` }}
                                                        className="divide">|</span>
                                                      <div className="good">
                                                        <div
                                                          onClick={() => cancelChildGood(child)}
                                                          style={{ display: `${checkUserGood(userInfo, child.likePersons) ? 'inline-block' : 'none'}` }}
                                                          className="good_img">
                                                          <Tooltip title="取消点赞">
                                                            <img onDragStart={(e) => refuse(e)} src={require('../../assets/images/good.png').default} alt="取消点赞" />
                                                          </Tooltip>
                                                        </div>
                                                        <div
                                                          onClick={() => goodToChildPerson(child)}
                                                          style={{ display: `${checkUserGood(userInfo, child.likePersons) ? 'none' : 'inline-block'}` }}
                                                          className="disgood_img">
                                                          <Tooltip title="点赞">
                                                            <img onDragStart={(e) => refuse(e)} src={require('../../assets/images/disgood.png').default} alt="点赞" />
                                                          </Tooltip>
                                                        </div>
                                                        <span className="good_counts">
                                                          &nbsp;&nbsp;
                                                      {
                                                            child.childLikeCounts === 0 ? '' : `(${child.childLikeCounts})`
                                                          }
                                                        </span>
                                                      </div>
                                                      <span>|</span>
                                                      <div className="rely" onClick={() => relyTo({
                                                        id: child.childId,
                                                        parentId: item.id,
                                                        relyPerson: child.childUsername
                                                      })}>回复</div>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          })
                                        }
                                      </div>
                                      <div style={{ display: `${showId === item.id ? 'block' : 'none'}` }} className="item_comment">
                                        <Comment
                                          buttonText="回 复"
                                          relyTo={relyToInfo}
                                          song_id={userId}
                                          getList={getList}
                                          avatarSize={50}
                                          isShowHeader={false}
                                          type="dynamic"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                          </div>
                        )
                      }
                    </div>
                    <ShareMusic
                      user={user}
                      getUserDetail={getUserDetail}
                      closeModal={closeModal}
                      getList={getList}
                      userId={userId}
                      title="发布动态"
                      visible={modalVisible} />
                  </div>
                  <div className="right">
                    <div className="top">
                      <div className="top_content">
                        <div className="person_info">
                          <a href={`/#/user/home?id=${user.id}`} className="info_left">
                            <div className="avatar_img">
                              <img onDragStart={(e) => refuse(e)} src={user.avatar_url} alt="头像" />
                            </div>
                          </a>
                          <div className="info_right">
                            <div className="name">{user.username}</div>
                            <div className="introduce word_wrap">个人介绍：{user.introduce || "暂无"}。</div>
                          </div>
                        </div>
                        <div className="person_counts">
                          <div className="counts_info">
                            <a href={`/#/user/dynamic?id=${user.id}`} className="dynamic">
                              <p className="count">{user.dynamicCounts}</p>
                              <p className="type">动态</p>
                            </a>
                            <a href={`/#/user/follows?id=${user.id}`} className="looks">
                              <p className="count">{user.likeCounts}</p>
                              <p className="type">关注</p>
                            </a>
                            <a href={`/#/user/fans?id=${user.id}`} className="fans">
                              <p className="count">{user.concernedCounts}</p>
                              <p className="type">粉丝</p>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bottom">
                      <div className="fans_header">
                        我的粉丝
                      </div>
                      {
                        fansList.length === 0 ? (
                          <div className="no_fans">
                            暂无粉丝
                          </div>
                        ) : (
                          <div className="fans_content">
                            {
                              fansList.map((item: {
                                id: number,
                                username: string,
                                avatar_url: string,
                                introduce: string
                              }) => (
                                <div key={item.id} className="fans_item">
                                  <a href={`/#/user/home?id=${item.id}`} className="fans_left">
                                    <img src={item.avatar_url} alt={item.username} />
                                  </a>
                                  <div className="fans_middle">
                                    <a href={`/#/user/home?id=${item.id}`} className="username">{item.username}</a>
                                    <p className="introduce text_hidden">介绍：{item.introduce || '暂无'}</p>
                                  </div>
                                  {
                                    (user.concernPerson as number[]).includes(item.id) ? (
                                      <div className="fans_right">
                                        <Button onClick={() => disLikeIt(item)} type="primary" size="small" danger>取消关注</Button>
                                      </div>
                                    ) : (
                                      <div className="fans_right">
                                        <Button onClick={() => likeIt(item)} type="primary" size="small">关注用户</Button>
                                      </div>
                                    )
                                  }

                                </div>
                              ))
                            }
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
            }
          </GlobalContext.Consumer>
        ) : <NoLogin />
      }
    </div>
  )
}

export default MySpace;