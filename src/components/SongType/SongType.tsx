import * as React from 'react';
import './SongType.less';
import { IMG_MAP, SONG_ITEM, SONG_TYPES } from '../../global';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { message, Tooltip } from 'antd';

interface IState {
  songTypes: SONG_TYPES,
  songTypeItem: Array<SONG_ITEM>
}

interface IProps {
  songTypes: SONG_TYPES,
  title: string,
  desc: string,
  count: number,
  getSongItem?: Function,
  getSongList?: Function,
  status?: string,
  setPage?: Function
}

class SongType extends React.Component<IProps, IState> {

  state: IState = {
    songTypes: {
      '语种': [],
      '风格': [],
      '场景': [],
      '情感': [],
      '主题': []
    },
    songTypeItem: []
  }

  // 获取歌曲类别
  getSongTypes = () => {
    return this.state.songTypeItem;
  }

  /**
   * 选择歌曲类别
   */
  handleItemClick = (item: SONG_ITEM) => {
    // 改变样式
    const { songTypeItem } = this.state;
    // 状态
    const { count, getSongItem } = this.props;

    if (songTypeItem.includes(item)) {
      const index = songTypeItem.findIndex(id => id === item);
      songTypeItem.splice(index, 1);
    } else {
      if (count === 1) {
        songTypeItem.splice(0, 1);
      } else if (songTypeItem.length >= count) return message.error(`最多选择${count}个！`);
      songTypeItem.push(item);
    }
    this.setState({
      songTypeItem
    }, () => {
      if (getSongItem) {
        getSongItem(songTypeItem);
      }
      // 进行数据请求
      this.getSongListByParams();
    })
  }

  // 请求列表数据
  getSongListByParams = () => {
    // 获取请求数据函数  status为组件传递过来的参数
    const { getSongList, status, setPage } = this.props;
    // 获取选中的类别
    const { songTypeItem } = this.state;

    if (getSongList) {
      if (songTypeItem.length === 0) {
        getSongList({ typeId: 0, status: status });
      } else {
        getSongList({ typeId: songTypeItem[0].id, status: status });
      }
      if (setPage) {
        setPage({ current: 1 });
      }
    }
  }

  render() {

    const { songTypeItem } = this.state;

    const { songTypes, title, desc } = this.props;

    const imgMap: IMG_MAP = {
      '语种': require('../../assets/images/yuzhong.png').default,
      '风格': require('../../assets/images/fengge.png').default,
      '场景': require('../../assets/images/changjing.png').default,
      '情感': require('../../assets/images/qinggan.png').default,
      '主题': require('../../assets/images/zhuti.png').default,
    }

    return (
      <div className="songtype_wrapper">
        <div className="songtype_header">
          <h4 style={{ display: 'inline-block', marginRight: '15px' }}>{title}</h4>
          <Tooltip title={desc}>
            <QuestionCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
          </Tooltip>
        </div>
        <div className="songtype_content">
          {
            Object.entries(songTypes).map((item, index) => (
              <div key={index} className="songtype_item">
                <div className="left">
                  <div className="img_wrapper">
                    <img width="24" src={imgMap[item[0]]} alt={item[0]} />
                  </div>
                  <div>{item[0]}</div>
                </div>
                <div className="right">
                  {
                    item[1].map(item1 => (
                      <div onClick={() => this.handleItemClick(item1)} key={item1.id} className={songTypeItem.includes(item1) ? "right_type active" : "right_type"}>{item1.name}</div>
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}

export default SongType;