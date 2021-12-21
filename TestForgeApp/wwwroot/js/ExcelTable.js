$(document).ready(function () {
    $('#excelData').click(function () {
        $.ajax({
            url: `/api/data/excel`,
            type: 'GET',
            success: function (data) {
                $('#linesFromDb').html(data);
            },
            error: function () {
                alert('Error');
            }
        });
    });
});