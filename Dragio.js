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
    this._justOverlay = options.justOverlay || false;
    
    this._totalSize = 0;
    this._uploaded = 0;
    this._uploadedOfCurrentFile = 0;

    this._init();
}


/**
 * Opens dialog
 */
Dragio.prototype.open = function() {
    document.getElementById("dragio__" + this._ID + "__overlay").style.display = "block";
    let id = this._ID;
    setTimeout(function () {
        document.getElementById("dragio__" + id + "__overlay").style.opacity = "1";
    }, 1);
    document.querySelector("body").style.overflow = "hidden";
}

/**
 * Closes dialog
 */
Dragio.prototype.close = function () {
    document.getElementById("dragio__" + this._ID + "__overlay").style.opacity = "0";
    let id = this._ID;
    setTimeout(function () {
        document.getElementById("dragio__" + id + "__overlay").style.display = "none";
    }, this._animationTime);
    document.querySelector("body").style.overflow = "auto";
}

/**
 * Submit the form and start uploading.
 * @param {(string\|object)} [text="Proccessing ..."] The message that will user see.
 * @param {(string\|null)} [image=null] The image string from paste event.
 */
Dragio.prototype.submit = function (text = "Processing ...", image = null) {
    if (image === null && this._justOverlay === false) {
        this._displayFileDialog();
        return;
    }
    document.getElementById("dragio__" + this._ID + "__icon").innerHTML = 
`<svg class="dragio__box__icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50px" height="50px" viewBox="0 0 50 50" version="1.1" fill="#000000">
  <g id="surface290580">
    <path style=" stroke:none;fill-rule:nonzero;fill:#00bfff;fill-opacity:1;" d="M 25 1.03125 L 13.542969 16.65625 L 20.832031 16.65625 L 20.832031 35.40625 L 29.167969 35.40625 L 29.167969 16.65625 L 36.457031 16.65625 Z M 49.988281 45.824219 L 0 45.824219 L 0 50 L 50 50 Z M 49.988281 45.824219 "/>
  </g>
</svg>`;


    document.getElementById("dragio__" + this._ID + "__hint").innerHTML = `<div class="meter orage" id="dragio__` + this._ID + `__progress" style="width: 300px;">
    <div style="font-size: 14px;" id="dragio__`+ this._ID + `__progress__percent">0%</div>
    <span style="width: 0%" id="dragio__`+ this._ID + `__progress__bar"></span>
</div>`;


    if(image === null) {
        //document.getElementById("dragio__" + this._ID + "__uploadForm").submit.click();
        var data = new FormData(),
            request;

        for (let i = 0; i < document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files.length; i++) {
            data.append('files[]', document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[i]);
        }
        console.log(data.get("files[]"));
        var request = new XMLHttpRequest();
        request.addEventListener('load', bind(this, function (e) {
            console.log(request);
            if (request.response.error === false) {
                window.location.href = request.response.redirectTo;
            } else {
                this.displayMessage("Failed to upload", true);
            }
        }));
        request.upload.addEventListener('progress', bind(this, function (e) {
            console.log(e);

            var percent_complete = Math.floor((e.loaded / e.total) * 100);
            console.log(e.loaded);
            this._updateProgress(percent_complete, e.total);
        }));
        request.responseType = 'json';
        request.open('post', this._URL);
        request.send(data); 
    } else {
        /*var form = '<form action="' + this._pasteURL + '" method="post" id="dragio__'+this._ID+'__pasteForm">' +
            '<input type="text" name="image" value="' + image + '" />' +
            '<input type="submit" value="Upload Image" name="submit">' +
            '</form>';
        this._container.insertAdjacentHTML('beforeend', form);
        document.getElementById("dragio__" + this._ID + "__pasteForm").submit.click();*/
        var data = new FormData(),
            request;

        data.append('image', image);

        var request = new XMLHttpRequest();
        request.addEventListener('load', bind(this, function (e) {
            if (request.response.error === false) {
                window.location.href = request.response.redirectTo;
            } else {
                this.displayMessage("Invalid screen", true);
            }
        }));
        request.upload.addEventListener('progress', bind(this, function (e) {
            console.log(e);
            var percent_complete = Math.floor((e.loaded / e.total) * 100);

            this._updateProgress(percent_complete, e.total);
        }));
        request.responseType = 'json';
        request.open('post', this._pasteURL);
        request.send(data); 
        
    }
    if(typeof text === "object") {
        document.getElementById("dragio__" + this._ID + "__info").innerHTML = "Processing ...";
    } else {
        document.getElementById("dragio__" + this._ID + "__info").innerHTML = text;
    
    }
    
}

/**
 * Displays custom file dialog with more info. This function is called from submit() function when options.justOverlay is equal to false.
 */
Dragio.prototype._displayFileDialog = function () {
    document.getElementById(`dragio__` + this._ID + `__files`).style.display = "block";
    var totalSize = 0;
    for (let i = 0; i < document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files.length; i++) {
        console.log(document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[i]);
        let f = document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[i];
        let html = `<tr role="row" style="height: 100px">
    <td role="cell">
        <img class="dragio__file-icon" src="" id="dragio__`+ this._ID + `__icon__file` + i +`">
    </td>
    <td role="cell">
        <div class="dragio__file-name" id="dragio__`+ this._ID + `__name__file` + i +`">
            `+f.name+`
        </div>
    </td>
    <td role="cell">
        <div class="dragio__file-size">
            `+this._convertBytes(f.size)+`
        </div>
    </td>
    <td role="cell" style="min-width: 33%;">
        <div class="dragio__file-progress">
            <div class="meter">
                <div style="font-size: 14px; text-align: center; color: white;" id="dragio__`+ this._ID + `__progress__percent__file`+i+`">0%</div>
                <span style="width: 0%; background: #ff00f4;" id="dragio__`+ this._ID + `__progress__bar__file` + i +`"></span>
            </div>
        </div>
    </td>
</tr>`;
        totalSize += f.size;
        this._totalSize = totalSize;
        document.getElementById(`dragio__` + this._ID + `__file__dialog`).insertAdjacentHTML('beforeend', html);
    }
    let stat = `<tr role="row" style="height: 100px">
    <td role="cell">
    </td>
    <td role="cell">
        <div class="dragio__file-name">
        </div>
    </td>
    <td role="cell">
        <div class="dragio__file-size">
            `+ this._convertBytes(totalSize) + `
        </div>
    </td>
    <td role="cell" style="min-width: 33%;">
        <div class="dragio__file-progress">
            <div class="meter">
                <div style="font-size: 14px; text-align: center; color: white;" id="dragio__`+ this._ID + `__progress__percent__files">0%</div>
                <span style="width: 0%; background: #ff00f4;" id="dragio__`+ this._ID + `__progress__bar__files"></span>
            </div>
        </div>
    </td>
</tr>`;
    document.getElementById(`dragio__` + this._ID + `__file__dialog`).insertAdjacentHTML('beforeend', stat);

    this._loadIcons(0);
    this._startUploading(0);
    document.getElementById(`dragio__` + this._ID + `__exit`).style.display = "none";
    document.getElementById(`dragio__` + this._ID + `__container`).style.display = "none";
    document.getElementById(`dragio__` + this._ID + `__files`).style.opacity = "1";
}

/**
 * Loads icons (image) of selected files. Called from _displayFileDialog()
 * @param {number} [index=0] The starting index. Should be 0.
 */
Dragio.prototype._loadIcons = function(index=0) {
    if (index >= document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files.length) {
        return;
    }
    var preview = document.getElementById(`dragio__` + this._ID + `__icon__file` + index);
    var reader = new FileReader();

    reader.addEventListener("load", bind(this, function () {
        preview.src = reader.result;
        console.log(preview);
        this._loadIcons(index+1); 
    }), false);

    if (document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[index]) {
        if (document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[index].type == "image/jpeg" || document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[index].type == "image/png") {
            reader.readAsDataURL(document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[index]);
        } else {
            this._loadIcons(index + 1); 
        }
    }
}

/**
 * Starts uploading of each file. Called from _displayFileDialog()
 * @param {number} [index=0] The starting index. Should be 0.
 */
Dragio.prototype._startUploading = function(index = 0) {
    if (index >= document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files.length) {
        return;
    }
    this._uploadedOfCurrentFile = 0;
    var data = new FormData(),
        request;

    data.append('files[]', document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files[index]);

    var request = new XMLHttpRequest();
    request.addEventListener('load', bind(this, function (e) {
        if (request.response.error === false) {
            document.getElementById(`dragio__` + this._ID + `__name__file` + index).style.color = "#00ff00";
        } else {
            document.getElementById(`dragio__` + this._ID + `__name__file` + index).style.color = "#ff0000";
        }
        if (index+1 >= document.getElementById(`dragio__` + this._ID + `__fileToUpload`).files.length) {
            setTimeout(() => {
                console.log("COMPLETED");
                window.location.href = request.response.redirectTo;                
            }, 1000);
        } else {
            this._startUploading(index + 1);
        }
    }));
    request.upload.addEventListener('progress', bind(this, function (e) {
        var percent_complete = Math.floor((e.loaded / e.total) * 100);
        this._updateProgressFile(percent_complete, index, e.loaded);
    }));
    request.responseType = 'json';
    request.open('post', this._URL);
    request.send(data); 
}

/**
 * Updates progress bar. Called from submit().
 * @param {number} val The progress in percent.
 * @param {number} total The file size.
 */
Dragio.prototype._updateProgress = function(val, total) {
    document.getElementById(`dragio__` + this._ID + `__progress__percent`).innerHTML = val + "% (" + this._convertBytes(total) + ")";
    document.getElementById(`dragio__` + this._ID + `__progress__bar`).style.width = val + "%";
}

/**
 * Updates progress bars in custom file dialog. Called from _displayFileDialog().
 * @param {number} val The progress in percent.
 * @param {number} index The file index.
 * @param {number} bytesUploaded Total size of uploaded bytes of current uploading file.
 */
Dragio.prototype._updateProgressFile = function (val, index, bytesUploaded) {
    document.getElementById(`dragio__` + this._ID + `__progress__percent__file` + index).innerHTML = val + "%";
    document.getElementById(`dragio__` + this._ID + `__progress__bar__file` + index).style.width = val + "%";
    this._uploaded += (bytesUploaded - this._uploadedOfCurrentFile);
    this._uploadedOfCurrentFile = bytesUploaded;

    var percent_complete = Math.floor((this._uploaded / this._totalSize) * 100);
    document.getElementById(`dragio__` + this._ID + `__progress__percent__files`).innerHTML = percent_complete + "%";
    document.getElementById(`dragio__` + this._ID + `__progress__bar__files`).style.width = percent_complete + "%";

}

/**
 * DragEnter Event handler. Change text to "Drop items here" & opens the dialog.
 * @param {object} e The event.
 */
Dragio.prototype._dragEnter = function(e) {
    this._log("dragEnter():");
    this._log(e);
    this.open();
    document.getElementById("dragio__" + this._ID + "__info").innerHTML = "Drop items here";
    document.getElementById("dragio__" + this._ID + "__hint").innerHTML = " ";
}

/**
 * DragExit Event handler.
 * @param {object} e The event.
 */
Dragio.prototype._dragExit = function (e) {
    this._log("dragExit():");
    this._log(e);
    e.preventDefault();
}

/**
 * DragEnd Event handler.
 * @param {object} e The event.
 */
Dragio.prototype._dragEnd = function (e) {
    this._log("dragEnd():");
    this._log(e);
    e.preventDefault();
}

/**
 * DragLeave Event handler. Closes the dialog, if the drag leaves the browser.
 * @param {object} e The event.
 */
Dragio.prototype._dragLeave = function (e) {
    this._log("dragLeave():");
    this._log(e);
    e.preventDefault();
    if (!e.clientX && !e.clientY) {
        this.close();
        document.getElementById("dragio__" + this._ID + "__info").innerHTML = `Drag 'n' drop files here or <span class="dragio__click" id="dragio__` + this._ID + `__click">click here</span>.`;
        document.getElementById("dragio__" + this._ID + "__hint").innerHTML = "Or press Ctrl + V to upload image from clipboard.";
    }
}

/**
 * DragOver Event handler.
 * @param {object} e The event.
 */
Dragio.prototype._dragOver = function (e) {
    //this._log("dragOver():", e);
    e.preventDefault();
}

/**
 * DragStart Event handler.
 * @param {object} e The event.
 */
Dragio.prototype._dragStart = function (e) {
    this._log("dragStart():");
    this._log(e);
}

/**
 * Drag Event handler.
 * @param {object} e The event.
 */
Dragio.prototype._drag = function (e) {
    this._log("drag():");
    this._log(e);
    e.preventDefault();
}

/**
 * Drop Event handler. Submit the form or call the custom options.callback
 * @param {object} e The event.
 */
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

/**
 * Paste Event handler. Opens dialog and call __convertImgToBase64().
 * @param {object} e The event.
 */
Dragio.prototype._pasteCall = function (e) {
    this.open();
    this._convertImgToBase64(e, bind(this, this._pasteSubmit));
}

/**
 * Submit form if the img is valid.
 * @param {string} img The image.
 */
Dragio.prototype._pasteSubmit = function(img) {
    if(typeof img === "undefined") {
        this.displayMessage("Invalid image.");
    } else {
        this.submit("Uploading screen ...", img);
    }
}

/**
 * Displays the message in dialog.
 * @param {string} msg The message.
 * @param {boolean} [error=false] If sets to true, the text will be red, otherwise it will be white.
 */
Dragio.prototype.displayMessage = function(msg, error = false) {
    document.getElementById("dragio__" + this._ID + "__info").innerHTML = (error ? "<span style='color: red;'>" : "") + msg + (error ? "</span>" : "");
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

/**
 * Convert image from clipboard to base64 string.
 * @param {object} pasteEvent The paste event.
 * @param {function} callback The callback function.
 * @param {string} imageFormat The format of image, e.g. image/png. By default, image/png.
 */
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
 * Converts bytes to human readable form.
 * @param {number} bytes The number of bytes that will be converted.
 * @param {boolean} [si=false] If sets to false, the function will be divide the bytes by 1024, otherwise by 1000.
 * @return {string} The converted value with unit, e.g. _convertBytes(1024) will return "1 KB"
 */
Dragio.prototype._convertBytes = function(bytes, si = false) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YE'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
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
    <div class="dragio__flex-container" id="dragio__` + this._ID + `__container">
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
    <div class="dragio__files" id="dragio__`+ this._ID + `__files">
        <div class="dragio__file">
            <table role="table">
                <tbody role="rowgroup" id="dragio__`+ this._ID + `__file__dialog">
                    
                </tbody>
            </table>
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