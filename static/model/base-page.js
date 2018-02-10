class BasePage {

	async init() {

	}

	async beforeBind() {

	}

	async afterBind() {

	}

	async afterShow() {

	}

	focusOnInput() {
		setTimeout(() => {
			var $el = $('input').first();
			if ($el.length > 0) {
				$el[0].focus()
			}
		}, 300);
	}
}