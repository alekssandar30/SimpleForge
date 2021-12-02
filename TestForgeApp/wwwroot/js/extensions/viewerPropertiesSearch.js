function viewerGetProperties(viewer, outputTextArea) {

    // Callback for view.getProperties() on success. 
    function propCallback(data) {

        // Check if we got properties. 
        if ((data.properties == null) || (data.properties.length == 0)) {
            outputTextArea.value = "no properties";
            return;
        }

        // Iterate over properties and put together 
        // a list of property's name/value pairs to diplay. 
        var str = "";
        var length = data.properties.length;

        for (var i = 0; i < length; i++) {
            var obj = data.properties[i];
            str += obj.displayName + ": " + obj.displayValue + "\n";
        }

        outputTextArea.value = str;
    }

    function propErrorCallback(data) {
        outputTextArea.value = "error in getProperties().";
    }

    //----------------------------------------
    // Main - Properties 
    //---------------------

    if (viewer.getSelection().length > 0) {
        var objSelected = viewer.getSelection()[0];
        viewer.getProperties(objSelected, propCallback, propErrorCallback);
    }
    else {
        outputTextArea.value = "Please select one element to show properties.";
    }
}


function viewerSearch(viewer, searchStr, outputTextArea) {

    // Callback for _viewer.search() on success. 
    function searchCallback(ids) {
        if (ids.length > 0) {
            viewer.isolate(ids);
            outputTextArea.value = ids;
        }
        else {
            outputTextArea.value = "nothing found.";
        }
    }

    // Callback for _viewer.search() on error. 
    function searchErrorCallback() {
        outputTextArea.value = "error in search().";
    }

    outputTextArea.value = 'wow searchovao si ' + searchStr;
    viewer.model.search(searchStr, dbids => viewer.isolate(dbids), console.error, ["Geometry"], { searchHidden: true })

    //---------------------------------------
    // Main - Search 
    //-----------------

    viewer.clearSelection();
    viewer.search(searchStr, searchCallback, searchErrorCallback);

}