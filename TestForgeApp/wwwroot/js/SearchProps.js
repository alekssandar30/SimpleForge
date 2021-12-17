
$(document).ready(function () {
    $('#searchProperties').click(function () {
        //var txtArea = document.getElementById("TextAreaResult");
        const searchCategoryStr = document.getElementById("searchCategoryInput").value.toUpperCase();
        const searchStr = document.getElementById("searchInput").value.toLowerCase();

        if (searchStr.length == 0 || searchCategoryStr.length == 0) {
            return;
        }

        //viewerSearch(viewer, searchStr);

        viewer.search(searchStr, (dbIds) => {
            // const categoryArray = ['Icon', 'Type', 'Required', 'Material', 'NAME', 'TYPE'];
            const categoryArray = [searchCategoryStr, searchCategoryStr.toLowerCase(), searchCategoryStr.charAt(0).toUpperCase() + searchCategoryStr.toLowerCase().substring(1)];
            console.log(searchStr);
            console.log(categoryArray);

            viewer.model.getBulkProperties(dbIds, categoryArray, (elements) => {
                let dbIdsToSelect = [];

                for (var i = 0; i < elements.length; i++) {
                    for (var j = 0; j < elements[i].properties.length; j++) {
                        const propertyValue = elements[i].properties[j].displayValue.toString().toLowerCase();

                        if (propertyValue.indexOf(searchStr) !== -1) {
                            dbIdsToSelect.push(elements[i].dbId);
                        }
                    }
                }

                viewer.select(dbIdsToSelect);
                //viewer.fitToView(dbIdsToSelect);
                viewer.isolate(dbIdsToSelect);
            }, (e) => {
                // error, handle here...
                console.log(e);
            }, categoryArray);
        });

    });

});