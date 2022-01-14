var viewer;
var markupSVG = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" baseProfile="full" style="position:absolute; left:0; top:0; transform:scale(1,-1); -ms-transform:scale(1,-1); -webkit-transform:scale(1,-1); -moz-transform:scale(1,-1); -o-transform:scale(1,-1); transformOrigin:0, 0; -ms-transformOrigin:0, 0; -webkit-transformOrigin:0, 0; -moz-transformOrigin:0, 0; -o-transformOrigin:0, 0; " width="510" height="960" viewBox="-531.25 -1000 1062.5 2000" cursor="crosshair" pointer-events="painted"><metadata><markup_document xmlns="http://www.w3.org/1999/xhtml" data-model-version="4"></markup_document></metadata><g cursor="inherit" pointer-events="stroke"><metadata><markup_element xmlns="http://www.w3.org/1999/xhtml" stroke-width="10.416666666666629" stroke-linejoin="miter" stroke-color="#ff0000" stroke-opacity="1" fill-color="#ff0000" fill-opacity="0" type="cloud" position="-48.958333333333336 307.2916666666667" size="418.75 377.08333333333337" rotation="0"></markup_element></metadata><path id="markup" d="M -183.75000000000003 -142.59259259259264 a 20.416666666666668 20.37037037037037 0 1 1 20.416666666666668 -20.37037037037037 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 c 2.0416666666666674 -23.819444444444446 38.79166666666668 -23.819444444444446 40.83333333333334 0 a 20.416666666666668 20.37037037037037 0 1 1 20.416666666666668 20.37037037037037 c 23.76543209876543 2.037037037037037 23.76543209876543 38.7037037037037 0 40.74074074074074 c 23.76543209876543 2.037037037037037 23.76543209876543 38.7037037037037 0 40.74074074074074 c 23.76543209876543 2.037037037037037 23.76543209876543 38.7037037037037 0 40.74074074074074 c 23.76543209876543 2.037037037037037 23.76543209876543 38.7037037037037 0 40.74074074074074 c 23.76543209876543 2.037037037037037 23.76543209876543 38.7037037037037 0 40.74074074074074 c 23.76543209876543 2.037037037037037 23.76543209876543 38.7037037037037 0 40.74074074074074 c 23.76543209876543 2.037037037037037 23.76543209876543 38.7037037037037 0 40.74074074074074 a 20.416666666666668 20.37037037037037 0 1 1 -20.416666666666668 20.37037037037037 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 c -2.0416666666666674 23.819444444444446 -38.79166666666668 23.819444444444446 -40.83333333333334 0 a 20.416666666666668 20.37037037037037 0 1 1 -20.416666666666668 -20.37037037037037 c -23.76543209876543 -2.037037037037037 -23.76543209876543 -38.7037037037037 0 -40.74074074074074 c -23.76543209876543 -2.037037037037037 -23.76543209876543 -38.7037037037037 0 -40.74074074074074 c -23.76543209876543 -2.037037037037037 -23.76543209876543 -38.7037037037037 0 -40.74074074074074 c -23.76543209876543 -2.037037037037037 -23.76543209876543 -38.7037037037037 0 -40.74074074074074 c -23.76543209876543 -2.037037037037037 -23.76543209876543 -38.7037037037037 0 -40.74074074074074 c -23.76543209876543 -2.037037037037037 -23.76543209876543 -38.7037037037037 0 -40.74074074074074 c -23.76543209876543 -2.037037037037037 -23.76543209876543 -38.7037037037037 0 -40.74074074074074 z" stroke-width="10.416666666666629" stroke="rgba(255,0,0,1)" fill="none" transform="translate( -48.958333333333336 , 307.2916666666667 ) rotate( 0 )"/></g></svg>';


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
                'Autodesk.VisualClusters',
                'Autodesk.ADN.Viewing.Extension.Chart',
                //'Autodesk.Forge.Samples.VersionChanges',
                //'LabelsExtension',
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
        //viewer.loadExtension("NestedViewerExtension", { filter: ["2d"], crossSelection: true })
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

    //const ext = viewer.getExtension("LabelsExtension");
    //ext.initLabels(labels);
    //viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, e => ext.onClickAddLabel(e));
}

function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}


function getForgeToken(callback) {
    fetch('api/forge/oauth2/token').then(res => {
        if (res === undefined) {
            fetch('api/forge/oauth3/token').then(res => {
                res.json().then(data => {
                    callback(data.access_token, data.expires_in);
                });
            });
        }
        else {
            res.json().then(data => {
                callback(data.access_token, data.expires_in);
            });
        }
        
    });

   
}