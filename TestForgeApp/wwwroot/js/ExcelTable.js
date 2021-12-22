$(document).ready(function () {
    
    $.ajax({
        url: `/api/data/excel`,
        type: 'GET',
        success: function (data) {
            tableRows = `<h5 style="font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">Lines from excel:<h5>`;
            for (let i = 0; i < data.length; i++) {
                tableRows += `
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Line number</th>
                                <th>Width</th>
                                <th>Height</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="padding: .3rem;" id="line">
                                <td>${data[i].lineNumber}</td>
                                <td>${data[i].width}</td>
                                <td>${data[i].height}</td>
                                <td>${data[i].price}</td>
                            </tr>
                        <tbody>
                    <table>
                `
            }
            $('#linesFromDb').html(tableRows);

        },
        error: function () {
            alert('Error');
        }
    });

    
});


$(document).ready(function () {
    $('#linesFromDb').on('click', 'line', function (e) {
        alert('kliik');
    });
});