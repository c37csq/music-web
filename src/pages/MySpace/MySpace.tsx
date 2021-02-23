import * as React from 'react';
import './MySpace.less';
import { Button, Tooltip } from 'antd';
import store from '../../store/index';
import NoLogin from '../../components/NoLogin/NoLogin';
import { useEffect, useState } from 'react';
import Comment from '../../components/Comment/Comment';
import { getDynamicList } from '../../api';

interface IProps { }

const MySpace = (props: IProps, ref: any) => {

  const [token, setToken] = useState(store.getState().token);

  const [userId, setUserId] = useState(store.getState().userInfo.id);

  useEffect(() => {
    getList(userId);
  }, []);

  useEffect(() => {
    // 取消订阅
    // 监听store中的数据
    const cancelSub = store.subscribe(() => {
      const state = store.getState();
      setToken(state.token);
    });
    return () => {
      cancelSub();
    }
  }, []);

  const getList = async (id: number) => {
    if (id < 0) return;
    const params = {
      id: id
    }
    const res = await getDynamicList(params);
    console.log(res);
  }

  return (
    <div className="MySpace_Container">
      {
        token ? (
          <div className="MySpace_Content_Wrapper">
            <div className="left">
              <div className="left_header">
                <div className="left_header_title">
                  动态
                </div>
                <div className="share">
                  <Button className="text-submit" size="small" type="primary">发动态</Button>
                </div>
              </div>
              <div className="list">
                <div className="list_content">
                  <div className="list_item">
                    <div className="avatar">
                      <img src="http://127.0.0.1:7001/public/avatars/2020/12/22/16086370900351.png" alt="头像" />
                    </div>
                    <div className="list_item_content">
                      <div className="comment_list_item_username"><span className="username">Extremegrief</span> 分享单曲</div>
                      <div className="comment_list_item_speak word_wrap">
                        666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
                      </div>
                      <div className="share_music">
                        <div className="left_img">
                          <img src={require('../../assets/images/play_music.png').default} alt="播放"/>
                        </div>
                        <div className="right_info">
                          <div className="name">只要有你</div>
                          <div className="singer">那英/孙楠</div>
                        </div>
                      </div>
                      <div className="item_operator">
                        <div className="time">2021-02-21 11:15:25</div>
                        <div className="operator">
                          <div
                            className="delete">删除</div>
                          <span className="divide">|</span>
                          <div className="good">
                            {/* <div
                              className="good_img">
                              <Tooltip title="取消点赞">
                                <img src={require('../../assets/images/good.png').default} alt="取消点赞" />
                              </Tooltip>
                            </div> */}
                            <div
                              className="disgood_img">
                              <Tooltip title="点赞">
                                <img src={require('../../assets/images/disgood.png').default} alt="点赞" />
                              </Tooltip>
                            </div>
                            <span className="good_counts">
                              &nbsp;&nbsp;
                              (1)
                            </span>
                          </div>
                          <span>|</span>
                          <div className="rely">评论</div>
                        </div>
                      </div>
                      <div className="child_list">
                        <div
                          className="comment_child_item">
                          <div className="comment_child_item_avatar">
                            <img src="http://127.0.0.1:7001/public/avatars/2020/12/22/16086370900351.png" alt="头像" />
                          </div>
                          <div className="comment_child_item_content">
                            <div className="comment_child_item_username">c37csq</div>&emsp;
                                  <span>评论</span>&emsp;
                                  <span className="comment_child_item_username">@Exetrenef</span>
                            <div className="comment_child_item_speak word_wrap">
                              66666666666666666666666666666666666666666666666666666666
                                  </div>
                            <div className="comment_child_item_operator">
                              <div className="time">2021-02-21 11:15:25</div>
                              <div className="operator">
                                <div
                                  className="delete"
                                >删除</div>
                                <span className="divide">|</span>
                                <div className="good">
                                  {/* <div
                                    className="good_img">
                                    <Tooltip title="取消点赞">
                                      <img src={require('../../assets/images/good.png').default} alt="取消点赞" />
                                    </Tooltip>
                                  </div> */}
                                  <div
                                    className="disgood_img">
                                    <Tooltip title="点赞">
                                      <img src={require('../../assets/images/disgood.png').default} alt="点赞" />
                                    </Tooltip>
                                  </div>
                                  <span className="good_counts">
                                    &nbsp;&nbsp;
                                    (1)
                                        </span>
                                </div>
                                <span>|</span>
                                <div className="rely">回复</div>
                              </div>
                            </div>
                          </div>
                        </div>
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
                </div>
              </div>
            </div>
            <div className="right">456</div>
          </div>
        ) : <NoLogin />
      }
    </div>
  )
}

export default MySpace;