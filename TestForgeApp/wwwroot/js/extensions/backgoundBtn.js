function BackgroundBtn(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);

    // Preserve "this" reference when methods are invoked by event handlers.
    this.lockViewport = this.lockViewport.bind(this);
    this.unlockViewport = this.unlockViewport.bind(this);
}

BackgroundBtn.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
BackgroundBtn.prototype.constructor = BackgroundBtn;

BackgroundBtn.prototype.lockViewport = function () {
    this.viewer.setNavigationLock(true);
};

BackgroundBtn.prototype.unlockViewport = function () {
    this.viewer.setNavigationLock(false);
};

BackgroundBtn.prototype.load = function () {
    this._lockBtn = document.getElementById('"BackgroundBtnLock');
    this._lockBtn.addEventListener('click', this.lockViewport);

    this._unlockBtn = document.getElementById('BackgroundBtnUnlock');
    this._unlockBtn.addEventListener('click', this.unlockViewport);

    return true;
};

BackgroundBtn.prototype.unload = function () {
    if (this._lockBtn) {
        this._lockBtn.removeEventListener('click', this.lockViewport);
        this._lockBtn = null;
    }

    if (this._unlockBtn) {
        this._unlockBtn.removeEventListener('click', this.unlockViewport);
        this._unlockBtn = null;
    }

    return true;
};

ToolbarExtension.prototype.onToolbarCreated = function (toolbar) {

    alert('TODO: customize Viewer toolbar');
};

Autodesk.Viewing.theExtensionManager.registerExtension('BackgroundBtn', BackgroundBtn);


/*
 An extension will successfully get loaded into The Viewer’s lifecycle only if load() returns true. Likewise, an extension will get successfully unloaded if unload() returns true.
 */