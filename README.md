# Dragio.js
> JS Class to work with file upload. Custom responsive forms, progress bars, drag 'n' drop function, Ctrl + V paste, image preview, ...


**Table of Contents**
- [Dragio.js demo](#demo)
- [Installing Dragio.js](#installation)
- [Using Dragio.js](#usage)
- [Browser Support](#browser-support)
- [API](#api)
 - [Dragio.js options](#dragio-options-)
- [Author](#with-heart-by)
- [License](#license)
- [Documentation](#documentation)

## Demo

[Check out the demo](https://alexkratky.github.io/Dragio.js/example.html) to see it in action (on your mobile or emulate touches on your browser).

<img src="https://i.imgur.com/V4Ngshu.png" alt="Dragio.js preview">

<img src="https://i.imgur.com/6elbl1M.png" alt="Dragio.js preview">

## Installation
Download Dragio.js and Dragio.css from [releases](https://github.com/AlexKratky/Dragio.js/releases), include them in `<head>` by entering following code:
```html
<script src="Dragio.js"></script>
<link rel="stylesheet" href="Dragio.css">
```
## Usage
```html
<html>
    <head>
        <link rel="stylesheet" href="Dragio.css">
        <script src="Dragio.js"></script>
    </head>
    <body>
       	<button onclick="dragio.open()">Upload file</button>
    </body>
    <script>
        var dragio = new Dragio({
            'ID': "dragio1",
            "URL": "http://localhost:8000/upload",
            "pasteURL": "http://localhost:8000/paste",
            "debug": true,
        });
    </script>
</html>
```



## Browser Support
Tested on:
- Chrome (Android, desktop)
- MS Edge (desktop)

## API

### Dragio(options)
Create a new instance of Dragio
* `options` (Object) - Options to customize a new instance of Dragio.
* [`options.ID`] (String) - The ID of instance.
* [`options.URL`] (String) - The URL where will be sent the AJAX request with files
* [`options.pasteURL`] (String) - The URL where will be sent the AJAX request with the image from clipboard.
* [`options.container`] (HTMLElement) - The DOM element that will have touch listeners. Default: `body`.
* [`options.animationTime`] (Number) - The opening animation time in milliseconds. Default: `300`.
* [`options.callback`] (Function) - The callback function. If it is set, then submit function will call this function.
* [`options.debug`] (Boolean) - Sets the application output via a console. Default: `false`.
* [`options.paste`] (Boolean) - Enable or disable paste. Default: `true` which means enabled paste.
* [`options.justOverlay`] (Boolean) - If it is sets to false, it will open custom file dialog with more information about upload. Default `false`

```js
var dragio = new Dragio({
  'container': document.querySelector('body'),
  'wrapper': document.getElementById('site-wrapper'),
  'canvas': document.getElementById('site-canvas'),
  'button': document.getElementById('logo'),
  'percent': 0.25,
  'area': 0.1,
  'debug': 'false',
  'closeMenuOnWidth': false,
  'disableMenuOnWidth': false,
  'size': 300,
  'animationTime': 300
});
```

### Dragio.open();
Opens the dialog.
```js
dragio.open();
```

### Dragio.close();
Closes the dialog.
```js
dragio.close();
```

### Dragio.submit();
Submits the form.
```js
dragio.submit();
```

### Dragio.displayMessage(msg, error = false);
Displays message.
```js
dragio.displayMessage("Hello world", false);
```


## Documentation
[Dragio.js documentation](https://tssoft.cz/Dragio.js)

## With :heart: by
- Alex Krátký
- E-mail: [info@alexkratky.cz](info@alexkratky.cz) 
- Web: [https://alexkratky.cz/](https://alexkratky.cz)
- Web: [https://alexkratky.com/](https://alexkratky.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details