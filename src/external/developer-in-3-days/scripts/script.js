$( document ).ready(function() {
	$('[data-toggle="tooltip"]').tooltip();

	$('.js-tab-link').click(function() {
		if( $(this).hasClass('active') ){
			return;
		}
		else {
			// update tabs
			$('.js-tab-link.active').removeClass('active');
			$(this).addClass('active');

			// update panes
			var $targetPane = $($(this).attr('href'));
			
			// $targetPane.siblings().removeClass('active');
			// $targetPane.addClass('active');
			$targetPane.siblings().hide(500);
			$targetPane.show(500);
		}
	});
});

// window.document.addEventListener('DOMContentLoaded', function() {
// 	[].forEach.call(document.querySelectorAll('.js-tab-link'), function(tab) {
// 		tab.addEventListener('click', function() {
// 			if(tab.classList.contains('active')) {
// 				return;
// 			}
// 			else {
// 				// update tabs
// 				tab.parentNode.querySelectorAll('.js-tab-link.active')[0].classList.remove('active');
// 				tab.classList.add('active');

// 				// update panes
// 				var targetPane = document.querySelectorAll(tab.getAttribute('href'))[0];

// 				targetPane.parentNode.querySelectorAll('.active')[0].classList.remove('active');
// 				targetPane.classList.add('active');
// 			}
// 		});
// 	});
// });