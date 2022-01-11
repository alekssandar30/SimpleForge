$(document).ready(function () {
    
    $.ajax({
        url: `/api/data/excel`,
        type: 'GET',
        success: function (data) {
            content = '';
            tableRows = `<h5 style="font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;">Lines from excel:<h5>`;
            
            for (let i = 0; i < data.length; i++) {
                content += `
                   
                    <tbody>
                        <tr style="padding: .3rem;" class="zg_line" id="line">
                            <td>${data[i].lineNumber}</td>
                            <td>${data[i].width}</td>
                            <td>${data[i].height}</td>
                            <td>${data[i].price}</td>
                        </tr>
                    <tbody>
                `
            }

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
                    ${content}
                </table>

            `
            $('#linesFromDb').html(tableRows);

        },
        error: function () {
            alert('Error');
        }
    });

});


$(document).ready(function () {
    $('#line').click(function (e) {
        alert('klik ' + e);
    })
});