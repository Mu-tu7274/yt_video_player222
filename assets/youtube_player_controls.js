(function () {
  if (window.trustedTypes && window.trustedTypes.createPolicy) {
    window.trustedTypes.createPolicy('default', {
      createHTML: string => string,
      createScriptURL: string => string,
      createScript: string => string,
    });
  }

  let style = document.createElement('style');
  let cssContent = `
  #custom-controls {
      position: fixed;
      width: 100%;
      background: black;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      z-index: 10000;
      opacity: 1;
      transition: opacity 0.3s ease;
      bottom: 0;
      box-sizing: border-box;
  }
  #custom-controls.hide {
    opacity: 0;
    pointer-events: none;
  }
  #custom-controls button {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    padding: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  #custom-slider {
    width: 50%;
    height: 5px;
    -webkit-appearance: none;
    background: #ddd;
    border-radius: 5px;
    outline: none;
    direction: rtl;
    transition: background 0.3s;
  }
  #custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
  }
  #time-display-left, #time-display-right {
    color: white;
    font-size: 14px;
    margin: 0 20px;
    user-select: none;
  }
  #quality-selector {
    appearance: none;
    background: rgba(0, 0, 0, 0.7);
    border: none !important;
    outline: none !important;
    border-radius: 5px;
    color: white;
    padding: 5px;
    font-size: 14px;
    cursor: pointer;
    margin-left: 10px;
    margin-right: 10px;
  }
  .play-pause-container {
    display: flex;
    align-items: center;
    direction: ltr;
  }
  button#rewind-10, button#forward-10 {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 8px;
  }
  #switch-direction {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
  }
  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  [dir="rtl"] #custom-controls {
    flex-direction: row-reverse;
  }
 [dir="rtl"] #custom-slider {
  direction: ltr;
 }
  #custom-controls #goBack {
      position: fixed;
      left: 20px;
      top: 20px;
      background: #0000008c;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
  }
  #goBack svg{
    width: 1.5rem;
    height: 1.5rem;
  }
  @media (max-width: 600px) {
    #custom-controls {
      flex-wrap: wrap;
      padding: 5px;
    }
    #custom-slider {
      width: 100%;
    }
    .play-pause-container {
      margin-top: 10px;
    }
    #time-display-left, #time-display-right {
      font-size: 12px;
      margin: 5px 10px;
    }
    #quality-selector, #switch-direction {
      margin-top: 10px;
    }
    #goBack svg{
      width: 1rem;
      height: 1rem;
    }
    #custom-controls #goBack {
        left: 5px;
        top: 5px;
    }
  }
  `;
  style.appendChild(document.createTextNode(cssContent));
  document.head.appendChild(style);

  function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);
    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    if (secs < 10) secs = `0${secs}`;
    return `${hours}:${minutes}:${secs}`;
  }

  let controls = document.createElement('div');
  controls.id = 'custom-controls';

  let totalTimeDisplay = document.createElement('div');
  totalTimeDisplay.id = 'time-display-left';
  totalTimeDisplay.textContent = '00:00:00';

  let currentTimeDisplay = document.createElement('div');
  currentTimeDisplay.id = 'time-display-right';
  currentTimeDisplay.textContent = '00:00:00';

  let slider = document.createElement('input');
  slider.type = 'range';
  slider.id = 'custom-slider';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';

  let playPauseButton = document.createElement('button');
  playPauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>`;
  playPauseButton.id = 'play-pause';

  let rewind10Button = document.createElement('button');
  rewind10Button.id = 'rewind-10';
  rewind10Button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>`;

  let forward10Button = document.createElement('button');
  forward10Button.id = 'forward-10';
  forward10Button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>`;

  let playPauseContainer = document.createElement('div');
  playPauseContainer.className = 'play-pause-container';
  playPauseContainer.appendChild(rewind10Button);
  playPauseContainer.appendChild(playPauseButton);
  playPauseContainer.appendChild(forward10Button);


  let qualitySelectorWrap = document.createElement('div');
  let qualitySelector = document.createElement('select');
  qualitySelector.id = 'quality-selector';
  const qualityOptions = [
    { value: 'hd1080', text: '1080p' },
    { value: 'hd720', text: '720p' },
    { value: 'large', text: '480p' },
    { value: 'medium', text: '360p' },
    { value: 'small', text: '240p' },
    { value: 'tiny', text: '144p' }
  ];

  qualityOptions.forEach(optionData => {
    let option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.text;
    qualitySelector.appendChild(option);
  });
  qualitySelectorWrap.appendChild(qualitySelector);

  //   let switchDirectionButton = document.createElement('button');
  //   switchDirectionButton.id = 'switch-direction';
  //   switchDirectionButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  //   <rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
  //   <circle cx="16" cy="12" r="3"></circle>
  // </svg>`;

  let goBack = document.createElement('button');
  goBack.id = 'goBack';
  goBack.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
<path d="M5 1H4L0 5L4 9H5V6H11C12.6569 6 14 7.34315 14 9C14 10.6569 12.6569 12 11 12H4V14H11C13.7614 14 16 11.7614 16 9C16 6.23858 13.7614 4 11 4H5V1Z" fill="#fff"/>
</svg>`;
  controls.appendChild(goBack);
  controls.appendChild(totalTimeDisplay);
  controls.appendChild(qualitySelectorWrap);
  controls.appendChild(slider);
  controls.appendChild(playPauseContainer);
  controls.appendChild(currentTimeDisplay);
  // controls.appendChild(switchDirectionButton);
  document.body.appendChild(controls);

  let isPlaying = true;
  const videoPlayer = document.getElementById('movie_player');

  playPauseButton.addEventListener('click', function () {
    if (isPlaying) {
      videoPlayer.pauseVideo();
      playPauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`;
    } else {
      videoPlayer.playVideo();
      playPauseButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>`;
    }
    isPlaying = !isPlaying;
  });

  rewind10Button.addEventListener('click', function () {
    videoPlayer.seekTo(videoPlayer.getCurrentTime() - 10, true);
  });

  forward10Button.addEventListener('click', function () {
    videoPlayer.seekTo(videoPlayer.getCurrentTime() + 10, true);
  });

  slider.addEventListener('input', function () {
    const newTime = (slider.value / 100) * videoPlayer.getDuration();
    videoPlayer.seekTo(newTime, true);
  });

  goBack.addEventListener("click", function () {
    history.back();
  });

  setInterval(function () {
    if (videoPlayer && videoPlayer.getDuration) {
      const progress = (videoPlayer.getCurrentTime() / videoPlayer.getDuration()) * 100;
      slider.value = progress;

      const currentTime = videoPlayer.getCurrentTime();
      const totalTime = videoPlayer.getDuration();
      currentTimeDisplay.textContent = formatTime(currentTime);
      totalTimeDisplay.textContent = formatTime(totalTime);
    }
  }, 1000);

  qualitySelector.addEventListener('change', function () {
    videoPlayer.setPlaybackQualityRange(qualitySelector.value);
  });

  // switchDirectionButton.addEventListener('click', function () {
  //   controls.classList.toggle('rtl-layout');
  //   if (controls.classList.contains('rtl-layout')) {
  //     slider.style.direction = 'ltr';
  //   } else {
  //     slider.style.direction = 'rtl';
  //   }
  // });

  let hideTimer;
  function resetHideTimer() {
    clearTimeout(hideTimer);
    controls.classList.remove('hide');
    hideTimer = setTimeout(() => {
      controls.classList.add('hide');
    }, 2000);
  }

  document.addEventListener('mousemove', resetHideTimer);
  resetHideTimer();
})();


injectCSS();
preventVideoClicks();

function injectCSS() {
  let style = document.createElement('style');
  let cssContent = `
    .ytp-chrome-top {
        display: none;
    }
    .ytp-chrome-controls .ytp-button.ytp-youtube-button,
    .ytp-small-mode .ytp-chrome-controls .ytp-button.ytp-youtube-button,
    .ytp-embed .ytp-chrome-controls .ytp-button.ytp-youtube-button,
    .ytp-embed.ytp-small-mode .ytp-chrome-controls .ytp-button.ytp-youtube-button,
    .ytp-dni.ytp-embed .ytp-chrome-controls .ytp-button.ytp-youtube-button {
        width: 67px;
        display: none;
    }
    .ytp-popup {
        position: absolute;
        overflow: hidden;
        border-radius: 2px;
        background: rgba(28, 28, 28, .9);
        text-shadow: 0 0 2px rgba(0, 0, 0, .5);
        -webkit-transition: opacity .1s cubic-bezier(0,0,.2,1);
        transition: opacity .1s cubic-bezier(0,0,.2,1);
        -moz-user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;
        display: none;
    }
    .ytp-embed:not(.ad-showing) .ytp-player-content:not(.ytp-upnext) {
        top: 60px;
        display: none;
    }
    .ytp-hide-controls:not(.ytp-mweb-player) .ytp-watermark {
        bottom: 5px;
        -webkit-transition: bottom .1s cubic-bezier(.4,0,1,1), opacity .1s cubic-bezier(.4,0,1,1);
        transition: bottom .1s cubic-bezier(.4,0,1,1), opacity .1s cubic-bezier(.4,0,1,1);
        display: none;
    }
    .ytp-panel-menu {
        padding: 8px 0;
        display: table;
        width: 100%;
        color: #eee;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        display: none;
    }
    .ytp-ce-element.ytp-ce-element-show {
        opacity: 1;
        -webkit-transition: visibility 0s linear 0s, opacity .2s cubic-bezier(.4,0,1,1), border-color .2s cubic-bezier(.4,0,1,1);
        transition: visibility 0s linear 0s, opacity .2s cubic-bezier(.4,0,1,1), border-color .2s cubic-bezier(.4,0,1,1);
        visibility: visible;
        display: none;
    }
    .ytp-pause-overlay {

        display: none;
    }
  `;

  style.appendChild(document.createTextNode(cssContent));
  document.head.appendChild(style);
}

injectCSS();



function customTimeDisplay() {
  let controls = document.createElement('div');
  controls.id = 'custom-controls';
  controls.style.position = 'fixed';
  controls.style.bottom = '20px';
  controls.style.left = '50%';
  controls.style.transform = 'translateX(-50%)';
  controls.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  controls.style.color = 'white';
  controls.style.padding = '10px';
  controls.style.borderRadius = '10px';
  document.body.appendChild(controls);
  const videoPlayer = document.getElementById('movie_player');

  function updateDisplay() {
    let currentTime = videoPlayer.getCurrentTime();
    let duration = videoPlayer.getDuration();
    controls.textContent = formatTime(currentTime) + ' / ' + formatTime(duration);
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return hours > 0 ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`;
  }

  setInterval(updateDisplay, 1000);
}

function preventVideoClicks() {
  document.querySelector('.html5-video-player').style.pointerEvents = 'none';

  document.querySelector('.html5-video-player').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
  }, true);

  const videoPlayer = document.querySelector('.html5-video-player');
  const preventClickTouch = function (e) {
    e.stopPropagation();
    e.preventDefault();
  };

  if (videoPlayer) {
    videoPlayer.addEventListener('click', preventClickTouch, true);
    videoPlayer.addEventListener('touchstart', preventClickTouch, true);
  }

  const overlay = document.querySelector('.ytp-pause-overlay-controls-hidden');
  if (overlay) {
    overlay.style.pointerEvents = 'none';
  }
}
