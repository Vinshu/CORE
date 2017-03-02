$(document).ready(function() {
    
 $('#resourceCancel').click(function(){ window.location.href = '/resources';});

 $('#updateResourceForm').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            resourceHostName: {
                validators: {
                    notEmpty: {
                        message: 'The Resource HostName  is required and can\'t be empty'
                    }
                }
            },
            resourceIp: {
                validators: {
                    notEmpty: {
                        message: 'The Resource IP  is required and can\'t be empty'
                    }
                }
            }
        }
    });

    // Validate the form manually
    $('#validateBtn').click(function() {
        $('#updateResourceForm').bootstrapValidator('validate');
    });
});