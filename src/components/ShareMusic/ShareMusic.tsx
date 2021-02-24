import * as React from 'react';
import './ShareMusic.less';
import { Modal } from 'antd';
import ModalDrag from '../ModalDrag/ModalDrag';
import { CloseOutlined } from '@ant-design/icons';

interface IProps {
  visible: boolean,
  title: string
}

const ShareMusic = (props: IProps, ref: any) => {

  const { visible, title } = props;

  // 定义拖动标题
  const titleDrag = <ModalDrag title={title} />
  return (
    <Modal
      closeIcon={<CloseOutlined style={{color: '#ffffff'}}/>}
      title={titleDrag}
      visible={visible}>
      分享音乐
    </Modal>
  )
}

export default ShareMusic;

