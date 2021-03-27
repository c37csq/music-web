
import * as React from 'react';
import { useEffect, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { SONG } from '../../global';
import { addEvent, stopBubble } from '../../utils/utils';

interface IProps extends RouteComponentProps {
  focus: boolean,
  likeList: Array<SONG>,
  value: string
}

const Float = (props: IProps, ref: any) => {

  const { value, likeList, focus } = props;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkVisible(likeList, focus);
  }, [value, focus, likeList])

  useEffect(() => {
    clickOther(likeList);
  }, [likeList])

  // 判断显示还是隐藏
  const checkVisible = (likeList: Array<SONG>, focus: boolean) => {
    if (likeList.length === 0) {
      setVisible(false);
    } else {
      setVisible(focus);
    }
  }

  // 绑定事件
  const clickOther = (likeList: Array<SONG>) => {
    addEvent(document, 'click', (e: any) => {
      stopBubble(e);
      if (e.srcElement === document.querySelector(".Header_Input_Wrapper input.ant-input") || e.srcElement === document.querySelector(".Header_Input_Wrapper div span.ant-input-affix-wrapper input")) {
        if (likeList.length > 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
        return;
      } else {
        setVisible(false);
      }
    })
  }

  // 去歌曲详情
  const toSongDetail = (id: number) => {
    props.history.push(`/songdetail?id=${id}`)
  }

  return (
    <div className={"float-wrap " + (!visible ? "float-wrap-none" : "")}>
      <div className="header">
        <h2>搜索"{value}"相关歌曲</h2>
      </div>
      <ul className="list">
        <li>
          <div className="title">
            <h2>歌曲</h2>
          </div>
          <div className="right">
            <ul>
              {
                likeList.map((item, index) => {
                  return (
                    <li onClick={() => toSongDetail(item.id)} key={index}>{item.song_name} - {item.song_singer}</li>
                  )
                })
              }
            </ul>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default withRouter(Float);