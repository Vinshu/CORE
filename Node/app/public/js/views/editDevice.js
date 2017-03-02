$(document).ready(function() {
    
 $('#DeviceCancel').click(function(){ window.location.href = '/devices';});

 $('#updateDevicerForm').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
           deviceHostName: {
                validators: {
                    notEmpty: {
                        message: 'The Device HostName  is required and can\'t be empty'
                    }
                }
            },
            deviceIp: {
                validators: {
                    notEmpty: {
                        message: 'The Device IP  is required and can\'t be empty'
                    }
                }
            }
        }
    });

    // Validate the form manually
    $('#validateBtn').click(function() {
        $('#updateDevicerForm').bootstrapValidator('validate');
    });
});