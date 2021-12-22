
$(document).ready(function () {
    $('#searchProperties').click(function () {
        //var txtArea = document.getElementById("TextAreaResult");
        const searchCategoryStr = document.getElementById("searchCategoryInput").value;
        const searchStr = document.getElementById("searchInput").value.toLowerCase();
        const categoryArray = [];
        let dbIdsToSelect = [];

        if (searchStr.length == 0 || searchCategoryStr.length == 0) {
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

        const searchWords = searchStr.split(',');

        // multifunctional search
        if (searchWords.length > 1) {
            const word1 = searchWords[0];
            const word2 = searchWords[1];

            //const results1 = searchForProperty(word1);
            //const results2 = searchForProperty(word2);

            //dbIdsToSelect.push(...results1, ...results2);

            //viewer.isolate(dbIdsToSelect);

            viewer.search(word1, (dbIds) => {
                viewer.model.getBulkProperties(dbIds, categoryArray, (elements) => {
                    for (var i = 0; i < elements.length; i++) {
                        for (var j = 0; j < elements[i].properties.length; j++) {
                            const propertyValue = elements[i].properties[j].displayValue.toString().toLowerCase();

                            if (propertyValue.indexOf(word1) !== -1) {
                                dbIdsToSelect.push(elements[i].dbId);
                            }
                        }
                    }

                    viewer.search(word2, (dbIds) => {
                        viewer.model.getBulkProperties(dbIds, categoryArray, (elements) => {
                            for (var i = 0; i < elements.length; i++) {
                                for (var j = 0; j < elements[i].properties.length; j++) {
                                    const propertyValue = elements[i].properties[j].displayValue.toString().toLowerCase();

                                    if (propertyValue.indexOf(word2) !== -1) {
                                        dbIdsToSelect.push(elements[i].dbId);
                                    }
                                }
                            }

                            viewer.isolate(dbIdsToSelect);
                        }, (e) => {
                            // error, handle here...
                            console.log(e);
                        }, categoryArray);
                    });

                    //viewer.isolate(dbIdsToSelect);
                }, (e) => {
                    // error, handle here...
                    console.log(e);
                }, categoryArray);
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

        function searchForProperty(word) {
            let results = [];

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
                });
            });

            return results;
        }

    });

});