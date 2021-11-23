var viewer;
var viewerApp;

function launchViewer(urn) {
    var options = {
        env: 'AutodeskProduction',
        getAccessToken: getForgeToken,
        api: 'derivativeV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : ''),
        /*memory: {
            limit: 1024 // in MB
        }*/
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
                'Autodesk.VisualClusters',
                'Autodesk.WebXR.VR',
                'ToolbarExtension',
                'BoundingBoxExtension',
            ],
            
        };

        //viewerApp = new Autodesk.Viewing.ViewingApplication('forgeViewer');
        //viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, config3d);
        //viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

        var htmlDiv = document.getElementById('forgeViewer');
        viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config3d);
        var startedCode = viewer.start();

        if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
        }

        console.log('Initialization complete, loading a model next...');
        var documentId = 'urn:' + urn;
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
