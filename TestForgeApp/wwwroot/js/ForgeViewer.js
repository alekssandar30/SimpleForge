var viewer;

function launchViewer(urn) {
    var options = {
        env: 'AutodeskProduction',
        // env: 'MD20Prod' + (atob(urn.replace('urn:', '').replace('_', '/')).indexOf('emea') > -1 ? 'EU' : 'US'),
        // api: 'D3S',
        getAccessToken: getForgeToken,
        api: 'derivativeV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : ''),
        //api: 'streamingV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : '')
        
    };

    Autodesk.Viewing.Initializer(options, function onInitialized() {
        // var randomId = makeid(36);
        var documentId = 'urn:' + urn;
        console.log(documentId);
        var config3d = {
            loaderExtensions: { svf: "Autodesk.MemoryLimited" },
            extensions: [
                'Autodesk.DocumentBrowser',
                'Autodesk.Viewing.MarkupsCore',
                'Autodesk.Viewing.MarkupsGui',
                'LabelsExtension',
            ],
            
        };

        var htmlDiv = document.getElementById('forgeViewer');

        viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config3d);
 
        viewer.setTheme("light-theme");
        //const profileSettings = Autodesk.Viewing.ProfileSettings.Navis;
        //const profile = new Autodesk.Viewing.Profile(profileSettings);
        //viewer.setProfile(profile);
        

        var startedCode = viewer.start();

        if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
        }

        console.log('Initialization complete, loading a model next...');

        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, e => onLoadFinished());

    });
}


function onDocumentLoadSuccess(doc) {
    //var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
    var viewables = doc.getRoot().getDefaultGeometry();
    doc.downloadAecModelData();
    viewer.fitToView();
    //var viewables = viewerApp.bubble.search({ 'type': 'geometry' });

    //var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
    viewer.loadDocumentNode(doc, viewables).then(i => {
        // any additional action here?
    });

}

function onLoadFinished() {

    // improve performance, by turning off FX
    // window.devicePixelRatio = 1.0;
    viewer.impl.setOptimizeNavigation(true); // turn off SAO when camera moves
    viewer.setQualityLevel(true, true); // activate ambient occlusion and FXAA
    viewer.impl.toggleEnvMapBackground(false); // reduce the effort on your fragment shader.

    // reduce draw calls
    viewer.impl.toggleGroundShadow(false); // turn off that ground shadow render pass

    // create our floating text labels
    let labels = [
        { dbid: 2467, id: "cylinder" }, { 2525: 3, id: "cylinder" }, { 4208: 4, id: "rm" },
    ];

    const ext = viewer.getExtension("LabelsExtension");
    ext.initLabels(labels);
    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, e => ext.onClickAddLabel(e));
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getForgeToken(callback) {
    fetch('/api/forge/oauth/token').then(res => {
        res.json().then(data => {
            callback(data.access_token, data.expires_in);
        });
    });
}