import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { getUserInfo } from '../../api';
import './User.less';
import { Switch, Route, Redirect } from 'react-router-dom'
import SongList from './SongList/SongList';
import Dynamic from './Dynamic/Dynamic';
import Follows from './Follow/Follows';
import Fans from './Fans/Fans';

interface IProps { }

const User = (props: IProps, ref: any) => {

  const { search } = (props as any).location;
  // 取到id
  const id = parseInt(search.replace(/^\?/, '').split('=')[1]);

  const [urlId, setId] = useState(id);

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
    age: null
  });

  useEffect(() => {
    // other code
    // 根据id请求数据
    getUserDetail(urlId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId])

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
                <div className="header_right">
                  <Button>编辑个人资料</Button>
                </div>
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
                个人介绍：{ user.introduce || "暂无" }
              </p>
              <p className="age">年龄：{ user.age ? `${user.age}岁` : "未知"}</p>
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
    </div>
  )
}

export default User;
