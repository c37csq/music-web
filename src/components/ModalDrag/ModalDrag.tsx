import * as React from 'react';
import DragM from 'dragm';

interface IProps {
  title: string
}


// 拖动组件
class ModalDrag extends React.Component<IProps, {}> {

  updateTransform = (transformStr: any) => {
    (this as any).modalDom.style.transform = transformStr;
  };

  componentDidMount() {
    (this as any).modalDom = document.getElementsByClassName("ant-modal-wrap")[0];
  }

  render() {
    const { title } = this.props;
    return (
      <DragM updateTransform={ this.updateTransform }>
        <div>{title}</div>
      </DragM>
    )
  }
}

export default ModalDrag;