import * as React from 'react';
import './AddMusic.less';
import AddMusicForm from '../../components/AddMusicForm/AddMusicForm';
import NoLogin from '../../components/NoLogin/NoLogin';
import store from '../../store/index';

interface IState {
  token: string
}

class AddMusic extends React.Component<{}, IState> {

  constructor(props: {}) {
    super(props);

    this.cancelSub = store.subscribe(() => {
      const state = store.getState();
      if (state.token) {
        this.setState({
          token: state.token
        })
      }
    })
  }

  state: IState = {
    token: store.getState().token
  }

  // 取消订阅方法就是订阅的返回值
  cancelSub = () => {};

  componentWillUnmount() {
    // 取消redux订阅
    this.cancelSub();
  }

  public render() {

    const { token } = this.state;

    return (
      <div className="AddMusic_Container">
        <div className="AddMusic_Content_Wrapper">
          {
            token ? <AddMusicForm /> : <NoLogin />
          }
        </div>
      </div>
    )
  }
}

export default AddMusic;