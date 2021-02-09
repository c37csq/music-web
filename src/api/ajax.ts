import axios from 'axios';
import { message } from 'antd';
import store from '../store';
import { changeRoute, setUserToken } from '../store/actionCreators';

// 请求拦截
axios.interceptors.request.use((config: any) => {
  let token = window.sessionStorage.getItem('token');
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

 // 退出
 const logout = () => {
  // 清除用户信息
  sessionStorage.removeItem('userInfo');
  // 清除token
  sessionStorage.removeItem('token');
  // 清除store中的数据
  const action = setUserToken({
    token: '',
    userInfo: {}
  });
  const routeAction = changeRoute('/home');
  store.dispatch(action);
  store.dispatch(routeAction);
  window.location.href = 'http://localhost:3000/#/home';
}

// 响应拦截
axios.interceptors.response.use((res: any) => {
  if (res.data.status === 402) {
    message.error('你的身份已过期，请重新登录！');
    logout();
  }
  if (res.data.status === 403) {
    message.error('登录不合法！');
  }
  if (res.data.status === 401) {
    message.error('你还没有登录，请先登录！');
  }
  return res;
});

export default function ajax(url: string, data = {}, type = 'GET', setting?: any) {
  return new Promise((resolve, reject) => {
    let promise;
    //执行异步ajax请求
    if (type === 'GET') {
      promise = axios.get(url, {
        params: data //请求参数
      })
    } else {
      promise = axios.post(url, data, setting)
    }

    //成功，调用resolve(value)
    promise.then(res => {
      resolve(res.data)

    //失败，不调用reject(reason), 提示错误信息
    }).catch(error => {
      message.error('请求出错了:' + error.message)
    })
  })
}