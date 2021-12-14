var viewer;
var viewerApp;

function launchViewer(urn) {
    var options = {
        env: 'AutodeskProduction',
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
                'ToolbarExtension',
                'BoundingBoxExtension',
            ],
            
        };

        var htmlDiv = document.getElementById('forgeViewer');

        viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config3d);
        viewer.setQualityLevel(/* ambient shadows */ false, /* antialiasing */ true);
        viewer.setGroundReflection(false);
        viewer.setGhosting(true);
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

    });
}


function onDocumentLoadSuccess(doc) {
    //var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
    var viewables = doc.getRoot().getDefaultGeometry();
    //var viewables = viewerApp.bubble.search({ 'type': 'geometry' });

   
    viewer.loadDocumentNode(doc, viewables).then(i => {
        // documented loaded, any action
        console.log('************ VIEWABLES *****************')
        console.log(viewables);

    });
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