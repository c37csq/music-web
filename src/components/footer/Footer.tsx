import * as React from 'react';
import './footer.less';

interface FooterProps {
  hideMusicListAndVolume: (event: any) => void
}

class Footer extends React.Component<FooterProps, {}> {

  public render() {
    
    const { hideMusicListAndVolume } = this.props;
    return (
      <footer onClick={hideMusicListAndVolume}>
        <div className="footer-content">
          <p>系统是由React + Node + AntDesign设计</p>
          <p>合法域名：music.c37.ltd</p>
        </div>
      </footer>
    )
  }
}

export default Footer;