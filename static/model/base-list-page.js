class BaseListPage extends BasePage {

	constructor() {
		super();

		this.entity = null;

		this.filterData = {
			term: ko.observable()
		};

		this.results = ko.observableArray();
		this.more = ko.observable(false);
		this.page = 1;
	}

	async init() {
		super.init();

		if (this.entity === null) {
			alert('undefined page model entity!');
			throw 'init failed';
		}

		const url = new URL(location.href);
		const filterDataString = url.searchParams.get('filterData');
		if (filterDataString) {
			try {
				const fd = JSON.parse(atob(filterDataString));
				sjp.assign(this.filterData, fd);
			} catch (t) {
				console.warn('Unable to parse filterData');
				// ignore
			}
		} 

		let resp = await sjp.ajaxApi({
			entity: this.entity,
			proc: 'list',
			content: this.readPageSelector()
		})

		this.results(resp.results);
		this.more(resp.pagination.more);
	}

	readPageSelector() {
		return ko.toJSON({
			filterData: this.filterData,
			pagination: {
				page: this.page
			}
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