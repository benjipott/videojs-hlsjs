# Videojs Hls.js

A revolutionary plugin for video.js

## Getting Started

Once you've added the plugin script to your page, you can use it with any video:

```html
<script src="video.js"></script>
<script src="videojs-hlsjs.js"></script>
<script>
  videojs(document.querySelector('video'));
</script>
```

There's also a [working example](example.html) of the plugin you can check out if you're having trouble.

## Documentation
### Tech Options

You may pass in an options object to the plugin upon initialization. This
object may contain any of the following properties:

#### option

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

An example boolean option that has no effect.

## Release History

 - 0.1.0: Initial release
