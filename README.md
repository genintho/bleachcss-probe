# BleachCSS - Probe - Reliable unused CSS Detection and Removal

The BleachCSS Probe is the official browser JavaScript client for [BleachCSS](https://www.bleachcss.com).

## What does it do?

The Probe tracks the list of css selectors used in the application and sends it to the BleachCSS servers. Even after a page loads, the Probe watches for DOM mutations to detect newly used selectors. As a result, BleachCSS can confidently detect and remove unused CSS in static websites, CMS systems, Single Page Applications (SPA), and traditional server-rendered dynamic content, no matter what framework is used.

## How does it work?

The Probe's activity can be divided into 5 logical groups:

- **Find CSS files used on the page**. If a new file gets used during the session, it needs to be detected and processed.
- **Extract selectors from the stylesheets**.
- **Detect page modifications**. This must be done without conflicting with other application code.
- **Efficiently detect used selector**. With as little overhead as possible, to not slowdown the application.
- **Report to the server**. The combination of many client reports over time can give an accurate and trustworthy analysis.

## How do I install the Probe?

```HTML
<script src="https://cdn.bleachcss.com/probe/latest.js"></script>
<script>
    BleachCSS.start({key: 'YOUR_KEY'});
</script>
```

Note: You need to generate a key on [BleachCSS](https://www.bleachcss.com) to use its server.

## API

### start

Configure and start a new instance of BleachCSS.

```javascript
    BleachCSS.start(options);
```

#### Options

##### key
**REQUIRED**
Identifier for your application.

##### url
URL of the endpoint to call when sending the data collected by the probe.
Defaults to BleachCSS server.

##### throttle
How many milli-seconds the Probe is going to wait before running its detection logic. Usefull if you notice that Probe runs too often and slow down your application.

### resume / stop

Stop or resume listening to user actions. This can be useful if the Probe is slowing down your application significantly when doing some specific operation, like JavaScript powered animations. If this occurs in your applicaion, please also open an issue on this repository or email bugs@bleachcss.com

```javascript
BleachCSS.stop();
// ...
BleachCSS.resume();
```

