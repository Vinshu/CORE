
$(document).ready(function(){
	
	var av = new AccountValidator();
	var sc = new SignupController();
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			return av.validateForm();
		},
		success	: function(responseText, status, xhr, $form){
			 if (status == 'success'){
				if(responseText.status == 'ok'){
					$('.modal-alert .modal-body p').html('Your account has been created with BlockChain <br>Account username is <strong>'+responseText.loginId+'</strong>. <br>Account password is <strong>'+responseText.password+'</strong>.'+
                    '<br>Please use this id as login token for further trancations. <br>Click OK to return to the login page.');
				}
				setTimeout(function () {
			 		$('.modal-alert').modal('show');
        		}, 3000);
			} 
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showInvalidEmail();
			}	
			// else if (e.responseText == 'username-taken'){
			//     av.showInvalidUserName();
			// }
		}
	});
	$('#name-tf').focus();
	
// customize the account signup form //
	$('#account-form h2').text('Signup');
	$('#account-form #sub1').text('Please tell us a little about yourself');
	$('#account-form #sub2').text('Choose your username & password');
	$('#account-form-btn1').html('Cancel');
	$('#account-form-btn2').html('Submit');
	$('#account-form-btn2').addClass('btn-primary');
	
// setup the alert that displays when an account is successfully created //

	$('.modal-alert').modal({ show:false, keyboard : false, backdrop : 'static' });
	$('.modal-alert .modal-header h4').text('Account Created!');

});