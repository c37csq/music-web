import * as React from 'react';
import { Card, Form, Input, Row, Col, Tooltip, Button, Upload, message } from 'antd';
import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import SongType from '../../components/SongType/SongType';
import './AddMusicForm.less'
import { ADDMUSIC_FORM, SONG_TYPES, delAvatarResponse, imgItem, RESPONSE_INFO } from '../../../src/global';
import { BASE_IMG, BASE_VIDEO_URL, deleteVideo, shareSongs } from '../../api/index';
import store from '../../store/index';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { getSongTypes } from '../../api/index';

const { TextArea } = Input;

interface IState {
  fileList: Array<imgItem>,
  songTypes: SONG_TYPES,
}

interface IProps extends RouteComponentProps {

}

class AddMusicForm extends React.Component<IProps, IState> {

  private songType: React.RefObject<SongType>;
  private addMusicForm: any;
  constructor(props: IProps) {
    super(props);

    this.songType = React.createRef();

    // 表单
    this.addMusicForm = React.createRef();
  }

  state: IState = {
    fileList: [],
    songTypes: {
      '语种': [],
      '风格': [],
      '场景': [],
      '情感': [],
      '主题': []
    },
  }

  // 音频上传前校验
  beforeUpload = (file: any): boolean => {
    const isLt20M = file.size / 1024 / 1024 < 20;
    const isLegal = file.type === 'audio/mpeg' || file.type === 'audio/mp3';
    if (!isLegal) {
      message.error('文件必须是audio/mpeg格式');
    }
    return isLt20M && isLegal;
  }

  async componentDidMount() {
    // 获取歌曲分类
    const res = await getSongTypes();
    this.setState({
      songTypes: (res as any).data
    })
  }

  // 提交
  onFinish = async (values: ADDMUSIC_FORM) => {
    const { fileList } = this.state;
    if (fileList.length > 0) {
      values.song_url = `${BASE_IMG}${fileList[0].url}`;
    }
    const songType = this.songType.current;
    if (songType) {
      values.song_type = songType.getSongTypes();
    }

    if (!values.song_url) return message.error('请上传歌曲！');
    if (values.song_type.length === 0) return message.error('请选择歌曲类别！');

    values.create_id = store.getState().userInfo.id;
    values.create_user = store.getState().userInfo.username;
    values.create_time = Date.parse(new Date().toString()) / 1000;
    const res = await shareSongs(values);
    if ((res as RESPONSE_INFO).status === 200) {
      message.success((res as RESPONSE_INFO).msg);
      // 重置表单
      this.resetAddMsuicForm();
    }
    this.setState({
      fileList: []
    })
  }

  // 重置表单
  resetAddMsuicForm = () => {
    this.addMusicForm.current.resetFields();
  }

  // 音频上传
  handleChange = async (info: any) => {
    const { file, fileList } = info;
    if (file.status === 'done') {
      const result = file.response;
      if (result.status === 200) {
        const { url, filename } = result;
        fileList[0].name = filename;
        fileList[0].url = url;
        message.success('上传歌曲成功');
      } else {
        message.error('上传歌曲失败');
      }
    } else if (file.status === 'removed') {
      let res = await deleteVideo({ url: file.url });
      message.success((res as delAvatarResponse).msg);
    }
    this.setState({
      fileList
    });
  }

  render() {
    const { fileList, songTypes } = this.state;
    return (
      <div className="AddMusic_FORM">
        <Card title="分享歌曲">
          <Form
            ref={this.addMusicForm}
            name="addMusic"
            onFinish={this.onFinish}
            initialValues={{ song_name: '', song_singer: '', song_album: '', song_url: '', song_type: [], song_introduce: '' }}>
            <Row gutter={80}>
              <Col span={12}>
                <Form.Item
                  name="song_name"
                  rules={
                    [
                      { required: true, message: '请输入歌曲名称' },
                    ]
                  }
                  label="歌曲名称：">
                  <Input autoComplete="off" placeholder="请输入歌曲名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="song_singer"
                  rules={
                    [
                      { required: true, message: '请输入歌手名称' },
                    ]
                  }
                  label="歌手名称：">
                  <Input
                    autoComplete="off"
                    placeholder="请输入歌手名"
                    suffix={
                      <Tooltip title="请输入歌手名，如有多个，以'/'分隔">
                        <QuestionCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    } />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={80}>
              <Col span={12}>
                <Form.Item
                  name="song_album"
                  label="歌曲专辑：">
                  <Input
                    autoComplete="off"
                    placeholder="请输入歌曲所属专辑"
                    suffix={
                      <Tooltip title="请输入所属专辑，如没有，则不填">
                        <QuestionCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    } />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="song_url"
                  label="上传歌曲：">
                  <div>
                    <Upload
                      name="song_url"
                      action={BASE_VIDEO_URL}
                      accept="audio/*"
                      onChange={this.handleChange}
                      beforeUpload={this.beforeUpload}>
                      {fileList.length >= 1 ? null : <Button icon={<UploadOutlined />}>上传歌曲</Button>}
                    </Upload>
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="song_type"
                  label="歌曲类别：">
                  <SongType count={5} title="请选择歌曲分类" desc="至少选择一个，最多选五个" songTypes={songTypes} ref={this.songType} />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={18}>
                <Form.Item
                  name="song_introduce"
                  rules={
                    [
                      { required: true, message: '请输入歌曲描述' },
                    ]
                  }
                  label="歌曲描述：">
                  <div className="textarea">
                    <TextArea
                      rows={4}
                      placeholder="请输入歌曲相关描述"
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <Button htmlType="submit" style={{ marginLeft: '75px' }} type="primary">提交</Button>
          </Form>
        </Card>
      </div>
    );
  }
}

export default withRouter(AddMusicForm);