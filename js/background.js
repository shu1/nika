chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('chrome.html', {
		'outerBounds': {
			'width': 1024,
			'height': 768
		}
	});
});
