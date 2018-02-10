class BaseViewPage extends BasePage {

	constructor() {
		super();

		this.entity = null;
		this.contentData = {};
	}

	async init() {
		super.init();

		if (this.entity === null) {
			alert('undefined page model entity!');
			throw 'init failed';
		}

		let resp = await sjp.ajaxApi({
			entity: this.entity,
			proc: 'read',
			content: this.readPageSelector()
		})

		this.contentData = resp;

	}

	readPageSelector() {
		const url = new URL(location.href);
		const id = url.searchParams.get('id');

		if (id === undefined || id === null) {
			throw 'Invalid Page View ID';
		}

		return ko.toJSON({
			id: id
		});
	}

	search() {
		document.activeElement.blur();
		sjp.showPageLoading();
		sjp.replacePage(location.pathname, {
			filterData: btoa(ko.toJSON(model.filterData))
		});
	}

	async loadMore() {
		this.page++;

		let resp = await sjp.ajaxApi({
			entity: this.entity,
			proc: 'list',
			content: this.readPageSelector()
		})

		const arr = this.results();
		for (let i = 0; i < resp.results.length; i++) {
			arr.push(resp.results[i]);
		}
		this.results.valueHasMutated();

		this.more(resp.pagination.more);
	}

	insert() {
		sjp.gotoPage(this.getInputUrl());
	}

	onClickEvent() {
		let page = this;

		return function (data) {
			sjp.gotoPage(page.getViewUrl(), {
				id: data.id
			})
		}
	}

	getInputUrl() {
		if (this.inputUrl) {
			return this.inputUrl;
		} else {
			return sjp.camelCaseToDash(this.entity) + '-input';
		}
	}

	getViewUrl() {
		if (this.viewUrl) {
			return this.viewUrl;
		} else {
			return sjp.camelCaseToDash(this.entity) + '-view';
		}
	}

}