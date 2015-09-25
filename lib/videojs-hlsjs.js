/*! videojs-hls - v0.0.0 - 2015-9-24
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license. */

videojs.Hls = Hls || window.Hls;
/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */
videojs.HlsJs = videojs.Html5.extend({
  init: function (player, options, ready) {
    this.hls = new videojs.Hls();
    player.hlsJs = this;
    videojs.Html5.call(this, player, options, ready);
    this.hls.on(videojs.Hls.Events.MSE_ATTACHED, videojs.bind(this, this.onMseAttached));
    this.hls.on(videojs.Hls.Events.MANIFEST_PARSED, videojs.bind(this, this.onManifestParsed));
    this.hls.on(videojs.Hls.Events.ERROR, videojs.bind(this, this.onError));
    this.hls.on(videojs.Hls.Events.LEVEL_LOADED, videojs.bind(this, this.onLevelLoaded));
  }
});

videojs.HlsJs.prototype.options_ = {
  debug: false,
  autoStartLoad: false,
  maxBufferLength: 30,
  maxBufferSize: 60 * 1000 * 1000,
  enableWorker: true,
  fragLoadingTimeOut: 20000,
  fragLoadingMaxRetry: 6,
  fragLoadingRetryDelay: 500,
  manifestLoadingTimeOut: 10000,
  manifestLoadingMaxRetry: 6,
  manifestLoadingRetryDelay: 500,
  fpsDroppedMonitoringPeriod: 5000,
  fpsDroppedMonitoringThreshold: 0.2,
  appendErrorMaxRetry: 200,
  //loader: customLoader
};

videojs.HlsJs.prototype.hls = {};

videojs.HlsJs.prototype.dispose = function () {
  //this.hls.detachVideo();
  //this.hls.destroy();
  videojs.Html5.prototype.dispose.call(this);
};

videojs.HlsJs.prototype.load = function () {
  this.hls.startLoad();
};

videojs.HlsJs.prototype.onLevelLoaded = function (event, data) {
  var level_duration = data.details.totalduration;
};

videojs.HlsJs.prototype.onError = function (event, data) {

  if (data.fatal) {
    switch (data.type) {
      case videojs.Hls.ErrorTypes.NETWORK_ERROR:
        // try to recover network error
        videojs.log('fatal network error encountered, try to recover');
        this.hls.recoverNetworkError();
        break;
      case videojs.Hls.ErrorTypes.MEDIA_ERROR:
        videojs.log('fatal media error encountered, try to recover');
        this.hls.recoverMediaError();
        break;
      default:
        // cannot recover
        this.hls.destroy();
        this.player().error(data);
        break;
    }
  }
  switch (data.details) {
    case this.hls.ErrorDetails.MANIFEST_LOAD_ERROR:
    case this.hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
    case this.hls.ErrorDetails.MANIFEST_PARSING_ERROR:
    case this.hls.ErrorDetails.LEVEL_LOAD_ERROR:
    case this.hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
    case this.hls.ErrorDetails.LEVEL_SWITCH_ERROR:
    case this.hls.ErrorDetails.FRAG_LOAD_ERROR:
    case this.hls.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
    case this.hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
    case this.hls.ErrorDetails.FRAG_PARSING_ERROR:
    case this.hls.ErrorDetails.FRAG_APPENDING_ERROR:
      videojs.log(data.type);
      videojs.log(data.details);
      break;
    default:
      break;
  }

};

videojs.HlsJs.prototype.onMseAttached = function () {
  this.triggerReady();
};

videojs.HlsJs.prototype.onManifestParsed = function () {
  if (this.player().options().autoplay) {
    this.player().play();
  }
};

// Add HLS to the standard tech order
videojs.options.techOrder.unshift('hlsJs');

(function () {
  var
    origSetSource = videojs.HlsJs.prototype.setSource,
    origDisposeSourceHandler = videojs.HlsJs.prototype.disposeSourceHandler;

  videojs.HlsJs.prototype.setSource = function (source) {
    var retVal = origSetSource.call(this, source);
    this.source_ = source.src;
    this.hls.loadSource(this.source_);
    this.hls.attachVideo(this.el_);
    return retVal;
  };

  videojs.HlsJs.prototype.disposeSourceHandler = function () {
    this.source_ = undefined;
    return origDisposeSourceHandler.call(this);
  };
})();

videojs.HlsJs.canPlaySource = function (srcObj) {
  var mpegurlRE = /^application\/(?:x-|vnd\.apple\.)mpegurl/i;
  return mpegurlRE.test(srcObj.type);
};

videojs.HlsJs.supportsNativeHls = (function () {
  var
    video = document.createElement('video'),
    xMpegUrl,
    vndMpeg;

  // native HLS is definitely not supported if HTML5 video isn't
  if (!videojs.Html5.isSupported()) {
    return false;
  }

  xMpegUrl = video.canPlayType('application/x-mpegURL');
  vndMpeg = video.canPlayType('application/vnd.apple.mpegURL');
  return (/probably|maybe/).test(xMpegUrl) ||
    (/probably|maybe/).test(vndMpeg);
})();

videojs.HlsJs.isSupported = function () {

  // Only use the HLS tech if native HLS isn't available
  return videojs.Hls.isSupported();
};
