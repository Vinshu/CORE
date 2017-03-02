$(document).ready(function() {
 $('#createRuleForm').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            ruleNumber: {
                message: 'The ruleNumber is not valid',
                validators: {
                    notEmpty: {
                        message: 'The Rule Number is required and cannot be empty'
                    },
                    remote: {
                        type: 'POST',
                        url: '/ruleNumberCheck',
                        message: 'The Rule Number is not available'
                    }
                }
            }
        }
    });

    // Validate the form manually
    $('#validateBtn').click(function() {
        $('#createRuleForm').bootstrapValidator('validate');
    });
});