import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { disLikePerson, getUserInfo, likePerson } from '../../api';
import './User.less';
import { Switch, Route, Redirect } from 'react-router-dom'
import SongList from './SongList/SongList';
import Dynamic from './Dynamic/Dynamic';
import Follows from './Follow/Follows';
import Fans from './Fans/Fans';
import store from '../../store';
import { RESPONSE_INFO } from '../../global';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface IProps extends RouteComponentProps { }

const User = (props: IProps, ref: any) => {

  const { search } = (props as any).location;

  const userInfo = store.getState().userInfo;
  // 取到id
  const id = parseInt(search.replace(/^\?/, '').split('=')[1]);

  const [urlId, setId] = useState(id);

  const [flag, setFlag] = useState(false);

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

  useEffect(() => {
    // other code
    // 根据id请求数据
    getUserDetail(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId])

  useEffect(() => {
    // other code
    // 监听路由改变
    props.history.listen(route => {
      const newId = parseInt(route.search.split('=')[1]);
      if (!flag) {
        setId(newId);
      }
    })
    // 防止组件销毁后继续set组件状态引发报错
    return () => {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 获取用户信息
  const getUserDetail = async (id: number) => {
    const res = await getUserInfo({
      user_id: id
    });
    setUser((res as any).data);
  }

  // 阻止拖拽
  const refuse = (e: any): boolean => {
    e.preventDefault();
    return false;
  }

  // 判断是否是自己访问当前页面
  const checkUser = (): boolean => {
    const { id } = userInfo;
    if (id === urlId) {
      return true;
    }
    return false;
  }

  // 关注
  const likeIt = async () => {
    const { id } = userInfo;
    const params = {
      user_id: id,
      likeUserId: urlId,
      concernCounts: user.concernedCounts
    }
    const res = await likePerson(params);
    if ((res as RESPONSE_INFO).status === 200) {
      message.info((res as RESPONSE_INFO).msg);
      getUserDetail(urlId);
    }
  }

  // 判断当前用户是否关注用户
  const checkUserIsConcern = () => {
    let flag = false;
    if (user.fans.filter(item => parseInt(item) === userInfo.id).length > 0) {
      flag = true;
    }
    return flag;
  }

  // 取消关注
  const disLikeIt = async () => {
    const { id } = userInfo;
    const params = {
      user_id: id,
      likeUserId: urlId,
      concernCounts: user.concernedCounts
    }
    const res = await disLikePerson(params);
    if ((res as RESPONSE_INFO).status === 200) {
      message.info((res as RESPONSE_INFO).msg);
      getUserDetail(urlId);
    }
  }

  // 编辑个人资料
  const update = () => {
    props.history.push(`/update?id=${urlId}`);
  }

  return (
    <div className="User_Container">
      <div className="User_Content_Wrapper">
        <div className="top_content">
          <div className="left">
            <div className="avatar">
              <img onDragStart={(e) => refuse(e)} src={user.avatar_url} alt="头像" />
            </div>
          </div>
          <div className="right">
            <div className="header">
              <div className="header_content">
                <div className="header_left">
                  <h1>{user.username}</h1>
                  {
                    user.sex ? (
                      user.sex === 'female' ? (
                        <img onDragStart={(e) => refuse(e)} src={require('../../assets/images/female.png').default} alt="女性" />
                      ) : (
                        <img onDragStart={(e) => refuse(e)} src={require('../../assets/images/male.png').default} alt="女性" />
                      )
                    ) : (
                      ""
                    )
                  }
                </div>
                <div style={{ display: `${checkUser() ? 'inline-block' : 'none'}` }} className="header_right">
                  <Button onClick={update}>编辑个人资料</Button>
                </div>
                {
                  checkUserIsConcern() ? (
                    <div style={{ display: `${checkUser() ? 'none' : 'inline-block'}` }} className="header_right">
                      <Button onClick={disLikeIt} type="primary" danger>取消关注</Button>
                    </div>
                  ) : (
                    <div style={{ display: `${checkUser() ? 'none' : 'inline-block'}` }} className="header_right">
                      <Button onClick={likeIt} type="primary">关 注</Button>
                    </div>
                  )
                }
              </div>
            </div>
            <div className="right_content">
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
              <p className="introduce text_hidden">
                个人介绍：{user.introduce || "暂无"}
              </p>
              <p className="age">年龄：{user.age ? `${user.age}岁` : "未知"}</p>
            </div>
          </div>
        </div>
        <Switch>
          <Route path="/user/home" component={SongList} exact></Route>
          <Route path="/user/dynamic" component={Dynamic} exact></Route>
          <Route path="/user/follows" component={Follows} exact></Route>
          <Route path="/user/fans" component={Fans} exact></Route>
          <Redirect to='/user/home' />
        </Switch>
      </div>
    </div >
  )
}

export default withRouter(User);
