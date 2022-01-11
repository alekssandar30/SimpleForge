
$(document).ready(function () {
    $('#searchProperties').click(function () {
        //var txtArea = document.getElementById("TextAreaResult");
        const searchCategoryStr = document.getElementById("searchCategoryInput").value;
        const searchStr = document.getElementById("searchInput").value.toLowerCase();
        const searchInputs = document.getElementById("searchInputs");
        let searchWords = [];
        let dbIdsToSelect = [];

        searchInputs.children.forEach((child) => {
            const word = child.children[0].value.toLowerCase();
            searchWords.push(word);
        });
        
        const categoryArray = [];

        if (searchWords.length == 0 || searchStr.length == 0) {
            return;
        }

        // get categories
        if (isTwoWordsCategory(searchCategoryStr)) {
            const parsedCategory = parseCategory(searchCategoryStr);
            categoryArray.push(parsedCategory);
        }
        else {
            categoryArray.push(searchCategoryStr, searchCategoryStr.toLowerCase(), searchCategoryStr.toUpperCase(), searchCategoryStr.charAt(0).toUpperCase() + searchCategoryStr.toLowerCase().substring(1), searchCategoryStr.replace(/\s+/g, ''))
        }

        // multifunctional search
        if (searchWords.length > 1) {

            searchWords.forEach(word => {
                viewer.search(word, (dbIds) => {
                    viewer.model.getBulkProperties(dbIds, categoryArray, (elements) => {
                        for (var i = 0; i < elements.length; i++) {
                            for (var j = 0; j < elements[i].properties.length; j++) {
                                const propertyValue = elements[i].properties[j].displayValue.toString().toLowerCase();

                                if (propertyValue.indexOf(word) !== -1) {
                                    dbIdsToSelect.push(elements[i].dbId);
                                }
                            }
                        }

                        viewer.isolate(dbIdsToSelect);
                        viewer.select(dbIdsToSelect);
                    }, (e) => {
                        // error, handle here...
                        console.log(e);
                    }, categoryArray);
                });
            });
           
            

        }
        else {
            viewer.search(searchStr, (dbIds) => {
                viewer.model.getBulkProperties(dbIds, categoryArray, (elements) => {
                    for (var i = 0; i < elements.length; i++) {
                        for (var j = 0; j < elements[i].properties.length; j++) {
                            const propertyValue = elements[i].properties[j].displayValue.toString().toLowerCase();

                            if (propertyValue.indexOf(searchStr) !== -1) {
                                dbIdsToSelect.push(elements[i].dbId);
                            }
                        }
                    }

                    viewer.isolate(dbIdsToSelect);
                    viewer.select(dbIdsToSelect);
                }, (e) => {
                    // error, handle here...
                    console.log(e);
                }, categoryArray);
            });
        }

        // ***************************************** HELPER FUNCTIONS ********************************************

        function isTwoWordsCategory(category) {
            const words = category.split(' ');

            return words.length > 1;
        }


        function parseCategory(category) {
            const words = category.split(' ');
            const parsedWords = [];

            words.forEach((word) => {
                word = word.charAt(0).toUpperCase() + word.toLowerCase().substring(1);
                parsedWords.push(word);
            });

            return parsedWords.join(' ');
        }

        //function searchForProperty(word, _searchResult) {
        //    const results = [];

        //    viewer.search(word, (dbIds) => {
        //        viewer.model.getBulkProperties(dbIds, categoryArray, (elements) => {
        //            console.log(elements);
        //            for (var i = 0; i < elements.length; i++) {
        //                for (var j = 0; j < elements[i].properties.length; j++) {
        //                    const propertyValue = elements[i].properties[j].displayValue.toString().toLowerCase();

        //                    if (propertyValue.indexOf(word) !== -1) {
        //                        results.push(elements[i].dbId);
        //                    }
        //                }
        //            }
        //        });
        //    });

        //    _searchResult(results);

        //}

    });

});