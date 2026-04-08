/* ============================================
   ASCII Text Effect - Vanilla JS
   Adapted from react-bits ASCIIText component
   ============================================ */
(function () {
  var container = document.getElementById('asciiText');
  if (!container) return;

  var TEXT = 'Addie';
  var ASCII_FONT_SIZE = 36;
  var TEXT_FONT_SIZE = 200;
  var TEXT_COLOR = '#fdf9f3';
  var PLANE_BASE_HEIGHT = 8;
  var CHARSET = " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

  Math.map = function (n, start, stop, start2, stop2) {
    return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
  };

  var PX_RATIO = window.devicePixelRatio || 1;

  // ---- AsciiFilter ----
  function AsciiFilter(renderer, opts) {
    opts = opts || {};
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = opts.invert !== undefined ? opts.invert : true;
    this.fontSize = opts.fontSize || 12;
    this.fontFamily = opts.fontFamily || "'Courier New', monospace";
    this.charset = opts.charset || CHARSET;

    this.context.imageSmoothingEnabled = false;

    this.mouse = { x: 0, y: 0 };
    this.center = { x: 0, y: 0 };
    var self = this;
    this._onMouseMove = function (e) {
      self.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
    };
    document.addEventListener('mousemove', this._onMouseMove);
  }

  AsciiFilter.prototype.setSize = function (w, h) {
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h);
    this.reset();
    this.center = { x: w / 2, y: h / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  };

  AsciiFilter.prototype.reset = function () {
    this.context.font = this.fontSize + 'px ' + this.fontFamily;
    var charWidth = this.context.measureText('A').width;
    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);
    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = this.fontSize + 'px';
    this.pre.style.margin = '0';
    this.pre.style.padding = '0';
    this.pre.style.lineHeight = '1em';
    this.pre.style.position = 'absolute';
    this.pre.style.left = '0';
    this.pre.style.top = '0';
    this.pre.style.zIndex = '9';
    this.pre.style.backgroundAttachment = 'fixed';
    this.pre.style.mixBlendMode = 'difference';
  };

  AsciiFilter.prototype.render = function (scene, camera) {
    this.renderer.render(scene, camera);
    var w = this.canvas.width;
    var h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (w && h) {
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    }
    this.asciify(this.context, w, h);
    this.hue();
  };

  AsciiFilter.prototype.hue = function () {
    // disabled - no mouse interaction
  };

  AsciiFilter.prototype.asciify = function (ctx, w, h) {
    if (w && h) {
      var imgData = ctx.getImageData(0, 0, w, h).data;
      var str = '';
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var i = x * 4 + y * 4 * w;
          var r = imgData[i], g = imgData[i + 1], b = imgData[i + 2], a = imgData[i + 3];
          if (a === 0) { str += ' '; continue; }
          var gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          var idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += '\n';
      }
      this.pre.innerHTML = str;
    }
  };

  AsciiFilter.prototype.dispose = function () {
    document.removeEventListener('mousemove', this._onMouseMove);
  };

  // ---- CanvasTxt ----
  function CanvasTxt(txt, opts) {
    opts = opts || {};
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.txt = txt;
    this.fontSize = opts.fontSize || 200;
    this.fontFamily = opts.fontFamily || 'Arial';
    this.color = opts.color || '#fdf9f3';
    this.font = '600 ' + this.fontSize + 'px ' + this.fontFamily;
  }

  CanvasTxt.prototype.resize = function () {
    this.context.font = this.font;
    var metrics = this.context.measureText(this.txt);
    this.canvas.width = Math.ceil(metrics.width) + 20;
    this.canvas.height = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 20;
  };

  CanvasTxt.prototype.render = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    var metrics = this.context.measureText(this.txt);
    this.context.fillText(this.txt, 10, 10 + metrics.actualBoundingBoxAscent);
  };

  // ---- Main setup ----
  var vertexShader = [
    'varying vec2 vUv;',
    'uniform float uTime;',
    'uniform float mouse;',
    'uniform float uEnableWaves;',
    'void main() {',
    '  vUv = uv;',
    '  float time = uTime * 5.;',
    '  float waveFactor = uEnableWaves;',
    '  vec3 transformed = position;',
    '  transformed.x += sin(time + position.y) * 0.5 * waveFactor;',
    '  transformed.y += cos(time + position.z) * 0.15 * waveFactor;',
    '  transformed.z += sin(time + position.x) * waveFactor;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);',
    '}'
  ].join('\n');

  var fragmentShader = [
    'varying vec2 vUv;',
    'uniform float mouse;',
    'uniform float uTime;',
    'uniform sampler2D uTexture;',
    'void main() {',
    '  float time = uTime;',
    '  vec2 pos = vUv;',
    '  float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;',
    '  float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;',
    '  float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;',
    '  float a = texture2D(uTexture, pos).a;',
    '  gl_FragColor = vec4(r, g, b, a);',
    '}'
  ].join('\n');

  function init() {
    var rect = container.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    if (w === 0 || h === 0) return;

    var camera = new THREE.PerspectiveCamera(45, w / h, 1, 1000);
    camera.position.z = 30;
    var scene = new THREE.Scene();

    var textCanvas = new CanvasTxt(TEXT, {
      fontSize: TEXT_FONT_SIZE,
      fontFamily: 'Space Mono',
      color: TEXT_COLOR
    });
    textCanvas.resize();
    textCanvas.render();

    var texture = new THREE.CanvasTexture(textCanvas.canvas);
    texture.minFilter = THREE.NearestFilter;

    var textAspect = textCanvas.canvas.width / textCanvas.canvas.height;
    var planeW = PLANE_BASE_HEIGHT * textAspect;
    var geometry = new THREE.PlaneGeometry(planeW, PLANE_BASE_HEIGHT, 36, 36);
    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: texture },
        uEnableWaves: { value: 0.0 }
      }
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    var filter = new AsciiFilter(renderer, {
      fontFamily: 'Space Mono',
      fontSize: ASCII_FONT_SIZE,
      invert: true
    });

    container.appendChild(filter.domElement);
    filter.setSize(w, h);

    var mouse = { x: w / 2, y: h / 2 };
    container.addEventListener('mousemove', function (e) {
      var bounds = container.getBoundingClientRect();
      mouse.x = e.clientX - bounds.left;
      mouse.y = e.clientY - bounds.top;
    });

    function animate() {
      requestAnimationFrame(animate);
      var time = new Date().getTime() * 0.001;
      textCanvas.render();
      texture.needsUpdate = true;
      mesh.material.uniforms.uTime.value = Math.sin(time);

      filter.render(scene, camera);
    }
    animate();

    // Handle resize
    var ro = new ResizeObserver(function (entries) {
      var entry = entries[0];
      if (!entry) return;
      var nw = entry.contentRect.width;
      var nh = entry.contentRect.height;
      if (nw > 0 && nh > 0) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        filter.setSize(nw, nh);
      }
    });
    ro.observe(container);
  }

  // Wait for fonts then init
  document.fonts.ready.then(init);
})();
