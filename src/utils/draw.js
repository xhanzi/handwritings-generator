function drawDash(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 7]);
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = '#CCC';
  ctx.stroke();
  ctx.closePath();
}

function Draw(canvas, config = {}) {
  if (!(this instanceof Draw)) {
    return new Draw(canvas, config);
  }
  if (!canvas) {
    return;
  }
  let { width, height } = window.getComputedStyle(canvas, null);
  width = width.replace('px', '');
  height = height.replace('px', '');
  const ssize = width >= height ? height : width;
  width = ssize;
  height = ssize;

  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.width = width;
  this.height = height;
  const context = this.context;

  // 根据设备像素比优化canvas绘图
  const devicePixelRatio = window.devicePixelRatio;
  if (devicePixelRatio) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.height = height * devicePixelRatio;
    canvas.width = width * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  // 画虚线
  drawDash(context, 0, this.height / 2, this.width, this.height / 2);
  drawDash(context, this.width / 2, 0, this.width / 2, this.height);

  context.setLineDash([]);
  context.lineWidth = 6;
  context.strokeStyle = 'black';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  Object.assign(context, config);

  const { left, top } = canvas.getBoundingClientRect();
  const point = {};
  const isMobile = /phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone/i.test(navigator.userAgent);
  // 移动端性能太弱, 去掉模糊以提高手写渲染速度
  if (!isMobile) {
    context.shadowBlur = 1;
    context.shadowColor = 'black';
  }
  let pressed = false;

  const paint = (signal) => {
    switch (signal) {
      case 1:
        context.beginPath();
        context.moveTo(point.x, point.y);
      case 2:
        context.lineTo(point.x, point.y);
        context.stroke();
        break;
      default:
    }
  };
  const create = signal => (e) => {
    e.preventDefault();
    if (signal === 1) {
      pressed = true;
    }
    if (signal === 1 || pressed) {
      e = isMobile ? e.touches[0] : e;
      point.x = e.clientX - left;
      point.y = e.clientY - top;
      paint(signal);
    }
  };
  const start = create(1);
  const move = create(2);
  const requestAnimationFrame = window.requestAnimationFrame;
  const optimizedMove = requestAnimationFrame ? (e) => {
    requestAnimationFrame(() => {
      move(e);
    });
  } : move;

  if (isMobile) {
    canvas.addEventListener('touchstart', start);
    canvas.addEventListener('touchmove', optimizedMove);
  } else {
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', optimizedMove);
  }
  ['touchend', 'mouseup'].forEach((event) => { // mouseleave
    canvas.addEventListener(event, () => {
      pressed = false;
      // 从这里自动上传文件
      const info = document.getElementById('info');
      this.upload(
        this.dataURLtoBlob(this.getPNGImage()),
        '/api/upload',
        (response) => { info.innerText = response; },
        (error) => { info.innerText = error; });
      });
  });
}

Draw.prototype = {
  scale(width, height, canvas = this.canvas) {
    const w = canvas.width;
    const h = canvas.height;
    width = width || w;
    height = height || h;
    if (width !== w || height !== h) {
      const tmpCanvas = document.createElement('canvas');
      const tmpContext = tmpCanvas.getContext('2d');
      tmpCanvas.width = width;
      tmpCanvas.height = height;
      tmpContext.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);
      canvas = tmpCanvas;
    }
    return canvas;
  },
  getPNGImage(canvas = this.canvas) {
    return canvas.toDataURL('image/png');
  },
  getJPGImage(canvas = this.canvas) {
    return canvas.toDataURL('image/jpeg', 0.5);
  },
  downloadPNGImage(image) {
    window.location.href = image.replace('image/png', 'image/octet-stream;Content-Disposition:attachment');
  },
  dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bStr = atob(arr[1]);
    let n = bStr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bStr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },
  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  },
  upload(blob, url, success, failure) {
    const formData = new FormData();
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    formData.append('image', blob, 'sign');
    xhr.open('POST', url, true);
    xhr.onload = () => {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        success(xhr.responseText);
      } else {
        failure();
      }
    };
    xhr.onerror = (e) => {
      if (typeof failure === 'function') {
        failure(e);
      }
    };
    xhr.send(formData);
  },
};
export default Draw;
