import * as React from 'react';
import { message, Upload, Modal } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { imgItem, delAvatarResponse } from '../../../src/global';
import { BASE_AVATAR_URL, BASE_IMG } from '../../api/index';
import { getBase64 } from '../../utils/utils';
import { deleteAvatar } from '../../api/index';
import { CloseOutlined } from '@ant-design/icons';

interface IState {
  loading: boolean,
  previewVisible: boolean,
  previewImage: string,
  fileList: Array<imgItem>
}


class UploadAvatar extends React.Component<{}, IState> {

  state: IState = {
    loading: false,
    previewVisible: false,
    previewImage: '',
    fileList: []
  }

  // 取消查看图片
  handleCancel = () => this.setState({ previewVisible: false });

  // 查看图片
  handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    this.setState({
      previewImage: `${BASE_IMG}${file.url}` || file.preview,
      previewVisible: true,
    });
  }

  /*
    获取所有已上传图片文件名的数组
     */
  getImgs = () => {
    return this.state.fileList.map(file => `${BASE_IMG}${file.url}`)
  }

  // 图片上传前校验
  beforeUpload = (file: any): boolean => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小必须小于2M');
    }
    const isJpgOrPngOrJpeg = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
    if (!isJpgOrPngOrJpeg) {
      message.error('文件必须是jpeg或png或jpg');
    }
    return isJpgOrPngOrJpeg && isLt2M;
  }

  // 图片操作 上传或删除
  handleChange = async (info: any) => {
    const { file, fileList } = info;
    if (file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (file.status === 'done') {
      const result = file.response;
      if (result.status === 200) {
        const { url, filename } = result;
        fileList[0].name = filename;
        fileList[0].url = url;
        message.success('上传图片成功');
      } else {
        message.error('上传图片失败');
      }
      this.setState({ loading: false });
    } else if (file.status === 'removed') {
      let res = await deleteAvatar({ url: file.url });
      if ((res as delAvatarResponse).status === 200) message.success('删除图片成功！');
    }
    this.setState({ fileList });
  }

  render() {
    const { fileList, previewImage, previewVisible, loading } = this.state;
    // 定义上传的按钮
    const uploadButton = (
      <div>
        { loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">上传头像</div>
      </div>
    );
    return (
      <div className="clearfix">
        <ImgCrop
          rotate
          modalOk="确认"
          modalCancel="取消"
          modalTitle="编辑头像"
        >
          <Upload
            name="avatar"
            action={BASE_AVATAR_URL}
            accept="image/*"
            listType="picture-card"
            beforeUpload={this.beforeUpload}
            onPreview={this.handlePreview}
            onChange={this.handleChange}
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
        </ImgCrop>
        <Modal
          closeIcon={<CloseOutlined style={{ color: '#ffffff' }} />}
          visible={previewVisible}
          footer={null} onCancel={this.handleCancel}>
          <img alt="你上传的图片" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
}

export default UploadAvatar;