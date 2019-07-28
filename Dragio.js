/**
 * @name Dragio.js
 * @version v0.1 (27-07-2019)[dd-mm-yyyy]
 * @link https://alexkratky.cz/                 Author website
 * @link https://tssoft.cz/Dragio.js             Documentation
 * @link https://github.com/AlexKratky/Dragio.js Github Repository
 * @author Alex Kratky <info@alexkratky.cz>
 * @copyright Copyright (c) 2019 Alex Kratky
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @description JS library to work with dran 'n' drop events.
 */

/**
 * Creates instance of Dragio with specific options.
 * @param {object} options See the documentation for all available options.
 */
function Dragio(options) {
    options = options || {};
    this._ID = options.ID; //e.g. modal1
    this._URL = options.URL; //e.g. http://localhost:8000/upload
    this._pasteURL = options.pasteURL || options.URL; //e.g. http://localhost:8000/upload-paste
    this._container = options.container || document.querySelector('body');
    this._animationTime = options.animationTime || 300;
    this._callback = options.callback || null;
    this._debug = options.debug || false;
    this._paste = options.paste || true;
    
    this._init();
}

Dragio.prototype.open = function() {
    document.getElementById("dragio__" + this._ID + "__overlay").style.display = "block";
    let id = this._ID;
    setTimeout(function () {
        document.getElementById("dragio__" + id + "__overlay").style.opacity = "1";
    }, 1);
    document.querySelector("body").style.overflow = "hidden";
}

Dragio.prototype.close = function () {
    document.getElementById("dragio__" + this._ID + "__overlay").style.opacity = "0";
    let id = this._ID;
    setTimeout(function () {
        document.getElementById("dragio__" + id + "__overlay").style.display = "none";
    }, this._animationTime);
    document.querySelector("body").style.overflow = "auto";
}

Dragio.prototype.submit = function (text = "Processing ...", image = null) {
    document.getElementById("dragio__" + this._ID + "__icon").innerHTML = 
`<svg class="dragio__box__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 50 50" version="1.1" fill="#000000">
  <g id="surface290580">
    <path style=" stroke:none;fill-rule:nonzero;fill:#00bfff;fill-opacity:1;" d="M 25 1.03125 L 13.542969 16.65625 L 20.832031 16.65625 L 20.832031 35.40625 L 29.167969 35.40625 L 29.167969 16.65625 L 36.457031 16.65625 Z M 49.988281 45.824219 L 0 45.824219 L 0 50 L 50 50 Z M 49.988281 45.824219 "/>
  </g>
</svg>`;
    if(image === null) {
        document.getElementById("dragio__" + this._ID + "__uploadForm").submit.click();
    } else {
        var form = '<form action="' + this._pasteURL + '" method="post" id="dragio__'+this._ID+'__pasteForm">' +
            '<input type="text" name="image" value="' + image + '" />' +
            '<input type="submit" value="Upload Image" name="submit">' +
            '</form>';
        this._container.insertAdjacentHTML('beforeend', form);
        document.getElementById("dragio__" + this._ID + "__pasteForm").submit.click();
        
    }
    if(typeof text === "object") {
        document.getElementById("dragio__" + this._ID + "__info").innerHTML = "Processing ...";
    } else {
        document.getElementById("dragio__" + this._ID + "__info").innerHTML = text;
    }
    document.getElementById("dragio__" + this._ID + "__hint").innerHTML = " ";
}

Dragio.prototype._dragEnter = function(e) {
    this._log("dragEnter():");
    this._log(e);
    this.open();
}

Dragio.prototype._dragExit = function (e) {
    this._log("dragExit():");
    this._log(e);
    e.preventDefault();
}

Dragio.prototype._dragEnd = function (e) {
    this._log("dragEnd():");
    this._log(e);
    e.preventDefault();
}

Dragio.prototype._dragLeave = function (e) {
    this._log("dragLeave():");
    this._log(e);
    e.preventDefault();
    if (!e.clientX && !e.clientY) {
        this.close();
    }
}

Dragio.prototype._dragOver = function (e) {
    //this._log("dragOver():", e);
    e.preventDefault();
}

Dragio.prototype._dragStart = function (e) {
    this._log("dragStart():");
    this._log(e);
}

Dragio.prototype._drag = function (e) {
    this._log("drag():");
    this._log(e);
    e.preventDefault();
}

Dragio.prototype._drop = function (e) {
    e.preventDefault();
    this._log("drop():");
    this._log(e);
    this._log(e.dataTransfer.files[0].name);
    document.getElementById("dragio__" + this._ID + "__fileToUpload").files = e.dataTransfer.files;
    if(this._callback === null) {
        this.submit();
    } else {
        this._callback(e, this._ID);
    }
}

Dragio.prototype._pasteCall = function (e) {
    this._convertImgToBase64(e, bind(this, this._pasteSubmit));
}

Dragio.prototype._pasteSubmit = function(img) {
    if(typeof img === "undefined") {
        this.displayMessage("Invalid image.");
    } else {
        this.submit("Uploading screen ...", img);
    }
}

Dragio.prototype.displayMessage = function(msg) {
    document.getElementById("dragio__" + this._ID + "__info").innerHTML = msg;
    document.getElementById("dragio__" + this._ID + "__hint").innerHTML = " ";
    let id = this._ID;
    setTimeout(function() {
        document.getElementById("dragio__" + id + "__info").innerHTML = `Drag 'n' drop files here or <span class="dragio__click" id="dragio__` + id + `__click">click here</span>.`;
        document.getElementById("dragio__" + id + "__hint").innerHTML = "Or press Ctrl + V to upload image from clipboard.";
        document.getElementById("dragio__" + id + "__click").addEventListener("click",function () {
            document.getElementById("dragio__" + id + "__fileToUpload").click();
        });
    }, 5000);
}

Dragio.prototype._convertImgToBase64 = function(pasteEvent, callback, imageFormat) {

    if (pasteEvent.clipboardData == false) {
        if (typeof (callback) == "function") {
            callback(undefined);
        }
    };

    var items = pasteEvent.clipboardData.items;

    if (items == undefined) {
        if (typeof (callback) == "function") {
            callback(undefined);
        }
    };

    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") == -1) continue;
        var blob = items[i].getAsFile();

        var mycanvas = document.createElement("canvas");
        var ctx = mycanvas.getContext('2d');

        var img = new Image();

        img.onload = function () {
            mycanvas.width = this.width;
            mycanvas.height = this.height;

            ctx.drawImage(img, 0, 0);

            if (typeof (callback) == "function") {
                callback(mycanvas.toDataURL(
                    (imageFormat || "image/png")
                ));
            }
        };

        var URLObj = window.URL || window.webkitURL;

        img.src = URLObj.createObjectURL(blob);
    }
}

/**
 * Initializes Dragio.
 */
Dragio.prototype._init = function () {
    this._container.addEventListener("dragenter", bind(this, this._dragEnter), false);
    this._container.addEventListener("dragexit", bind(this, this._dragExit), false);
    this._container.addEventListener("dragend", bind(this, this._dragEnd), false);
    this._container.addEventListener("dragleave", bind(this, this._dragLeave), false);
    this._container.addEventListener("dragover", bind(this, this._dragOver), false);
    //this._container.addEventListener("dragstart", bind(this, this._dragStart), false);
    //this._container.addEventListener("drag", bind(this, this._drag), false);
    this._container.addEventListener("drop", bind(this, this._drop), false);

    
    var html = 
`<div class="dragio__overlay" id="dragio__` + this._ID + `__overlay" style="display:none; opacity: 0;">
    <div class="dragio__exit" id="dragio__` + this._ID + `__exit">&times;</div>
    <div class="dragio__flex-container">
        <div class="dragio__row">
            <div class="dragio__flex-item" id="dragio__` + this._ID + `__icon">
                <svg class="dragio__box__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 50 50" version="1.1" fill="#000000">
                    <g id="surface287725">
                        <path style=" stroke:none;fill-rule:nonzero;fill:#00bfff;fill-opacity:1;" d="M 25 36.457031 L 36.457031 20.832031 L 29.167969 20.832031 L 29.167969 0 L 20.832031 0 L 20.832031 20.832031 L 13.542969 20.832031 Z M 49.988281 45.832031 L 0 45.832031 L 0 50.011719 L 50 50.011719 Z M 49.988281 45.832031 "/>
                    </g>
                </svg>
            </div>
            <div class="dragio__flex-item" id="dragio__` + this._ID + `__info">
                Drag 'n' drop files here or <span class="dragio__click" id="dragio__` + this._ID + `__click">click here</span>.
            </div>
            <div class="dragio__flex-item" id="dragio__` + this._ID + `__hint">
                Or press Ctrl + V to upload image from clipboard.
            </div>
        </div>
    </div>
    <form action="`+this._URL+`" method="post" enctype="multipart/form-data" style="display: none;" id="dragio__` + this._ID + `__uploadForm">
        <input type="file" name="fileToUpload[]" id="dragio__` + this._ID + `__fileToUpload" multiple>
        <input type="submit" value="Upload files" name="submit">
    </form>
</div>`;

    this._container.insertAdjacentHTML('beforeend', html);
    document.getElementById("dragio__" + this._ID + "__click").addEventListener("click", bind(this, function () {
        this._log("dragio__" + this._ID + "__fileToUpload");
        document.getElementById("dragio__" + this._ID + "__fileToUpload").click();
    }));
    document.getElementById("dragio__" + this._ID + "__exit").addEventListener("click", bind(this, this.close));
    document.getElementById(`dragio__` + this._ID + `__fileToUpload`).addEventListener("change", bind(this, this.submit));
    window.addEventListener("paste", bind(this, this._pasteCall), false);
}

/**
 * If debug is enabled, it calls console.log() with the text passed from the argument.
 * @param {string} t Text
 */
Dragio.prototype._log = function (t) {
    if (this._debug) {
        console.log(t);
    }
}

/**
 * Sets scope to variable.
 * @param {object} scope 
 * @param {function} fn 
 */
function bind(scope, fn) {
    return function () {
        return fn.apply(scope, arguments);
    }
}