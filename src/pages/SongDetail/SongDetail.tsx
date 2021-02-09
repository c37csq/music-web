import './SongDetail.less';
import React, { useEffect, useState } from 'react';
import { Tooltip, Tag } from 'antd';
import Buttons from '../../components/Buttons/Buttons';
import { getCommentList, getSongDetailById } from '../../api';
import { COMMENTS, LIKE_PERSONS_ITEM, SONG, SONG_TYPE } from '../../global';
import Comment from '../../components/Comment/Comment';
import CommentList from '../../components/CommentList/CommentList';
import store from '../../store';

interface IProps { }

const SongDetail = (props: IProps, ref: any) => {

  const { search } = (props as any).location;
  // 取到id
  const id = parseInt(search.replace(/^\?/, '').split('=')[1]);

  const [song_detail, setSongDetail] = useState<SONG>({
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
  });

  const [commentList, setCommentList] = useState([]);

  const [flag, setFlag] = useState(false);

  useEffect(() => {
    // other code
    // 根据id请求数据
    getSongDetail(id);
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 解决登录不刷新问题
  useEffect(() => {
    // other code
    // 取消订阅
    const cancelSub = store.subscribe(() => {
      if (!flag) {
        getList();
        getSongDetail(id);
      }
    });
    return () => {
      setFlag(true);
      cancelSub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取列表
  const getList = async () => {
    const res = await getCommentList({ song_id: id });
    const list = setList((res as any).arr);
    setCommentList(list);
  }

  // 处理列表数据
  const setList = (list: any) => {
    list.forEach((item: COMMENTS) => {
      if (item.children.length !== 0) {
        item.children.sort((a: any, b: any) => Date.parse(b.childAddTime) - Date.parse(a.childAddTime));
      }
    });
    return list;
  }

  // 获取歌曲详情
  const getSongDetail = async (id: number) => {
    const res = await getSongDetailById({ id });
    setSongDetail((res as any).data[0]);
  }

  // 计算全部评论数量
  const getCommentNums = (commentList: Array<COMMENTS>) => {
    let count = 0
    commentList.forEach((item: COMMENTS) => {
      if (item.children.length > 0) {
        count += item.children.length;
      }
      count += 1;
    });
    return count;
  }

  return (
    <div className="song_detail_wrapper">
      <div className="song_detail_content">
        <div className="song_detail_content_left">
          <div className="song_detail_content_left_top">
            <div className="content">
              <div className="content_title_wrapper">
                <div className="song_name">
                  <div className="song">单曲：</div>
                  <div className="content_title">
                    <div className="content_title_img">
                      <img src={require('../../assets/images/song_detail.png').default} alt="单曲" />
                    </div>
                    <h3>{song_detail.song_name}</h3>
                  </div>
                </div>
                <div className="song_type">
                  <span className="song_tag">歌曲标签：</span>
                  <div>
                    {
                      (song_detail.type as SONG_TYPE[]).map((item: SONG_TYPE) => {
                        return (
                          <Tag key={item.typeId}>{item.typeName}</Tag>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
              <div className="content_person">
                <div className="content_singer">
                  歌手：
                  <Tooltip placement="topLeft" title={song_detail.song_singer}>
                    <span className="singer text_hidden">{song_detail.song_singer}</span>
                  </Tooltip>
                </div>
                <div className="content_create">
                  发布者：
                  <Tooltip placement="topLeft" title={song_detail.create_user}>
                    <span className="creator text_hidden">{song_detail.create_user}</span>
                  </Tooltip>
                </div>
              </div>
              <div className="content_info">
                <div className="content_album">所属专辑：<span className="album text_hidden">{song_detail.song_album || "暂无"}</span></div>
                <div className="content_time">发布时间：<span className="time">{song_detail.create_time}</span></div>
              </div>
              <div className="operator">
                <Buttons
                  getSongDetail={getSongDetail}
                  song_detail={song_detail}
                  song_id={id} />
              </div>
              <div className="introduce_wrapper">
                <p className="song_introduce">歌曲描述：</p>
                <div className="introduce">
                  <span className="word_wrap">{song_detail.song_introduce}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="song_detail_content_left_bottom">
            <div className="comment_area">
              <Comment
                avatarSize={50}
                isShowHeader={true}
                getList={getList}
                total={getCommentNums(commentList)}
                song_id={id} />
            </div>
            <div className="comment_list">
              <CommentList
                getList={getList}
                total={getCommentNums(commentList)}
                commentList={commentList}
                song_id={id} />
            </div>
          </div>
        </div>
        <div className="song_detail_content_right">
          <div className="top">
            <div className="top_title">
              <h1>喜欢这首歌的人</h1>
            </div>
            <div className="top_content">
              {
                (song_detail.likePersons as LIKE_PERSONS_ITEM[]).slice(0, 6).map((item: LIKE_PERSONS_ITEM) => {
                  return (
                    <div key={item.user_id} className="item_avatar">
                      <img src={item.avatar_url} alt={item.username} />
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className="bottom"></div>
        </div>
      </div>
    </div>
  )
}

export default SongDetail;