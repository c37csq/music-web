import * as React from 'react';
import { useEffect, useState } from 'react';
import { getFansDetailList, getUserInfo } from '../../../api';
import store from '../../../store';
import './Fans.less';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps { }

const Fans = (props: IProps, ref: any) => {

  const { search } = (props as any).location;
  // 取到id
  const id = parseInt(search.replace(/^\?/, '').split('=')[1]);

  const [userId, setUserId] = useState(id);

  // 粉丝列表
  const [fansList, setFansList] = useState([]);

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
    getFansList((res as any).data.fans);
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
  const getFansList = async (fans: number[]) => {
    const params = {
      idArrs: fans
    }
    const res = await getFansDetailList(params);
    setFansList((res as any).result);
  }

  return (
    <div className="fans_page">
      <div className="fans_header">
        <div className="header_title">
          {
            checkUser() ? `我的粉丝（${fansList.length}）` : `TA的粉丝（${fansList.length}）`
          }
        </div>
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
                introduce: string,
                sex: string,
                likeCounts: number,
                concernedCounts: number,
                dynamicCounts: number,
                fans: number[],
                concernPerson: number[]
              }) => (
                <div className="fans_item" key={item.id}>
                  <a href={`/#/user/home?id=${item.id}`} className="fans_left">
                    <img src={item.avatar_url} alt={item.username} />
                  </a>
                  <div className="fans_middle">
                    <a href={`/#/user/home?id=${item.id}`} className="username">
                      {item.username}
                      {
                        !(item.sex) ? (
                          ""
                        ) : (
                          <>
                            {
                              item.sex === 'female' ? (
                                <div style={{ display: 'inline-block', width: '15px', height: '15px', marginLeft: '8px' }}>
                                  <img width="15" height="15" src={require('../../../assets/images/female.png').default} alt="女" />
                                </div>
                              ) : (
                                <div style={{ display: 'inline-block', width: '15px', height: '15px', marginLeft: '8px' }}>
                                  <img width="15" height="15" src={require('../../../assets/images/male.png').default} alt="男" />
                                </div>
                              )
                            }
                          </>
                        )
                      }
                    </a>
                    <p className="info">
                      <a href={`/#/user/dynamic?id=${item.id}`} className="type">动态<span>{item.dynamicCounts}</span></a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href={`/#/user/follows?id=${item.id}`} className="type">关注<span>{item.likeCounts}</span></a> &nbsp;&nbsp;|&nbsp;&nbsp; <a href={`/#/user/fans?id=${item.id}`} className="type">粉丝<span>{item.concernedCounts}</span></a>
                    </p>
                    <p className="introduce text_hidden">{item.introduce || '暂无个人介绍'}</p>
                  </div>
                  <div className="fans_right">
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

export default withRouter(Fans);