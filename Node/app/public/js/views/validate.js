$(document).ready(function(){
	console.log("came in to the validate.js");
	$('#validateSubmit').click(function(){
		if($('#validate-tf').val()){
			$('#content').remove();
			$('#content').removeClass("alert");
			$('#content').removeClass("alert-danger");
			var html = [];
			$.ajax(
				{ url: "/validation/"+$('#validate-tf').val(), 
					success: function(result){
					html += '<table class="table table-striped header-fixed table-hover table-bordered ">';
					html += '<tbody><tr> <td>Url </td>';
					html += '<td>"'+$.parseJSON(result).url+'"</td></tr>';
					html += '<tr> <td>Response </td>';
					html += '<td>"'+JSON.stringify($.parseJSON(result).response)+'"</td></tr>';
					html += '<tr> <td>Status </td>';
					html += '<td>"'+$.parseJSON(result).status+'"</td></tr>';
					html += '</tbody></table>';
					$('#content1').html(" ");
        			$('#content1').append(html);
   				}
   			});
		}else{
			console.log("came in to the else");
			$('#content').addClass("alert");
			$('#content').addClass("alert-danger");
			$('#content').text("Please enter the username");
		}
		
	});
});
