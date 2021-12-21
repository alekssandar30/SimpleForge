
$(document).ready(function () {
    $('#searchProperties').click(function () {
        //var txtArea = document.getElementById("TextAreaResult");
        const searchCategoryStr = document.getElementById("searchCategoryInput").value;
        const searchStr = document.getElementById("searchInput").value.toLowerCase();

        if (searchStr.length == 0 || searchCategoryStr.length == 0) {
            return;
        }

        viewer.search(searchStr, (dbIds) => {
            const categoryArray = [];

            if (isTwoWordsCategory(searchCategoryStr)) {
                const parsedCategory = parseCategory(searchCategoryStr);
                categoryArray.push(parsedCategory);
            }
            else {
                categoryArray.push(searchCategoryStr, searchCategoryStr.toLowerCase(), searchCategoryStr.toUpperCase(), searchCategoryStr.charAt(0).toUpperCase() + searchCategoryStr.toLowerCase().substring(1), searchCategoryStr.replace(/\s+/g, ''))
            }

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

                viewer.isolate(dbIdsToSelect);
            }, (e) => {
                // error, handle here...
                console.log(e);
            }, categoryArray);
        });

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

    });

});