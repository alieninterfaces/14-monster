const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

let useSecondVideo = false;

const initialValues = {
  distortionAmount: 1.5, // Adjust this value to control the distortion strength
  exposureValue: 1.0,
  contrastValue: 1.0,
  brightnessValue: 0, // Adjust this value for brightness control
};

const targetValues = {
  distortionAmount: 3, // Adjust this value to control the distortion strength
  exposureValue: 1.0,
  contrastValue: 3.0,
  brightnessValue: 1.9, // Adjust this value for brightness control
};

const values = Object.assign({}, initialValues);

if (!gl) {
  console.error("WebGL not supported");
}

const video = document.createElement("video");
video.src = "/assets/videos/header1.mp4";
video.loop = true;
video.muted = true;
video.autoplay = true;

const video2 = document.createElement("video");

video.addEventListener("canplaythrough", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  video2.src = "/assets/videos/header2.mp4";
  video2.loop = true;
  video2.muted = true;
  video2.autoplay = true;

  video2.addEventListener("canplaythrough", () => {
    init();
  });
});

function init() {
  gl.viewport(0, 0, canvas.width, canvas.height);

  const vertexShaderSource = `
                 attribute vec2 a_position;
                attribute vec2 a_texCoord;
                varying vec2 v_texCoord;

                void main() {
                    // Map the vertex position to the canvas size
                    vec2 position = a_position * vec2(1.0, -1.0);
                    gl_Position = vec4(position, 0, 1);
                    v_texCoord = a_texCoord;
                }
            `;

  const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_videoTexture;
    uniform sampler2D u_videoTexture2;
    uniform bool u_useSecondVideo; // Boolean uniform to toggle between videos

    uniform float u_distortionAmount;
    uniform float u_exposure; // Added exposure uniform
    uniform float u_contrast; // Added contrast uniform
    uniform float u_brightness; // Added brightness uniform

    void main() {
        // Calculate the center of the texture
        vec2 center = vec2(0.5, 0.5);

        // Calculate the vector from the center to the current fragment
        vec2 toCenter = v_texCoord - center;

        // Calculate the distance from the center to the current fragment
        float distanceToCenter = length(toCenter);

        // Apply spherical distortion effect
        vec2 distortedTexCoord = center + normalize(toCenter) * pow(distanceToCenter, u_distortionAmount);

        // Sample the video texture with the distorted texture coordinates
        vec4 texColor;

        //if (u_useSecondVideo) {
        //    texColor = texture2D(u_videoTexture2, distortedTexCoord);
        //} else {
            texColor = texture2D(u_videoTexture, distortedTexCoord);
       // }

        // Apply exposure adjustment
        texColor *= u_exposure;

               // Apply contrast adjustment
        texColor.rgb = (texColor.rgb - 0.5) * u_contrast + 0.5;

        // Apply brightness adjustment
        texColor.rgb += u_brightness;

        gl_FragColor = texColor;
    }
            `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
  const videoTextureLocation = gl.getUniformLocation(program, "u_videoTexture");
  const videoTextureLocation2 = gl.getUniformLocation(
    program,
    "u_videoTexture2"
  );
  const useSecondVideoLocation = gl.getUniformLocation(
    program,
    "u_useSecondVideo"
  );
  const distortionAmountLocation = gl.getUniformLocation(
    program,
    "u_distortionAmount"
  );
  const exposureLocation = gl.getUniformLocation(program, "u_exposure");
  const contrastLocation = gl.getUniformLocation(program, "u_contrast");
  const brightnessLocation = gl.getUniformLocation(program, "u_brightness");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
    gl.STATIC_DRAW
  );

  const positionAttribLocation = gl.getAttribLocation(program, "a_position");
  const texCoordAttribLocation = gl.getAttribLocation(program, "a_texCoord");

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(texCoordAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1i(videoTextureLocation, 0);

  const videoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.uniform1i(videoTextureLocation2, 1);

  const videoTexture2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, videoTexture2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video2);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let delta = 0;
  function draw() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    delta += 0.1;

    // Set the updated distortion amount
    gl.uniform1f(distortionAmountLocation, values.distortionAmount);
    gl.uniform1f(exposureLocation, values.exposureValue);
    gl.uniform1f(contrastLocation, values.contrastValue);
    gl.uniform1f(brightnessLocation, values.brightnessValue);

    gl.uniform1i(useSecondVideoLocation, useSecondVideo ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (useSecondVideo) {
      // Set up the second video texture
      gl.bindTexture(gl.TEXTURE_2D, videoTexture2);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video2);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } else {
      // Set up the first video texture
      gl.bindTexture(gl.TEXTURE_2D, videoTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    requestAnimationFrame(draw);
  }

  video.play();
  video2.play();
  draw();
}

window.addEventListener("click", () => {
  console.log("one");
  const tweenIn = new Tween({
    object: values,
    targetValue: targetValues,
    duration: 800,
    easingFunction: easeOutQuad,
    onComplete: () => {
      useSecondVideo = !useSecondVideo;
      console.log("go");
      const tweenOut = new Tween({
        object: values,
        targetValue: initialValues,
        duration: 400,
        easingFunction: easeInOutQuad,
      });
    },
  });
});
