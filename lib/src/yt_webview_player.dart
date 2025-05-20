import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Singleton secure storage with dynamic AES key/IV
class SecureStorage {
  SecureStorage._();
  static final SecureStorage _instance = SecureStorage._();
  factory SecureStorage() => _instance;

  final _storage = const FlutterSecureStorage();
  late encrypt.Key encryptionKey;
  late encrypt.IV iv;

  Future<void> init() async {
    await _loadKey();
    await _loadIV();
  }

  Future<void> _loadKey() async {
    String? keyBase64 = await _storage.read(key: 'encryptionKey');
    if (keyBase64 == null) {
      keyBase64 = encrypt.Key.fromLength(32).base64;
      await _storage.write(key: 'encryptionKey', value: keyBase64);
    }
    encryptionKey = encrypt.Key.fromBase64(keyBase64);
  }

  Future<void> _loadIV() async {
    String? ivBase64 = await _storage.read(key: 'encryptionIV');
    if (ivBase64 == null) {
      ivBase64 = encrypt.IV.fromLength(16).base64;
      await _storage.write(key: 'encryptionIV', value: ivBase64);
    }
    iv = encrypt.IV.fromBase64(ivBase64);
  }

  String encryptData(String data) {
    final encrypter = encrypt.Encrypter(encrypt.AES(encryptionKey));
    return encrypter.encrypt(data, iv: iv).base64;
  }

  String decryptData(String encryptedData) {
    final encrypter = encrypt.Encrypter(encrypt.AES(encryptionKey));
    return encrypter.decrypt64(encryptedData, iv: iv);
  }

  Future<String> getOrCreateEncrypted(String key, String plainText) async {
    String? stored = await _storage.read(key: key);
    if (stored == null) {
      stored = encryptData(plainText);
      await _storage.write(key: key, value: stored);
    }
    return stored;
  }

  Future<String> decryptStored(String key) async {
    final encrypted = await _storage.read(key: key);
    if (encrypted == null) throw Exception("Missing encrypted key: $key");
    return decryptData(encrypted);
  }
}

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
  final SecureStorage _secureStorage = SecureStorage();
  String? fullUrl;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initialize());
    _forceLandscapeMode();
  }

  Future<void> _initialize() async {
    try {
      await _secureStorage.init();

      // LICENSE check
      final encryptedLicense = await _secureStorage.getOrCreateEncrypted('license_key', 'LICENSE-KEY-1234');
      final license = _secureStorage.decryptData(encryptedLicense);
      if (license != 'LICENSE-KEY-1234') throw Exception("License mismatch");

      // Encrypted YouTube parts
      final ytPrefix = await _secureStorage.getOrCreateEncrypted('yt_prefix', 'https://www.youtube.com/embed/');
      final ytSuffix = await _secureStorage.getOrCreateEncrypted(
        'yt_suffix',
        '?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=1',
      );

      final url = _secureStorage.decryptData(ytPrefix) + widget.videoId + _secureStorage.decryptData(ytSuffix);
      setState(() {
        fullUrl = url;
      });
    } catch (e) {
      print("❌ Initialization error: $e");
      setState(() => hasError = true);
    }
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
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: SystemUiOverlay.values);
    Navigator.pop(context);
  }

  Future<void> _injectJavaScript() async {
    try {
      final jsCode = await rootBundle.loadString('assets/rawplayer.js');
      await _webViewController?.evaluateJavascript(source: jsCode);
    } catch (e) {
      print("❌ JS injection failed: $e");
    }
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
        body: hasError
            ? const Center(
            child: Text("⛔ Invalid license or error", style: TextStyle(color: Colors.white)))
            : fullUrl == null
            ? const Center(child: CircularProgressIndicator())
            : InAppWebView(
          initialUrlRequest: URLRequest(url: WebUri(fullUrl!)),
          initialSettings: InAppWebViewSettings(
            transparentBackground: true,
            mediaPlaybackRequiresUserGesture: false,
            allowsInlineMediaPlayback: true,
            javaScriptEnabled: true,
            userAgent:
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
          ),
          onWebViewCreated: (controller) {
            _webViewController = controller;
            _injectJavaScript();
          },
        ),
      ),
    );
  }
}
