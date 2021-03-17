import './Comment.less';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Avatar, message } from 'antd';
import store from '../../store';
import Login from '../Login/Login';
import { addDynamic, relyComment, relyDynamic, submitComment } from '../../api';
import { RELY, RESPONSE_INFO, SELECT_MUSIC } from '../../global';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface IProps extends RouteComponentProps {
  song_id: number,
  total?: number,
  getList?: Function,
  isShowHeader: boolean,
  avatarSize: number,
  relyTo?: RELY,
  buttonText: string,
  type: string,
  music?: SELECT_MUSIC,
  close?: Function,
  selectNone?: Function
}

const { TextArea } = Input;


const Comment = (props: IProps, ref: any) => {

  const [avatar_url, setAvatarUrl] = useState('');

  const [value, setValue] = useState('');
  // visible
  const [visible, setVisible] = useState(false);

  const { song_id, total, getList, isShowHeader, avatarSize, relyTo, buttonText, type, music, close, selectNone } = props;

  // 获取textarea节点元素
  const textArea = useRef<any>(null);

  // 挂载
  useEffect(() => {
    const { avatar_url } = store.getState().userInfo;
    setAvatarUrl(avatar_url);
  }, []);

  useEffect(() => {
    // 取消订阅
    const cancelSub = store.subscribe(() => {
      const { avatar_url } = store.getState().userInfo;
      setAvatarUrl(avatar_url);
    });
    return () => {
      cancelSub();
    }
  }, []);

  // 提交评论
  const submit = async () => {
    const area = textArea.current;
    if (type === 'comment') {
      if (area) {
        let value = area.state.value;
        if (!avatar_url) {
          showModal();
          return;
        }
        if (!value) {
          return message.info('请输入一点内容吧！');
        } else {
          // 获取用户信息
          const { avatar_url, id, username } = store.getState().userInfo;
          // 获取提交时间
          const add_time = Date.parse(new Date().toString()) / 1000;
          if (relyTo && relyTo.id > 0) {
            // 需要的参数
            const params = {
              parentId: relyTo.parentId,
              username,
              avatar_url,
              add_time,
              content: value,
              user_id: id,
              relyPerson: relyTo.relyPerson
            }
            const res = await relyComment(params);
            if ((res as any).status === 200) {
              message.info('评论成功！');
              if (getList) {
                getList(song_id);
              }
              setValue('');
            }
          } else {
            // 参数准备
            const params = {
              username,
              avatar_url,
              add_time,
              content: value,
              song_id: song_id,
              user_id: id
            }
            const res = await submitComment(params);
            if ((res as any).status === 200) {
              message.info('评论成功！');
              if (getList) {
                getList(song_id);
              }
              setValue('');
            }
          }
        }
      }
    } else if (type === 'dynamic') {
      if (music) {
        if ((music as SELECT_MUSIC).id < 0) return message.info('请选择一首音乐！');
        // 获取用户信息
        const { avatar_url, id, username, dynamicCounts } = store.getState().userInfo;
        const params = {
          likeCounts: 0,
          avatar_url,
          add_time: Date.parse(new Date().toString()) / 1000,
          content: area.state.value,
          song_id: music.id,
          user_id: id,
          username,
          dynamicCounts,
        }
        const res = await addDynamic(params);
        if ((res as RESPONSE_INFO).status === 200) {
          message.info('发布动态成功！');
          if (close) {
            close();
            if (getList) {
              getList(id);
            }
            if (selectNone) {
              selectNone();
            }
            setValue('');
          }
        }
      } else {
        if (area) {
          let value = area.state.value;
          if (!avatar_url) {
            showModal();
            return;
          }
          if (!value) {
            return message.info('请输入一点内容吧！');
          } else {
            // 获取用户信息
            const { avatar_url, id, username } = store.getState().userInfo;
            // 获取提交时间
            const add_time = Date.parse(new Date().toString()) / 1000;
            if (relyTo && relyTo.id > 0) {
              // 需要的参数
              const params = {
                parentId: relyTo.parentId,
                username,
                avatar_url,
                add_time,
                content: value,
                user_id: id,
                relyPerson: relyTo.relyPerson
              }
              const res = await relyDynamic(params);
              if ((res as any).status === 200) {
                message.info('评论成功！');
                if (getList) {
                  getList(song_id);
                }
                setValue('');
              }
            }
          }
        }
      }
    }
  }

  // 显示弹窗
  const showModal = () => {
    setVisible(true);
  }

  // 关闭弹窗
  const closeModal = () => {
    setVisible(false);
  }

  // 聚焦事件
  const onFocus = () => {
    if (!avatar_url) {
      showModal();
      const area = textArea.current;
      if (area) {
        area.blur();
      }
    }
  }

  // textarea 改变事件
  const onChange = (e: any) => {
    e.persist();
    setValue(e.target.value);
  }

  return (
    <div className="comment_wrapper">
      <Login closeModal={closeModal} visible={visible} />
      <div className="comment_content">
        <div style={{ display: `${isShowHeader ? 'inline-block' : 'none'}` }} className="comment_header">
          <div id="comment_title" className="title">
            评论
          </div>
          <div className="count">
            {
              total === 0 ? "暂无评论" : `共${total}条评论`
            }
          </div>
        </div>
        <div className="comment_textarea_wrapper">
          <div style={{ display: `${avatar_url ? 'none' : 'inline-block'}`, width: `${avatarSize}px` }} className="avatar">
            <img src={require('../../assets/images/no_login_avatar.png').default} alt="没有登录" />
          </div>
          <Avatar style={{ display: `${avatar_url ? 'inline-block' : 'none'}`, cursor: 'pointer' }} size={avatarSize} src={avatar_url}></Avatar>
          <div className="textarea">
            <TextArea
              placeholder={relyTo?.relyPerson ? `回复 @${relyTo?.relyPerson}` : ''}
              onFocus={onFocus}
              value={value}
              onChange={(e) => onChange(e)}
              ref={textArea}
              rows={3}
              showCount
              maxLength={100} />
            <Button onClick={submit} className="text-submit" size="small" type="primary">{buttonText}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withRouter(Comment);