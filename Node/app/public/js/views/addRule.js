$(document).ready(function () {
    var getBCId = function (name) {
        $.ajax({
            url: '/getBCId/' + name,
            type: 'GET',
            success: function (data) {
                $("#bcID").val(data);
				$("#bcID1").val(data);
            },
            error: function (jqXHR) {
                console.log(jqXHR.responseText + ' :: ', jqXHR.statusText);
            }
        });
    }
    
    var defaultSelectValue = $('select[name="mappedId"]').val();
    if (defaultSelectValue) {
        getBCId(defaultSelectValue);
    }
    
    $('select[name="mappedId"]').on('change', function () {
        getBCId(this.value);
    });
});