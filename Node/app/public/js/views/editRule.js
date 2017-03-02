$(document).ready(function() {
    $('#resourceCancel').click(function(){ window.location.href = '/rules';});
	var getBCId = function (name) {
        $.ajax({
            url: '/getBCId/' + name,
            type: 'GET',
            success: function (data) {
				console.log(data);
                $("#bcEID").val(data);
				$("#bcEID1").val(data);
            },
            error: function (jqXHR) {
                console.log(jqXHR.responseText + ' :: ', jqXHR.statusText);
            }
        });
    }
    
    var defaultSelectValue = $('select[name="mappedId"]').val();
	console.log(defaultSelectValue);
    if (defaultSelectValue) {
        getBCId(defaultSelectValue);
    }
    
    $('select[name="mappedId"]').on('change', function () {
        getBCId(this.value);
    });
});