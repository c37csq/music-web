import * as React from 'react';
import './MySpace.less';
import { Button, Tooltip } from 'antd';
import store from '../../store/index';
import NoLogin from '../../components/NoLogin/NoLogin';
import { useEffect, useState } from 'react';
import Comment from '../../components/Comment/Comment';
import ShareMusic from '../../components/ShareMusic/ShareMusic';
import { addHot, getDynamicList } from '../../api';
import { CHILD_COMMENT_LIKE, PARENT_COMMENT_LIKE, SONG, USERINFO } from '../../global';
import { stopBubble } from '../../utils/utils';
import { GlobalContext } from '../index/default';

interface IProps { }

const MySpace = (props: IProps, ref: any) => {

  const [token, setToken] = useState(store.getState().token);

  const [userId, setUserId] = useState(store.getState().userInfo.id);

  const [dynamicList, setDynamicList] = useState([]);

  // 父级评论鼠标hover的项
  const [parentHoverId, setParentHoverId] = useState(0);

  // 子级评论鼠标hover的项
  const [childHoverId, setChildHoverId] = useState(0);

  // 弹出框显示
  const [modalVisible, setModalVisible] = useState(false);
  // 获取全局用户信息
  const userInfo = store.getState().userInfo;

  useEffect(() => {
    if (userId && userId > 0) {
      getList(userId);
    }
  }, [userId]);

  useEffect(() => {
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
  }, []);

  // 请求动态列表数据
  const getList = async (id: number) => {
    const params = {
      id: id
    }
    const res = await getDynamicList(params);
    setDynamicList((res as any).arr);
  }

  // 鼠标移入事件
  const showDelete = (id: number) => {
    setParentHoverId(id);
  }

  // 鼠标移出事件
  const hideDelete = (id: number) => {
    setParentHoverId(0);
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
    const currentMusic = store.getState().currentMusic;
    if ((currentMusic as SONG).id === record.id) return;
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
                        dynamicList.length === 0 ? (
                          <div className="no_dynamic">
                            <div className="no_dynamic_img">
                              <img src={require('../../assets/images/no_data.png').default} alt="暂无动态" />
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
                                      <div className="avatar">
                                        <img src={item.avatar_url} alt="头像" />
                                      </div>
                                      <div className="list_item_content">
                                        <div className="comment_list_item_username"><span className="username">{item.username}</span> 分享单曲</div>
                                        <div className="comment_list_item_speak word_wrap">
                                          {item.content}
                                        </div>
                                        <div className="share_music">
                                          <div
                                            className="left_img">
                                            <img
                                              onClick={() => playMusic(obj, item.song)}
                                              src={require('../../assets/images/play_music.png').default} alt="播放" />
                                          </div>
                                          <div className="right_info">
                                            <div className="name">{item.song.song_name}</div>
                                            <div className="singer">{item.song.song_singer}</div>
                                          </div>
                                        </div>
                                        <div className="item_operator">
                                          <div className="time">{item.add_time}</div>
                                          <div className="operator">
                                            <div
                                              style={{ display: `${checkUserComment(userInfo, item.user_id) && parentHoverId === item.id ? 'block' : 'none'}` }}
                                              className="delete">删除</div>
                                            <span
                                              style={{ display: `${checkUserComment(userInfo, item.user_id) && parentHoverId === item.id ? 'block' : 'none'}` }}
                                              className="divide">|</span>
                                            <div className="good">
                                              <div
                                                style={{ display: `${checkUserGood(userInfo, item.likePersons) ? 'inline-block' : 'none'}` }}
                                                className="good_img">
                                                <Tooltip title="取消点赞">
                                                  <img src={require('../../assets/images/good.png').default} alt="取消点赞" />
                                                </Tooltip>
                                              </div>
                                              <div
                                                style={{ display: `${checkUserGood(userInfo, item.likePersons) ? 'none' : 'inline-block'}` }}
                                                className="disgood_img">
                                                <Tooltip title="点赞">
                                                  <img src={require('../../assets/images/disgood.png').default} alt="点赞" />
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
                                            <div className="rely">评论</div>
                                          </div>
                                        </div>
                                        <div className="child_list">
                                          {
                                            item.children.length > 0 && item.children.map((child: any) => {
                                              return (
                                                <div
                                                  onMouseOver={(e) => showChildDelete(e, child.childId)}
                                                  onMouseOut={(e) => hideChildDelete(e)}
                                                  key={child.childId}
                                                  className="comment_child_item">
                                                  <div className="comment_child_item_avatar">
                                                    <img src={child.childAvatarUrl} alt="头像" />
                                                  </div>
                                                  <div className="comment_child_item_content">
                                                    <div className="comment_child_item_username">{child.childUsername}</div>&emsp;
                                            <span>回复</span>&emsp;
                                            <span className="comment_child_item_username">@{child.relyPerson}</span>
                                                    <div className="comment_child_item_speak word_wrap">
                                                      {child.childContent}
                                                    </div>
                                                    <div className="comment_child_item_operator">
                                                      <div className="time">{child.childAddTime}</div>
                                                      <div className="operator">
                                                        <div
                                                          style={{ display: `${checkUserComment(userInfo, child.childUserId) && childHoverId === child.childId ? 'block' : 'none'}` }}
                                                          className="delete"
                                                        >删除</div>
                                                        <span
                                                          style={{ display: `${checkUserComment(userInfo, child.childUserId) && childHoverId === child.childId ? 'block' : 'none'}` }}
                                                          className="divide">|</span>
                                                        <div className="good">
                                                          <div
                                                            style={{ display: `${checkUserGood(userInfo, child.likePersons) ? 'inline-block' : 'none'}` }}
                                                            className="good_img">
                                                            <Tooltip title="取消点赞">
                                                              <img src={require('../../assets/images/good.png').default} alt="取消点赞" />
                                                            </Tooltip>
                                                          </div>
                                                          <div
                                                            style={{ display: `${checkUserGood(userInfo, child.likePersons) ? 'none' : 'inline-block'}` }}
                                                            className="disgood_img">
                                                            <Tooltip title="点赞">
                                                              <img src={require('../../assets/images/disgood.png').default} alt="点赞" />
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
                                                        <div className="rely">回复</div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            })
                                          }
                                        </div>
                                        <div className="item_comment">
                                          <Comment
                                            song_id={1}
                                            getList={getList}
                                            avatarSize={50}
                                            isShowHeader={false}
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
                      title="发布动态"
                      visible={modalVisible}/>
                  </div>
                  <div className="right">456</div>
                </div>
            }
          </GlobalContext.Consumer>
        ) : <NoLogin />
      }
    </div>
  )
}

export default MySpace;