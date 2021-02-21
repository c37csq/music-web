export const getBase64 = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// 秒转换-分:秒的格式
export const getTime = (time: number): string => {
  if (time) {
    const minute = parseInt(((time / 60) % 60).toString());
    const second = parseInt((time % 60).toString());
    let minuteText = `${minute}`;
    let secondText = `${second}`;
    if (minute < 10) {
      minuteText = `0${minute}`;
    }
    if (second < 10) {
      secondText = `0${second}`;
    }
    return `${minuteText}:${secondText}`;
  } else {
    return "00:00";
  }
};

// 节流
export function debounce (fun: Function, delay: number) {
  let timer: any; //定时器
  return function (...args: any) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => { // 
      fun.apply(this, args)
    }, delay)
  }
}

// 阻止冒泡
export function stopBubble (e: any) {
  var event = e || window.event
  if (event.stopPropagation) {
    event.stopPropagation()
  } else {
    event.cancelBubble = true
  }
}

// 重置滚动条
export function resetScroll () {
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  } else if (document.body) {
    document.body.scrollTop = 0;
  }
}