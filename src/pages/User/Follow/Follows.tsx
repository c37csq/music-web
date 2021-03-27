import * as React from 'react';
import { useEffect, useState } from 'react';
import { getConcernDetailList, getUserInfo } from '../../../api';
import store from '../../../store';
import './Follows.less';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps { }

const Follows = (props: IProps, ref: any) => {

  const { search } = (props as any).location;
  // 取到id
  const id = parseInt(search.replace(/^\?/, '').split('=')[1]);

  const [userId, setUserId] = useState(id);

  // 关注列表
  const [concernList, setConcernList] = useState([]);

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

  const [flag, setFlag] = useState(false);

  const userInfo = store.getState().userInfo;

  useEffect(() => {
    // other code
    if (userId && userId > 0) {
      getUserDetail(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    // other code
    // 监听路由改变
    props.history.listen(route => {
      const newId = parseInt(route.search.split('=')[1]);
      if (!flag) {
        setUserId(newId);
      }
    })
    // 防止组件销毁后继续set组件状态引发报错
    return () => {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // other code
    // 取消订阅
    const cancelSub = store.subscribe(() => {
      getUserDetail(userId);
    });
    return () => {
      cancelSub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取用户信息
  const getUserDetail = async (id: number) => {
    const res = await getUserInfo({
      user_id: id
    });
    setUser((res as any).data);
    getConcernedList((res as any).data.concernPerson);
  }

  // 判断是否关注或互相关注
  const setStatus = (item: {
    id: number,
    username: string,
    avatar_url: string,
    introduce: string,
    sex: string,
    likeCounts: number,
    concernedCounts: number,
    dynamicCounts: number,
    fans: number[],
    concernPerson: number[]
  }) => {
    const { id } = userInfo;
    const { fans, concernPerson } = item;
    let status = '';
    if (id === item.id) {
      return '当前本人';
    }
    if ((fans as number[]).includes(id) && (concernPerson as number[]).includes(id)) {
      status = '互相关注';
    } else if (!(fans as number[]).includes(id) || !id) {
      status = '没有关注';
    } else {
      status = '已经关注';
    }
    return status;
  }

  // 判断是否是自己访问当前页面
  const checkUser = (): boolean => {
    const { id } = userInfo;
    if (id === userId) {
      return true;
    }
    return false;
  }

  // 获取关注列表
  const getConcernedList = async (concernPersons: number[]) => {
    const params = {
      idArrs: concernPersons
    }
    const res = await getConcernDetailList(params);
    setConcernList((res as any).result);
  }

  return (
    <div className="follow_page">
      <div className="follow_header">
        <div className="header_title">
          {
            checkUser() ? `我的关注（${concernList.length}）` : `TA的关注（${concernList.length}）`
          }
        </div>
      </div>
      {
        concernList.length === 0 ? (
          <div className="no_follow">
            暂无关注
          </div>
        ) : (
          <div className="follow_content">
            {
              concernList.map((item: {
                id: number,
                username: string,
                avatar_url: string,
                introduce: string,
                sex: string,
                likeCounts: number,
                concernedCounts: number,
                dynamicCounts: number,
                fans: number[],
                concernPerson: number[]
              }) => (
                <div className="follow_item" key={item.id}>
                  <a href={`/#/user/home?id=${item.id}`} className="follow_left">
                    <img src={item.avatar_url} alt={item.username} />
                  </a>
                  <div className="follow_middle">
                    <a href={`/#/user/home?id=${item.id}`} className="username">{item.username}</a>
                    <p className="info">
                      <a href={`/#/user/dynamic?id=${item.id}`} className="type">动态<span>{item.dynamicCounts}</span></a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href={`/#/user/follows?id=${item.id}`} className="type">关注<span>{item.likeCounts}</span></a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href={`/#/user/fans?id=${item.id}`} className="type">粉丝<span>{item.concernedCounts}</span></a>
                    </p>
                    <p className="introduce text_hidden">{item.introduce || '暂无个人介绍'}</p>
                  </div>
                  <div className="follow_right">
                    {setStatus(item)}
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  )
}

export default withRouter(Follows);