const DEF_LOADING_MSG = '';

let sjp = {
	assign: function (target, source) {
		if (source) {
			for (let key in source) {
				if (target[key]) {
					if (ko.isWriteableObservable(target[key])) {
						target[key](source[key]);
					}
				}
			}
		}
	},

	toJSON: function (target) {
		let js = ko.toJS(target);
		return JSON.stringify(js, (key, value) => {
			// console.log(key + ' : ' + value + ' < ' + typeof value);
			// if (value instanceof Date) {
			// 	console.log('is date');
			// 	return '123';
			// }

			return value;
		});
	},

	gotoPage: function (url, paramObject) {
		var res = url;
		if (paramObject) {
			res = res + '?' + $.param(paramObject);
		}

		window.location.href = res;
	},

	replacePage: function (url, paramObject) {
		var res = url;
		if (paramObject) {
			res = res + '?' + $.param(paramObject);
		}

		window.location.replace(res);
	},

	openPage: function (url, paramObject) {
		var res = url;
		if (paramObject) {
			res = res + '?' + $.param(paramObject);
		}

		window.open(res);
	},

	refreshPage: function () {
		window.location.reload();
	},

	getOrigin: function () {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname
				+ (window.location.port ? ':' + window.location.port : '');
		}

		return window.location.origin;
	},

	getUrl: function (path, paramObject) {
		var res = vns.getOrigin() + path;
		if (paramObject) {
			res = res + '?' + $.param(paramObject);
		}
		return res;
	},

	getCurrentUrlParam: function () {
		return new URLSearchParams(window.location.search.slice(1));
	},

	today: function () {
		return moment().format('YYYY-MM-DD');
	},

	now: function () {
		return moment().format('YYYY-MM-DD HH:mm:ss');
	},

	emailRef: function (email) {
		var str = ko.unwrap(email);
		return 'mailto:' + str;
	},

	phoneRef: function (phone) {
		var str = ko.unwrap(phone);
		return 'tel:' + str;
	},

	camelCaseToDash(str) {
		return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
	},

	formatRp: function (value) {
		return 'Rp ' + numeral(ko.unwrap(value)).format('0,0');
	},

	formatOwing: function (value) {
		if (value == 0) {
			return 'Lunas';
		} else {
			return 'Kurang ' + sjp.formatRp(value);
		}
	},

	formatYesNo: function (value) {
		return value ? 'Ya' : 'Tidak';
	},

	formatOutstanding: function (value) {
		return value ? 'Belum Lunas' : 'Lunas';
	},

	asBoolean: function (value) {
		if (typeof value === 'boolean') {
			return value;
		}

		if (typeof value === 'string') {
			if (value == 'true') {
				return true;
			} else if (value == 'false') {
				return false;
			} else {
				return null;
			}
		}

		if (typeof value == 'number') {
			return value == 1;
		}

		return !!value;
	},

	asInputValue: function (value) {
		if (typeof value === 'boolean') {
			return value ? 'true' : 'false';
		}

		return value;
	},

	filterDeleted: function (arr) {
		const result = [];

		arr = ko.unwrap(arr);
		for (let index = 0; index < arr.length; index++) {
			const element = arr[index];
			if (element._status !== 'delete') {
				result.push(element);
			}
		}

		return result;
	},

	detailItemDesc: function (detail) {
		return `${detail.quantity} x ${detail.item.name}`;
	},

	detailAmountSum: function (detailItem) {
		const list = ko.unwrap(detailItem);

		let result = numeral();
		if (Array.isArray(list)) {
			for (let index = 0; index < list.length; index++) {
				const det = list[index];
				if (det._status !== 'delete') {
					if (det.amount !== undefined) {
						result.add(det.amount);
					} else if (det.quantity !== undefined && det.price !== undefined) {
						result.add(det.quantity * det.price);
					}
				}
			}
		}

		return result.value();
	},

	isObject: function (o) {
		return o instanceof Object && o.constructor === Object;
	},

	isArray: function (o) {
		return Array.isArray(o);
	},

	isBlank: function (val) {
		if (val === undefined || val === null || val === '') {
			return true;
		}

		if (typeof val === 'string') {
			if (val.trim() === '') {
				return true;
			}
		}

		return false;
	},

	animateScrollToTop: function () {
		$('html, body').animate({
			scrollTop: 0,
			scrollLeft: 0
		});
	},

	animateScrollIntoView: function (elementId) {
		$el = $('#' + elementId);

		// $el[0].scrollIntoView(false);

		var offset = $el.offset();
		offset.top -= 100;

		$('html, body').animate({
			scrollTop: offset.top,
			scrollLeft: offset.left
		});
	},

	showError: function (message, raise) {
		console.error(message);
		alert(message);

		if (raise !== false) {
			throw message;
		};
	},

	showPageBody: function () {
		sjp.hidePageLoading();
		$('main').show();
	},

	showPageLoading: function () {
		let el = $('#page-loadmask').show();
		el.show();
	},

	hidePageLoading: function () {
		let el = $('#page-loadmask');
		el.hide();
	},

	showWindowLoading: function () {
		sjp.hidePageLoading();
		let el = $('#window-loadmask');
		el.show();
	},

	hideWindowLoading: function () {
		setTimeout(() => {
			let el = $('#window-loadmask');
			el.hide();
		}, 300);
	},

	_ajax: async function (url, method, parameter, useLoadingMask) {
		return new Promise(function (resolve, reject) {
			if (useLoadingMask === undefined) {
				useLoadingMask = true;
			}

			if (useLoadingMask) {
				sjp.showWindowLoading();
			}

			var config = {
				method: method,
				dataType: 'json',
				data: parameter
			};

			if (parameter instanceof FormData) {
				config.contentType = false;
				config.processData = false;
			}

			config.complete = function (xhr) {
				if (useLoadingMask) {
					sjp.hideWindowLoading();
				}
			};

			config.success = function (data, textStatus, xhr) {
				resolve(data);
			}

			config.error = function (xhr, textStatus, errorThrown) {
				alert('There was a problem connecting to the server, please try again..');
				reject(errorThrown);
			};

			$.ajax(url, config);
		});
	},

	ajaxGet: async function (url, parameter, useLoadingMask) {
		console.log('ajaxGet');
		return await sjp._ajax(url, 'GET', parameter, useLoadingMask);
	},

	ajaxPost: async function (url, parameter, useLoadingMask) {
		return await sjp._ajax(url, 'POST', parameter, useLoadingMask);
	},

	ajaxApi: async function (parameter, useLoadingMask) {
		const resp = await sjp.ajaxPost('/api', parameter, useLoadingMask);
		if (resp.code === 200) {
			// console.trace(resp.result);
			return resp.result;
		} else {
			console.error(resp);
			throw resp.message
		};
	},

	asPostParam: function (inputData) {
		const js = ko.toJS(inputData);
		if (js.id == null) {
			delete js.id;
		}

		return JSON.stringify(js);
	},

	respMessage: function (data) {
		if (typeof data === 'string') {
			return data;
		}

		if (data.message) {
			if (data.message.code) {
				return data.message.code;
			} else {
				return data.message;
			}
		} else {
			return JSON.stringify(data);
		}
	},

	showToast: function (message) {
		const el = document.getElementById('toast')
		el.textContent = message;
		el.className = 'show';
		setTimeout(() => {
			el.className = el.className.replace('show', '');
		}, 3000);
	}
}

// LIBRAY INIT

moment.fn.toJSON = function () {
	const hour = this.hour();
	const min = this.minute();
	const sec = this.second();
	const ms = this.millisecond();

	if (hour === 0 && min === 0 && sec === 0 && ms === 0) {
		return this.format('YYYY-MM-DD');
	} else {
		return this.format('YYYY-MM-DD HH:mm:ss');
	}
}
moment.locale('id');

$.fn.datepicker.dates['id'] = {
	days: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
	daysShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
	daysMin: ["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"],
	months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
	monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
	today: "Hari ini",
	clear: "Clear",
	format: "d MMMM yyyy",
	titleFormat: "MM yyyy",
	weekStart: 1
};

ko.bindingHandlers.textName = {
	'init': function () {
		return {
			'controlsDescendantBindings': true
		};
	},
	'update': function (element, valueAccessor) {
		var value = ko.unwrap(valueAccessor());
		if (value && value.name) {
			ko.utils.setTextContent(element, value.name);
		} else {
			ko.utils.setTextContent(element, '');
		}
	}
};

ko.bindingHandlers.datepicker = {
	init: function (element, valueAccessor, allBindingsAccessor) {

		var defOpt = {
			language: 'id',
			autoclose: true,
			todayHighlight: true,
			format: {
				toDisplay: function (date, format, language) {
					return moment(date).format('D MMMM YYYY');
				},
				toValue: function (date, format, language) {
					return moment(date).toDate();
				}
			}
		}
		var opt = $.extend({}, defOpt, allBindingsAccessor().datepickerOptions);

		$(element).datepicker(opt);

		ko.utils.registerEventHandler(element, "changeDate", function (event) {
			var value = valueAccessor();
			if (ko.isObservable(value)) {
				value(moment(event.date));
			}
		});
	},
	update: function (element, valueAccessor) {
		var widget = $(element).data("datepicker");
		if (widget) {
			var value = ko.unwrap(valueAccessor());
			if (value) {
				$(element).datepicker('setDate', moment(value).toDate());
			}

		}
	}
};

ko.bindingHandlers.select2 = {
	init: function (el, valueAccessor, allBindingsAccessor, viewModel) {
		ko.utils.domNodeDisposal.addDisposeCallback(el, function () {
			$(el).select2('destroy');
		});

		var allBindings = allBindingsAccessor();
		var select2 = ko.utils.unwrapObservable(allBindings.select2);

		$(el).select2(select2);
	},
	update: function (el, valueAccessor, allBindingsAccessor, viewModel) {
		var allBindings = allBindingsAccessor();

		if ("value" in allBindings) {
			if ((allBindings.select2.multiple || el.multiple) && allBindings.value().constructor != Array) {
				$(el).val(allBindings.value().split(',')).trigger('change');
			}
			else {
				$(el).val(allBindings.value()).trigger('change');
			}
		} else if ("selectedOptions" in allBindings) {
			var converted = [];
			var textAccessor = function (value) {
				return value;
			};
			if ("optionsText" in allBindings) {
				textAccessor = function (value) {
					var valueAccessor = function (item) { return item; }
					if ("optionsValue" in allBindings) {
						valueAccessor = function (item) { return item[allBindings.optionsValue]; }
					}
					var items = $.grep(allBindings.options(), function (e) { return valueAccessor(e) == value });
					if (items.length == 0 || items.length > 1) {
						return "UNKNOWN";
					}
					return items[0][allBindings.optionsText];
				}
			}
			$.each(allBindings.selectedOptions(), function (key, value) {
				converted.push({ id: value, text: textAccessor(value) });
			});
			$(el).select2("data", converted);
		}
		$(el).trigger("change");
	}
};

ko.bindingHandlers.autoNumeric = {
	init: function (el, valueAccessor, bindingsAccessor, viewModel) {
		let bindings = bindingsAccessor();
		let value = valueAccessor();

		const cfg = {
			digitGroupSeparator: '.',
			decimalCharacter: ',',
			decimalCharacterAlternative: '.',
			decimalPlaces: 0,
			minimumValue: '0'
		}

		let an = new AutoNumeric(el, cfg);
		el.oninput = function (e) {
			value(an.get());
		}
	},
	update: function (el, valueAccessor, bindingsAccessor, viewModel) {
		let value = ko.unwrap(valueAccessor());
		AutoNumeric.getAutoNumericElement(el).set(value);
	}
};

ko.bindingHandlers.onReturnKey = {
	init: function (element, valueAccessor, allBindings, viewModel) {
		var callback = valueAccessor();
		$(element).keypress(function (event) {
			var keyCode = (event.which ? event.which : event.keyCode);
			if (keyCode === 13) {
				callback.call(viewModel);
				return false;
			}
			return true;
		});
	}
};

