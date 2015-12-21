/*! videojs-hls - v0.0.0 - 2015-9-24
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license. */
(function (window, videojs, Hls, document, undefined) {
  'use strict';
  /**
  * Initialize the plugin.
  * @param options (optional) {object} configuration for the plugin
  */
  var Component = videojs.getComponent('Component');
  var Tech = videojs.getTech('Tech');
  var Html5 = videojs.getComponent('Html5');

  var Hlsjs = videojs.extend(Html5, {
    createEl : function () {
      this.hls_ = new Hls();
      this.el_ = Html5.prototype.createEl.apply(this, arguments);

      this.hls_.on(Hls.Events.MEDIA_ATTACHED, videojs.bind(this, this.onMediaAttached));
      this.hls_.on(Hls.Events.MANIFEST_PARSED, videojs.bind(this, this.onManifestParsed));
      this.hls_.on(Hls.Events.LEVEL_LOADED, videojs.bind(this, this.onLevelLoaded));
      this.hls_.on(Hls.Events.ERROR, videojs.bind(this, this.onError));
      this.hls_.attachMedia(this.el_);
      this.src(this.options_.source.src);

      this.el_.tech = this;
      return this.el_;
    },
    onMediaAttached: function () {
      this.triggerReady();
    },
    onLevelLoaded: function(event, data) {
      this.duration = data.details.live ? function () {return Infinity;} : Html5.prototype.duration;
    },
    onManifestParsed: function() {
      if (this.player().options().autoplay) {
        this.player().play();
      }
    },
    setSrc: function (src) {
      this.hls_.loadSource(src);
    },
    onError: function (event, data) {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            this.log('fatal network error encountered, try to recover');
            this.hls_.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            this.log('fatal media error encountered, try to recover');
            this.hls_.recoverMediaError();
            break;
          default:
            // cannot recover
            this.hls_.destroy();
            this.error(data);
            break;
          }
        }
        switch (data.details) {
          case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
          case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
          case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
          case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
          case Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
          case Hls.ErrorDetails.LEVEL_SWITCH_ERROR:
          case Hls.ErrorDetails.FRAG_LOAD_ERROR:
          case Hls.ErrorDetails.FRAG_LOOP_LOADING_ERROR:
          case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
          case Hls.ErrorDetails.FRAG_PARSING_ERROR:
          case Hls.ErrorDetails.BUFFER_APPEND_ERROR:
          case Hls.ErrorDetails.BUFFER_APPENDING_ERROR:
            console.log(data.type);
            console.log(data.details);
            break;
          default:
            break;
        }
      },
      dispose: function () {
        this.hls_.destroy();
        return Html5.prototype.dispose.apply(this);
      }
    });

    Hlsjs.isSupported = function(){

      return Hls.isSupported();
    };
    Hlsjs.canPlaySource = function (techId, source) {
      if (Html5.canPlaySource(techId, source)) {
        return false;
      } else {
        console.log('Hls.isSupported');
        return Hls.isSupported();
      }
    };

    // register as Component and Tech;
    Component.registerComponent('Hlsjs', Hlsjs);
    Tech.registerTech('Hlsjs', Hlsjs);

    videojs.options.techOrder.push('Hlsjs');
})
(window, videojs, Hls, document);
