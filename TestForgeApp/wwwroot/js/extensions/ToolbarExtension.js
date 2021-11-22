function ToolbarExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
}

ToolbarExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ToolbarExtension.prototype.constructor = ToolbarExtension;

ToolbarExtension.prototype.load = function () {
    // Set background environment to "Infinity Pool"
    // and make sure the environment background texture is visible
    this.viewer.setLightPreset(6);
    this.viewer.setEnvMapBackground(true);

    // Ensure the model is centered
    this.viewer.fitToView();

    return true;
};

ToolbarExtension.prototype.unload = function () {
    if (this.subToolbar) {
        this.viewer.toolbar.removeControl(this.subToolbar);
        this.subToolbar = null;
    }
};

ToolbarExtension.prototype.onToolbarCreated = function (toolbar) {
    // alert('TODO: customize Viewer toolbar');

    var viewer = this.viewer;

    // Button 1
    var button1 = new Autodesk.Viewing.UI.Button('show-env-bg-button');
    button1.onClick = function (e) {
        viewer.setEnvMapBackground(true);
    };
    button1.addClass('show-env-bg-button');
    button1.setToolTip('Show Environment');

    // Button 2
    var button2 = new Autodesk.Viewing.UI.Button('hide-env-bg-button');
    button2.onClick = function (e) {
        viewer.setEnvMapBackground(false);
    };
    button2.addClass('hide-env-bg-button');
    button2.setToolTip('Hide Environment');

    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-toolbar');
    this.subToolbar.addControl(button1);
    this.subToolbar.addControl(button2);

    toolbar.addControl(this.subToolbar);
};

Autodesk.Viewing.theExtensionManager.registerExtension('ToolbarExtension', ToolbarExtension);