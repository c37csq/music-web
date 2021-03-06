import * as React from 'react';
import './ShareMusic.less';
import { Button, Input, Modal, Table } from 'antd';
import ModalDrag from '../ModalDrag/ModalDrag';
import { CloseOutlined } from '@ant-design/icons';
import Comment from '../../components/Comment/Comment';
import store from '../../store';
import { useEffect, useState } from 'react';
import { changeShareStatus } from '../../store/actionCreators';
import { SearchOutlined } from '@ant-design/icons';
import { SONG } from '../../global';
import { getSongsByLike } from '../../api';

interface IProps {
  visible: boolean,
  title: string,
  userId: number,
  getList?: Function,
  closeModal: Function,
  shareMusic?: {
    id: number,
    song_name: string,
    song_singer: string,
    song_url: string,
    song_hot: number
  }
}

const ShareMusic = (props: IProps, ref: any) => {

  const { visible, title, userId, getList, closeModal, shareMusic } = props;

  const [shareStatus, setShareStatus] = useState(store.getState().shareStatus);

  const [isAddMusic, setIsAddMusic] = useState(store.getState().isAddMusic);

  const [list, setList] = useState([]);

  const [music, setMusic] = useState({
    id: -1,
    song_name: "",
    song_singer: "",
    song_url: "",
    song_hot: 0
  })

  useEffect(() => {
    if (shareMusic) {
      setMusic(shareMusic);
      setIsAddMusic(true);
    }
  }, [shareMusic])

  // 去添加歌曲组件
  const addMusic = () => {
    const action = changeShareStatus('add');
    store.dispatch(action);
    setShareStatus('add');
    setList([]);
  }

  // 获取数据
  const getSongList = async (e: any) => {
    if (e.target.value) {
      const params = {
        like: e.target.value
      }
      const res = await getSongsByLike(params);
      setList((res as any).result);
    } else {
      setList([]);
    }
  }

  // 返回
  const back = () => {
    const action = changeShareStatus('index');
    store.dispatch(action);
    setShareStatus('index');
  }

  // 选择歌曲
  const select = (e: any, record: SONG) => {
    const action = changeShareStatus('index');
    store.dispatch(action);
    setShareStatus('index');
    setIsAddMusic(true);
    setMusic({
      id: record.id,
      song_name: record.song_name,
      song_singer: record.song_singer,
      song_url: record.song_url,
      song_hot: record.song_hot
    })
  }

  // 关闭弹窗
  const close = () => {
    closeModal();
  }

  // 重新选择音乐
  const selectNone = () => {
    setIsAddMusic(false);
    setMusic({
      id: -1,
      song_name: "",
      song_singer: "",
      song_url: "",
      song_hot: 0
    })
  }

  const columns = [
    {
      title: ' ', dataIndex: 'id', width: 50, render: (text: number, record: SONG, index: number) =>
        <div style={{ display: 'flex', justifyContent: 'space-around', cursor: 'pointer' }}>
          <img
            src={require('../../assets/images/stop.png').default}
            alt="未播放" />
        </div>
    },
    {
      title: '歌曲名称', dataIndex: 'song_name', width: 230, ellipsis: true, render: (text: string, record: SONG) => <span className="song_name">{text}</span>
    },
    { title: '歌手名称', dataIndex: 'song_singer', ellipsis: true }
  ];

  // 定义拖动标题
  const titleDrag = <ModalDrag title={title} />
  return (
    <Modal
      onCancel={() => close()}
      footer={null}
      closeIcon={<CloseOutlined style={{ color: '#ffffff' }} />}
      title={titleDrag}
      visible={visible}>
      {
        shareStatus === 'index' ? (
          <div className="wrapper">
            <Comment
              close={close}
              buttonText="发 布"
              getList={getList}
              song_id={userId}
              isShowHeader={false}
              avatarSize={40}
              type="dynamic"
              music={music}
              selectNone={selectNone}
            />
            <div className="add_music">
              {
                isAddMusic ? (
                  <div className="exist" onClick={addMusic}>
                    <div className="left">
                      <div className="song_info">
                        单曲：{music.song_name} &nbsp;&nbsp;- &nbsp;{music.song_singer}
                      </div>
                    </div>
                    <div className="right">
                      <img src={require('../../assets/images/right_arrow.png').default} alt="右箭头" />
                    </div>
                  </div>
                ) : (
                    <div className="to_add_music" onClick={addMusic}>
                      <div className="text">
                        <div className="add_text">
                          给动态添加音乐
                        </div>
                      </div>
                      <div className="add">
                        <img src={require('../../assets/images/add.png').default} alt="添加" />
                      </div>
                    </div>
                  )
              }
            </div>
          </div>
        ) : (
            <div className="music_list">
              <div className="search">
                <Input
                  onChange={(e) => getSongList(e)}
                  prefix={<SearchOutlined />} />
              </div>
              <div className="table_list">
                <Table
                  scroll={{ y: 240 }}
                  onRow={record => {
                    return {
                      onClick: event => { select(event, record) }
                    };
                  }}
                  dataSource={list}
                  columns={columns}
                  pagination={false}
                  rowKey={record => record.id}
                />
              </div>
              <div className="back">
                <Button
                  onClick={back}
                  type="primary">返回</Button>
              </div>
            </div>
          )
      }
    </Modal>
  )
}

export default ShareMusic;

