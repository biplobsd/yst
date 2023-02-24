# Facebook stories auto react tool

Automatically react to stories on Facebook without having to manually click on any reaction icons. This Chrome extension can help you do just that. With this extension, you can effortlessly add reactions to stories without any extra effort.

## Installation 
Get the built zip from the [release](https://github.com/biplobsd/alrsf/releases/latest) tab. Then follow the instructions in the [Load unpacked extensions](#load-unpacked-extensions) section. The ***/dist*** folder should be considered as the unpacked zip files.

## Usages 
Open the love icon from the extension panel. If you are not on the `https://www.facebook.com/stories/` page, then click the `Open stories page`.

![Options-script](https://user-images.githubusercontent.com/43641536/221245815-b7a0aa0b-c200-4357-b158-3d5e841ba4d2.png)

After the page has loaded, click the love icon from the extension panel again. Now you will see that the Open Popup button has turned green. Click the Open Popup button to open the Option popup, as shown in the screenshot below.

![Content-script](https://user-images.githubusercontent.com/43641536/221246872-5f32f298-7709-4da2-b753-af9274dd92b0.png)

Click the START button, and then point your mouse pointer to any reaction icon (like, love, care, haha, wow, sad, angry) that you want to give every story card. You can also set how many reactions you want to give to each card (default is 1).

When you want to stop reacting, simply click the stop button.

## Development

```bash
# install dependencies
npm i

# build files to `/dist` directory
# HMR for extension pages and content scripts
npm run dev
```

## Build

```bash
# build files to `/dist` directory
$ npm run build
```

## Load unpacked extensions

[Getting Started Tutorial](https://developer.chrome.com/docs/extensions/mv3/getstarted/)

1. Open the Extension Management page by navigating to `chrome://extensions`.
2. Enable Developer Mode by clicking the toggle switch next to `Developer mode`.
3. Click the `LOAD UNPACKED` button and select the `/dist` directory.

![Example](https://wd.imgix.net/image/BhuKGJaIeLNPW9ehns59NfwqKxF2/vOu7iPbaapkALed96rzN.png?auto=format&w=571)
