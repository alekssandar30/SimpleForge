/*function BackgroundBtn(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
}

BackgroundBtn.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
BackgroundBtn.prototype.constructor = BackgroundBtn;

MyAwesomeExtension.prototype.load = function () {
    alert('BackgroundBtn is loaded!');
    return true;
};

BackgroundBtn.prototype.unload = function () {
    alert('BackgroundBtn is now unloaded!');
    return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('BackgroundBtn', BackgroundBtn);*/


/*
 An extension will successfully get loaded into The Viewer’s lifecycle only if load() returns true. Likewise, an extension will get successfully unloaded if unload() returns true.
 */