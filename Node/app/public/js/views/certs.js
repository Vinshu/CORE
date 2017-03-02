$(document).ready(function () {
    $('.enrollCertificates').on('click', function () {
        var certsValue = $(this).find('a').attr('id');
        $('.modal-alert').modal();
        var value;
        if (certsValue == "undefined") {
            value = 'Enrollment Cert not available';
            $('.modal-alert .modal-body p').css('color', 'red');
            $('.modal-alert .modal-body p').css('font-size', '20px');
        } else {
            value = certsValue;
            $('.modal-alert .modal-body p').css('color', 'black');
            $('.modal-alert .modal-body p').css('font-size', '14px');
        }
        $('.modal-alert .modal-header h4').text('Enrollment Certificate');
        $('.modal-alert .modal-body p').css('word-break', 'break-all');
        $('.modal-alert .modal-body p').html(value);
    });
});