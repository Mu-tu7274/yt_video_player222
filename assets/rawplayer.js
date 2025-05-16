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
    .ytp-pause-overlay{
    display: none ;
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

   document.querySelector('.html5-video-player').addEventListener('click', function(e) {
    e.stopPropagation();
     e.preventDefault();
  }, true);

  const videoPlayer = document.querySelector('.html5-video-player');
  const preventClickTouch = function(e) {
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

/*
(function initializeCustomVideoControls() {
  let style = document.createElement('style');
  let cssContent = `
    #custom-controls {
      position: fixed;
      bottom: 20px;
      width: auto;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
      z-index: 10000;
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    #time-display {
      color: white;
      font-size: 16px;
    }
  `;
  style.appendChild(document.createTextNode(cssContent));
  document.head.appendChild(style);

  let controls = document.createElement('div');
  controls.id = 'custom-controls';

  let timeDisplay = document.createElement('div');
  timeDisplay.id = 'time-display';
  timeDisplay.textContent = '0:00:00 / 0:00:00';

  controls.appendChild(timeDisplay);
  document.body.appendChild(controls);

  const videoPlayer = document.getElementById('movie_player');

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs}`
      : `${minutes}:${secs}`;
  }

  setInterval(function() {
    if (videoPlayer && videoPlayer.getDuration) {
      const currentTime = videoPlayer.getCurrentTime();
      const duration = videoPlayer.getDuration();
      timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
  }, 1000);
})();
*/