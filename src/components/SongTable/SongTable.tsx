import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Table, Radio } from 'antd';
import './SongTable.less';
import { SONG, SONG_ITEM } from '../../global';

interface IProps {
  columns: any,
  songType: Array<SONG_ITEM>,
  songList: Array<SONG>,
  getSongList?: Function,
  setParentOperationId?: Function
}

const SongTable = (props: IProps, ref: any) => {

  // 状态 最新/最热
  const [status, setStatus] = useState('hot');

  // 页码
  const [pageNum, setPageNum] = useState(1);

  // 哪一行显示操作
  const [operationId, setOperationId] = useState(0);

  const { columns, songType, songList, getSongList } = props;

  // 将方法暴露给父组件
  useImperativeHandle((ref), () => {
    // 这里return 的对象里面方法和属性可以被父组件调用
    return {
      status,
      pageChange(params: any) {
        pageChange(params);
      },
      operationId,
    }
  });


  useEffect(() => {
    // other code
    const { setParentOperationId } = props;
    if (setParentOperationId) {
      setParentOperationId(operationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationId])

  // 翻页事件
  const pageChange = async (e: any) => {
    const { current } = e;
    setPageNum(current);
  }

  // 改变列表状态
  const changeStatus = async (e: any) => {
    setStatus(e.target.value);
    // 重新获取歌曲列表数据
    if (getSongList) {
      if (songType.length > 0) {
        getSongList({ typeId: songType[0].id, status: e.target.value });
      } else {
        getSongList({ typeId: 0, status: e.target.value });
      }
    }
  }

  const itemRender = (current: number, type: string, originalElement: any) => {
    if (type === 'prev') {
      return <a>上一页</a>;
    }
    if (type === 'next') {
      return <a>下一页</a>;
    }
    return originalElement;
  }

  // 展示操作
  const showOperation = (e: any, record: any) => {
    setOperationId(record.id);
  }

  // 隐藏
  const hideOperation = (e: any, record: any) => {
    setOperationId(0);
  }

  return (
    <div className="table_wrapper">
      <div className="table_header">
        <div>
          <span className="table_title">{songType[0] ? songType[0].name : "全部"}类别歌曲</span>
          <span className="table_count">共 {songList.length} 首歌</span>
        </div>
        <div>
          <Radio.Group onChange={changeStatus} defaultValue={status} buttonStyle="solid">
            <Radio.Button value="hot">最热</Radio.Button>
            <Radio.Button value="new">最新</Radio.Button>
          </Radio.Group>
        </div>
      </div>
      <div className="table_parent">
        <Table
          size="small"
          columns={columns}
          dataSource={songList}
          bordered
          pagination={{
            total: songList.length,
            pageSize: 10,
            showSizeChanger: false,
            current: pageNum,
            size: 'small',
            itemRender: itemRender
          }}
          onRow={record => {
            return {
              onMouseEnter: event => { showOperation(event, record) }, // 鼠标移入行
              onMouseLeave: event => { hideOperation(event, record) },
            };
          }}
          rowKey="id"
          onChange={pageChange}
        />
      </div>
    </div>
  )
}

export default forwardRef(SongTable);