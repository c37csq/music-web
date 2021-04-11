import * as React from 'react';
import DragM from 'dragm';

interface IProps {
  title: string
}


// 拖动组件
class ModalDrag extends React.Component<IProps, {}> {

  updateTransform = (transformStr: any) => {
    for (let i = 0; i < (this as any).modalDom.length; i +=1) {
      ((this as any).modalDom)[i].style.transform = transformStr;
    }
  };

  componentDidMount() {
    (this as any).modalDom = document.getElementsByClassName("ant-modal-content");
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