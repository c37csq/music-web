import React, { FC } from 'react';
import { Route, Switch, HashRouter } from 'react-router-dom'
import './App.less';
import Default from './pages/index/default'

const App: FC = () => (
  <HashRouter>
    <Switch>
      <Route path="/" component={Default}/>
    </Switch>
  </HashRouter>
);

export default App;
