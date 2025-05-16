import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class YTWebViewPlayer extends StatefulWidget {
  final String videoId;
  const YTWebViewPlayer({super.key, required this.videoId});

  @override
  State<YTWebViewPlayer> createState() => _YTWebViewPlayerState();
}

class _YTWebViewPlayerState extends State<YTWebViewPlayer> {
  InAppWebViewController? _webViewController;
  bool hasError = false;
  bool showShadows = false;
  Timer? _shadowHideTimer;

  @override
  void initState() {
    super.initState();
    _forceLandscapeMode();
  }

  void _forceLandscapeMode() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: []);
  }

  void _restorePortraitMode() async {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual,
        overlays: SystemUiOverlay.values);
    Navigator.pop(context);
  }

  Future<void> _injectJavaScript() async {
    try {
      String jsCode = await rootBundle.loadString('assets/rawplayer.js');
      await _webViewController?.evaluateJavascript(source: jsCode);
    } catch (e) {
      debugPrint("❌ Error loading JavaScript from assets: $e");
    }
  }

  void _startShadowHideTimer() {
    setState(() {
      showShadows = true;
    });

    _shadowHideTimer?.cancel();
    _shadowHideTimer = Timer(const Duration(seconds: 3), () {
      setState(() {
        showShadows = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    return WillPopScope(
      onWillPop: () async {
        _restorePortraitMode();
        return false;
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Stack(
          children: [
            hasError
                ? Center(
                child: Text("Error loading video",
                    style: TextStyle(color: Colors.white)))
                : InAppWebView(
              initialUrlRequest: URLRequest(
                url: WebUri(
                    "https://www.youtube.com/embed/${widget.videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=1"),
              ),
              initialSettings: InAppWebViewSettings(
                transparentBackground: true,
                mediaPlaybackRequiresUserGesture: false,
                allowsInlineMediaPlayback: true,
                javaScriptEnabled: true,
                userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",

              ),
              onWebViewCreated: (controller)async {
                _webViewController = controller;
                await _injectJavaScript();
                _startShadowHideTimer();
              },
              onLoadStop: (controller, url) async {
                await _injectJavaScript();
                showShadows = true ;
                // JavaScript code to interact with the video player
                String script = """ (function () {
  // Retrieve the video player element by ID
  var player = document.getElementById('movie_player');

  if (player && typeof YT !== 'undefined') {
    // Notify Flutter on player state changes
    player.addEventListener('onStateChange', function (event) {
      if (event.data == YT.PlayerState.PLAYING) {
        window.flutter_inappwebview.callHandler('VideoStateChange', 'playing');
        disableFullScreen();
        hideElements();
      } else if (event.data == YT.PlayerState.PAUSED) {
        window.flutter_inappwebview.callHandler('VideoStateChange', 'paused');
      }
    });
  }

  // Check if the video player exists and is ready
  if (!player || typeof player.getCurrentTime !== 'function' || typeof player.getDuration !== 'function') {
    return { error: 'Video player is not ready or missing methods' };
  }

  // Set playback quality
  player.setPlaybackQualityRange('medium');

  // Disable fullscreen functionality
  function disableFullScreen() {
    var requestFullScreen = player.requestFullscreen || player.mozRequestFullScreen || player.webkitRequestFullScreen;
    if (requestFullScreen) {
      requestFullScreen = function () {};
    }
  }

  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', function (e) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  });

  // Hide YouTube overlays and watermark
  function hideElements() {
    const selectors = [
      '.ytp-chrome-top',
      '.ytp-pause-overlay',
      ':not(.ytp-mweb-player) .ytp-watermark'
    ];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
      });
    });
  }

  // Call immediately and with delay to catch async re-renders
  hideElements();
  setTimeout(hideElements, 300);
  setTimeout(hideElements, 600);
  setTimeout(hideElements, 1000);

  // Return success
  return { success: 'Video player setup complete' };
})();
  """;

                try {
                  // Evaluating the JavaScript code to set up the video player
                  var result = await _webViewController
                      ?.evaluateJavascript(source: script);

                  // Check if any error occurred during JavaScript execution
                  if (result != null) {
                    try {
                      Map<String, dynamic> parsedResult =
                      Map<String, dynamic>.from(result);

                      // Handle errors returned from JavaScript
                      if (parsedResult.containsKey('error')) {

                        return;
                      } else {

                      }
                    } catch (e) {
                      print("Failed to parse JavaScript result: \$e");

                    }
                  } else {
                    print(
                        "JavaScript evaluation returned null or empty result.");
                  }

                  // Fetch the total duration of the video
                  String durationScript = """
    (function() {
      var player = document.getElementById('movie_player');
      return player && player.getDuration ? player.getDuration() : 0;
    })();
    """;

                  var durationResult = await _webViewController
                      ?.evaluateJavascript(source: durationScript);
                  double duration =
                      double.tryParse(durationResult.toString()) ?? 0.0;


                  // Hide shadows periodically
                  Timer.periodic(const Duration(seconds: 3), (timer) {
                  });
                } catch (e) {
                  print("Error during onLoadStop: \$e");
                }
              },
            ),
            if (showShadows)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: screenHeight * 0.155,
                  color: Colors.black,
                ),
              ),
            if (showShadows)
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: screenHeight * 0.13,
                  color: Colors.black,
                ),
              ),
            Positioned(
              top: 16,
              right: 16,
              child: IconButton(
                icon: Icon(Icons.close, color: Colors.white, size: 30),
                onPressed: _restorePortraitMode,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
