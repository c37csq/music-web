import './CommentList.less';
import React, { useState } from 'react';
import { message, Tooltip } from 'antd';
import { CHILD_COMMENT_ITEM, CHILD_COMMENT_LIKE, COMMENTS, PARENT_COMMENT_LIKE, RELY, USERINFO } from '../../global';
import store from '../../store';
import Comment from '../../components/Comment/Comment';
import { stopBubble } from '../../utils/utils';
import { deleteComment, disGoodToPerson, goodToPerson } from '../../api';

interface IProps {
  commentList: Array<COMMENTS>,
  total: number,
  song_id: number,
  getList: Function
}

const CommentList = (props: IProps, ref: any) => {


  // 父级评论鼠标hover的项
  const [parentHoverId, setParentHoverId] = useState(0);

  // 父级评论鼠标hover的项
  const [childHoverId, setChildHoverId] = useState(0);

  // 当前哪个评论框显示
  const [showId, setShowId] = useState(0);

  // 回复哪个人
  const [relyToInfo, setRelyTo] = useState<RELY>({
    id: 0,
    relyPerson: '',
    parentId: 0
  });

  // 获取全局用户信息
  const userInfo = store.getState().userInfo;

  // 鼠标移入事件
  const showDelete = (id: number) => {
    setParentHoverId(id);
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
        if (item.userId === userInfo.id) {
          flag = true;
        }
      })
    }
    return flag;
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

  // 点赞父级列表
  const goodToParentPerson = async (item: COMMENTS) => {
    let params = {
      type: 'parent',
      username: userInfo.username,
      user_id: userInfo.id,
      toPersonName: item.username,
      toPersonId: item.user_id,
      commentId: item.id,
      likeCounts: item.likeCounts
    }
    const res = await goodToPerson(params);
    if ((res as any).status === 200) {
      message.info('点赞成功！');
      getList(song_id);
    }
  }

  // 取消父级列表点赞
  const cancelParentGood = async (item: COMMENTS) => {
    let params = {
      type: 'parent',
      user_id: userInfo.id,
      commentId: item.id,
      likeCounts: item.likeCounts
    }
    const res = await disGoodToPerson(params);
    if ((res as any).status === 200) {
      message.info('取消点赞成功！');
      getList(song_id);
    }
  }

  // 点赞子级列表
  const goodToChild = async (item: CHILD_COMMENT_ITEM) => {
    let params = {
      type: 'children',
      username: userInfo.username,
      user_id: userInfo.id,
      toPersonName: item.childUsername,
      toPersonId: item.childUserId,
      commentId: item.childId,
      likeCounts: item.childLikeCounts
    }
    const res = await goodToPerson(params);
    if ((res as any).status === 200) {
      message.info('点赞成功！');
      getList(song_id);
    }
  }

  // 取消对子级列表的点赞
  const cancelGoodToChild = async (item: CHILD_COMMENT_ITEM) => {
    let params = {
      type: 'children',
      user_id: userInfo.id,
      commentId: item.childId,
      likeCounts: item.childLikeCounts
    }
    const res = await disGoodToPerson(params);
    if ((res as any).status === 200) {
      message.info('取消点赞成功！');
      getList(song_id);
    }
  }

  // 删除评论
  const deleteParent = async (item: COMMENTS) => {
    let params;
    if (item.children.length === 0) {
      params = {
        type: 'parent',
        id: item.id,
        childId: 0
      }
    } else {
      params = {
        type: 'parent',
        id: item.id,
        childId: (item.children as any).map((item: CHILD_COMMENT_ITEM) => item.childId)
      }
    }
    const res = await deleteComment(params);
    if ((res as any).status === 200) {
      message.info('删除成功！');
      getList(song_id);
    }
  }

  // 删除子评论
  const deleteChild = async (item: CHILD_COMMENT_ITEM) => {
    let params = {
      type: 'children',
      id: 0,
      childId: item.childId
    };
    const res = await deleteComment(params);
    if ((res as any).status === 200) {
      message.info('删除成功！');
      getList(song_id);
    }
  }

  const { commentList, total, song_id, getList } = props;

  return (
    <div className="comment_list_wrapper">
      <div className="comment_list_head">
        <div className="comment_list_title">
          {
            total === 0 ? "暂无评论" : `全部评论（${total}）`
          }
        </div>
      </div>
      <div className="comment_list_content">
        {
          commentList.length === 0 ? (
            <div className="no_comments">
              <div className="no_comments_img">
                <img src={require('../../assets/images/no_data.png').default} alt="暂无数据" />
                <div>暂无评论</div>
              </div>
            </div>
          ) : (
              commentList.map((item: COMMENTS, index) => {
                return (
                  <div
                    onMouseOver={() => showDelete(item.id)}
                    onMouseOut={() => hideDelete(item.id)}
                    key={item.id}
                    className="comment_list_item">
                    <div className="comment_list_item_avatar">
                      <img src={item.avatar_url} alt="头像" />
                    </div>
                    <div className="comment_list_item_content">
                      <div className="comment_list_item_username">{item.username}</div>
                      <div className="comment_list_item_speak word_wrap">
                        {item.content}
                      </div>
                      <div className="comment_list_item_operator">
                        <div className="time">{item.add_time}</div>
                        <div className="operator">
                          <div
                            onClick={() => deleteParent(item)}
                            className="delete"
                            style={{ display: `${checkUserComment(userInfo, item.user_id) && parentHoverId === item.id ? 'block' : 'none'}` }}>删除</div>
                          <span className="divide" style={{ display: `${checkUserComment(userInfo, item.user_id) && parentHoverId === item.id ? 'block' : 'none'}` }}>|</span>
                          <div className="good">
                            <div
                              onClick={() => cancelParentGood(item)}
                              style={{ display: `${checkUserGood(userInfo, item.likePersons) ? 'inline-block' : 'none'}` }}
                              className="good_img">
                              <Tooltip title="取消点赞">
                                <img src={require('../../assets/images/good.png').default} alt="取消点赞" />
                              </Tooltip>
                            </div>
                            <div
                              onClick={() => goodToParentPerson(item)}
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
                          <div className="rely" onClick={() => relyTo({
                            id: item.id,
                            parentId: item.id,
                            relyPerson: item.username
                          })}>回复</div>
                        </div>
                      </div>
                      <div className="comment_child_list">
                        {
                          item.children.length > 0 && (item.children as Array<CHILD_COMMENT_ITEM>).map((child: CHILD_COMMENT_ITEM) => {
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
                                        onClick={() => deleteChild(child)}
                                        className="delete"
                                        style={{ display: `${checkUserComment(userInfo, child.childUserId) && childHoverId === child.childId ? 'block' : 'none'}` }}>删除</div>
                                      <span className="divide" style={{ display: `${checkUserComment(userInfo, child.childUserId) && childHoverId === child.childId ? 'block' : 'none'}` }}>|</span>
                                      <div className="good">
                                        <div
                                          onClick={() => cancelGoodToChild(child)}
                                          style={{ display: `${checkUserGood(userInfo, child.likePersons) ? 'inline-block' : 'none'}` }}
                                          className="good_img">
                                          <Tooltip title="取消点赞">
                                            <img src={require('../../assets/images/good.png').default} alt="取消点赞" />
                                          </Tooltip>
                                        </div>
                                        <div
                                          onClick={() => goodToChild(child)}
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
                          relyTo={relyToInfo}
                          avatarSize={40}
                          getList={getList}
                          isShowHeader={false}
                          song_id={song_id}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )
        }
      </div>
    </div>
  )
}

export default CommentList;