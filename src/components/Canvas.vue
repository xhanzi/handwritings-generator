<template>
  <div id="canvasBox" :style="getHorizontalStyle">
    <canvas></canvas>
    <div class="greet">
      <a @touchstart="clear" @mousedown="clear" id="clear">清屏</a>
      <div id="info"></div>
    </div>
  </div>
</template>

<script>
import Draw from '../utils/draw';

export default {
  name: 'canvasDraw',
  data() {
    return {};
  },
  components: {
    Draw,
  },
  mounted() {
    this.canvasBox = document.getElementById('canvasBox');
    this.initCanvas();
  },
  computed: {
    getHorizontalStyle() {
      const d = document;
      const w = window.innerWidth || d.documentElement.clientWidth || d.body.clientWidth;
      const h = window.innerHeight || d.documentElement.clientHeight || d.body.clientHeight;
      if (this.canvasBox) {
        this.canvasBox.removeChild(document.querySelector('canvas'));
        this.canvasBox.appendChild(document.createElement('canvas'));
        setTimeout(() => {
          this.initCanvas();
        }, 200);
      }
      const size = w > h ? h : w;
      return {
        width: `${size}px`,
        height: `${size}px`,
        transformOrigin: 'center center',
      };
    },
  },
  methods: {
    initCanvas() {
      this.draw = new Draw(document.querySelector('canvas'));
    },
    clear() {
      this.draw.clear();
    },
    download() {
      this.draw.downloadPNGImage(this.draw.getPNGImage());
    },
    upload() {
      const btn = document.getElementById('upload');
      btn.style.pointerEvents = 'none';
      btn.innerText = '上传中……';
      const image = this.draw.getPNGImage();
      const blob = this.draw.dataURLtoBlob(image);
      const url = '/api/upload';
      const info = document.getElementById('info');
      const successCallback = (response) => {
        info.innerText = response;
      };
      const failureCallback = (error) => {
        info.innerText = error;
      };
      this.draw.upload(blob, url, successCallback, failureCallback);
      btn.style.pointerEvents = 'all';
      btn.innerText = '上传';
    },
  },
};
</script>

<style>
#canvasBox {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.greet {
  padding: 20px;
  font-size: 20px;
  user-select: none;
}
.greet a {
  cursor: pointer;
  margin: 0 20px;
}
.greet select {
  font-size: 18px;
}
canvas {
  flex: 1;
  cursor: crosshair;
  border: 1px solid #000;
}
div#info {
  color: #777;
}
</style>
