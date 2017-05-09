# BleachCSS - Probe - Reliable unused CSS Detection and Removal

BleachCSS Probe (aka the Probe) is the official browser JavaScript client for [BleachCSS](https://www.bleachcss.com).

## What does it do?

The Probe send back to the BleachCSS backend the list of selector actually in use in the application. When users are interacting with the page, the Probe will detect if new selectors are being used. As a result, BleachCSS can detect and remove unused CSS in any kind of application: static website, CMS, Single Page Application (SPA), etc using any kind of framework.

## How does it work?

The Probe activity can be divided into 5 logical group:

- **Detect the list of CSS files used on the page**. If any new file gets used during the session, it needs to be detected and processed.
- **Extract the list of selectors from the stylesheets**.
- **Detect user activity**. This should be done without conflicting with the code of the application
- **Efficiently detect used selector**. The Probe must do its job with as little overhead as possible, to not slowdown the application
- **Send a report**. Only the combination of the report send by all the different instance of the Probe run by all the visitors of an application can give an accurate and trustworthy analysis

## How to install the Probe?

```HTML
<script src="https://cdn.bleachcss.com/probe/latest.js"></script>
<script>
    BleachCSS.start({key: ' '});
</script>
```

Note: You need to generate a key on [BleachCSS](https://www.bleachcss.com) to use its server.

## API

### start

Configure and start a new instance of BleachCSS.

```javascript
    BleachCSS.start(options);
```

### resume / stop

Stop and resume listening to user actions. This can be useful if you notice that the Probe is slowing down you application significantly when doing some specific operation, like JavaScript powered animations.

```javascript
BleachCSS.stop();
// ...
BleachCSS.resume();
```


## Options

Here is a list of options you can use when calling the `start` method.

### key
**REQUIRED**
Identifier for your application.

### url
URL of the endpoint to call when sending the data collected by the probe.
Defaults to BleachCSS server.

### throttle
How many milli-seconds the Probe is going to wait before running its detection logic. Usefull if you notice that Probe runs too often and slow down your application.
