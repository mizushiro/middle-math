(() => {

	'use strict';

	const global = 'UI';

	if (!window[global]) {
		window[global] = {};
	}
	const Global = window[global];

	const UA = navigator.userAgent.toLowerCase();
	const deviceInfo = ['android', 'iphone', 'ipod', 'ipad', 'blackberry', 'windows ce', 'windows', 'samsung', 'lg', 'mot', 'sonyericsson', 'nokia', 'opeara mini', 'opera mobi', 'webos', 'iemobile', 'kfapwi', 'rim', 'bb10'];

	Global.page = {};
	Global.data = {};
	Global.exe = {};
	Global.callback = {};
	Global.answer = {};

	Global.state = {
		isSystemModal: false,
		device: {
			info: (() => {
				for (let i = 0, len = deviceInfo.length; i < len; i++) {
					if (UA.match(deviceInfo[i]) !== null) {
						return deviceInfo[i];
					}
				}
			})(),
			width: window.innerWidth,
			height: window.innerHeight,
			ios: (/ip(ad|hone|od)/i).test(UA),
			android: (/android/i).test(UA),
			app: UA.indexOf('appname') > -1 ? true : false,
			touch: null,
			mobile: null,
			os: (navigator.appVersion).match(/(mac|win|linux)/i)
		},
		browser: {
			ie: UA.match(/(?:msie ([0-9]+)|rv:([0-9\.]+)\) like gecko)/i),
			local: (/^http:\/\//).test(location.href),
			firefox: (/firefox/i).test(UA),
			webkit: (/applewebkit/i).test(UA),
			chrome: (/chrome/i).test(UA),
			opera: (/opera/i).test(UA),
			safari: (/applewebkit/i).test(UA) && !(/chrome/i).test(UA),
			size: null
		},
		keys: {
			tab: 9,
			enter: 13,
			alt: 18,
			esc: 27,
			space: 32,
			pageup: 33,
			pagedown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		},
		scroll: {
			y: 0,
			direction: 'down'
		},
		breakPoint: [600, 905],
	};
	Global.parts = {
		scroll() {
			const el_html = document.querySelector('html');
			let last_know_scroll_position = 0;
			let ticking = false;

			const doSomething = (scroll_pos) => {
				Global.state.scroll.direction =
					Global.state.scroll.y > scroll_pos ? 'up' : Global.state.scroll.y < scroll_pos ? 'down' : '';
				Global.state.scroll.y = scroll_pos;
				el_html.dataset.direction = Global.state.scroll.direction;
			}
			window.addEventListener('scroll', (e) => {
				last_know_scroll_position = window.scrollY;

				if (!ticking) {
					window.requestAnimationFrame(() => {
						doSomething(last_know_scroll_position);
						ticking = false;
					});

					ticking = true;
				}
			});
		},
		resizeState() {
			const act = () => {
				const el_html = document.querySelector('html');
				const browser = Global.state.browser;
				const device = Global.state.device;

				device.width = window.innerWidth;
				device.height = window.innerHeight;

				device.touch = device.ios || device.android || (document.ontouchstart !== undefined && document.ontouchstart !== null);
				device.mobile = device.touch && (device.ios || device.android);
				device.os = device.os ? device.os[0] : '';
				device.os = device.os.toLowerCase();

				device.breakpoint = device.width >= Global.state.breakPoint[0] ? true : false;
				device.col = device.width >= Global.state.breakPoint[1] ? '12' : device.width > Global.state.breakPoint[0] ? '8' : '4';

				if (browser.ie) {
					browser.ie = browser.ie = parseInt(browser.ie[1] || browser.ie[2]);
					(11 > browser.ie) ? support.pointerevents = false : '';
					(9 > browser.ie) ? support.svgimage = false : '';
				} else {
					browser.ie = false;
				}

				el_html.dataset.col = device.col;
				el_html.dataset.browser = browser.chrome ? 'chrome' : browser.firefox ? 'firefox' : browser.opera ? 'opera' : browser.safari ? 'safari' : browser.ie ? 'ie' + browser.ie : 'other';
				el_html.dataset.platform = device.ios ? "ios" : device.android ? "android" : 'window';
				el_html.dataset.device = device.mobile ? device.app ? 'app' : 'mobile' : 'desktop';
			}
			window.addEventListener('resize', act);
			act();
		},
		comma(n) {
			let parts = n.toString().split(".");

			return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
		},
		add0(x) {
			return Number(x) < 10 ? '0' + x : x;
		},
		paraGet(paraname) {
			const _tempUrl = window.location.href;
			let _tempArray = _tempUrl.split(paraname + '=');

			if (_tempArray.length > 1) {
				_tempArray = _tempArray[1];
				_tempArray = _tempArray.split('&');
				_tempArray = _tempArray[0];
				_tempArray = _tempArray.split('#');
				_tempArray = _tempArray[0];
			} else {
				_tempArray = null
			}

			return _tempArray;
		},
		paraSet(key, value) {
			const _tempUrl = window.location.href;
			let _tempArray = _tempUrl.split(key + '=');

			if (_tempArray.length > 1) {
				_tempArray = _tempArray[0] + key + '=' + value;
			} else {
				_tempArray = _tempUrl + '?' + key + '=' + value;
			}

			history.pushState(null, null, _tempArray);
		},
		RAF(start, end, startTime, duration) {
			const _start = start;
			const _end = end;
			const _duration = duration ? duration : 300;
			const unit = (_end - _start) / _duration;
			const endTime = startTime + _duration;

			let now = new Date().getTime();
			let passed = now - startTime;

			if (now <= endTime) {
				Global.parts.RAF.time = _start + (unit * passed);
				requestAnimationFrame(scrollTo);
			} else {
				!!callback && callback();
			}
		},
		getIndex(ele) {
			let _i = 0;

			while ((ele = ele.previousSibling) != null) {
				(ele.nodeType === 1) && _i++;
			}

			return _i;
		},
		/**
		 * include
		 * @param {string} opt.id 
		 * @param {string} opt.src 
		 * @param {string} opt.type : 'html' | 'json'
		 * @param {boolean} opt.insert : true[insertAdjacentHTML] | false[innerHTML]
		 * @param {function} opt.callback
		 * 
		 */
		include(opt) {
			const selector = document.querySelector('[data-id="' + opt.id + '"]');
			const src = opt.src;
			const type = !opt.type ? 'HTML' : opt.type;
			const insert = !!opt.insert ? opt.insert : false;
			const callback = !!opt.callback ? opt.callback : false;

			if (!!selector && !!src) {
				switch (type) {
					case 'HTML':
						fetch(src)
							.then(response => response.text())
							.then(result => {
								if (insert) {
									selector.insertAdjacentHTML('afterbegin', result);
								} else {
									selector.innerHTML = result;
								}
							}).then(() => {
								!!callback && callback();
							});
						break;
				}
			}
		},
		resizObserver(opt) {
			let timer = null;
			let w = null;
			let h = null;
			const observer = new ResizeObserver(entries => {
				for (let entry of entries) {
					const { width, height } = entry.contentRect;
					w === null ? w = width : '';
					h === null ? h = height : '';

					!!timer && clearTimeout(timer);
					// timer = setTimeout(() => {
					//     console.log(width, height);
					opt.callback({
						width: width,
						height: height,
						resize: [w === width ? false : true, h === height ? false : true]
					});
					// }, 50);
				}
			});

			observer.observe(opt.el);
		}
	};

	Global.loading = {
		timerShow: {},
		timerHide: {},
		options: {
			selector: null,
			message: null,
			styleClass: 'orbit' //time
		},
		show(option) {
			const opt = Object.assign({}, this.options, option);
			const selector = opt.selector;
			const styleClass = opt.styleClass;
			const message = opt.message;
			const el = (selector !== null) ? selector : document.querySelector('body');
			const el_loadingHides = document.querySelectorAll('.mdl-loading:not(.visible)');

			for (let i = 0, len = el_loadingHides.length; i < len; i++) {
				const that = el_loadingHides[i];

				that.remove();
			}

			let htmlLoading = '';

			(selector === null) ?
				htmlLoading += '<div class="mdl-loading ' + styleClass + '">' :
				htmlLoading += '<div class="mdl-loading type-area ' + styleClass + '">';

			htmlLoading += '<div class="mdl-loading-wrap">';

			(message !== null) ?
				htmlLoading += '<strong class="mdl-loading-message"><span>' + message + '</span></strong>' :
				htmlLoading += '';

			htmlLoading += '</div>';
			htmlLoading += '</div>';

			const showLoading = () => {
				const el_child = el.childNodes;
				let is_loading = false;

				for (let i = 0; i < el_child.length; i++) {
					if (el_child[i].nodeName === 'DIV' && el_child[i].classList.contains('mdl-loading')) {
						is_loading = true;
					}
				}

				!is_loading && el.insertAdjacentHTML('beforeend', htmlLoading);
				htmlLoading = null;

				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('visible');
					that.classList.remove('close');
				}
			}
			clearTimeout(this.timerShow);
			clearTimeout(this.timerHide);
			this.timerShow = setTimeout(showLoading, 300);
		},
		hide() {
			clearTimeout(this.timerShow);
			this.timerHide = setTimeout(() => {
				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('close');
					setTimeout(() => {
						that.classList.remove('visible')
						that.remove();
					}, 300);
				}
			}, 300);
		}
	}

	Global.form = {
		init() {
			const el_inps = document.querySelectorAll('.inp-base');
			const prefix = (inp) => {
				const wrap = inp.parentElement;

				if (!wrap.querySelector('.prefix')) {
					const preFixTxt = document.createElement('span');
					const theFirstChild = wrap.firstChild;
					const txt = inp.dataset.prefix;

					preFixTxt.classList.add('prefix');
					preFixTxt.textContent = txt;
					wrap.insertBefore(preFixTxt, theFirstChild);

					const w = wrap.querySelector('.prefix').offsetWidth;

					wrap.querySelector('.inp-base').style.paddingLeft = w + 'px';
				}
			}
			const suffix = (inp) => {
				const wrap = inp.parentElement;

				if (!wrap.querySelector('.suffix')) {
					const fixTxt = document.createElement('span');
					const txt = inp.dataset.suffix;

					fixTxt.classList.add('suffix');
					fixTxt.textContent = txt;
					wrap.appendChild(fixTxt);

					const w = wrap.querySelector('.suffix').offsetWidth;

					inp.dataset.suf = w;
					wrap.querySelector('.inp-base').style.paddingRight = w + 'px';
				}
			}

			for (let i = 0, len = el_inps.length; i < len; i++) {
				const inp = el_inps[i];

				inp.addEventListener('focus', this.actClear);
				inp.addEventListener('input', this.actClear);
				inp.addEventListener('blur', this.actClear);

				//prefix, suffix text
				!!inp.dataset.prefix && prefix(inp);
				!!inp.dataset.suffix && suffix(inp);
				!!inp.value && (!!inp.dataset.clear || inp.type === 'search') && (!!inp.dataset.keep || inp.type === 'search') && this.actClear(inp);
			}
		},
		clearTimer: {},
		actClear(event) {
			let inp;
			const isInput = event.type === 'text' || event.type === 'search' || event.type === 'number' || event.type === 'tel' || event.type === 'email' || event.type === 'file' || event.type === 'password' || event.type === 'url' || event.type === 'tel' || event.type === 'date';
			if (isInput) {
				inp = event;
			} else {
				inp = event.currentTarget;
			}

			// const id = inp.id;
			const title = inp.title;
			const wrap = inp.parentElement;
			const suffix = wrap.querySelector('.suffix');
			const isValue = inp.value;
			let eventType = event.type;
			const isClear = inp.dataset.clear || inp.type === 'search' ? true : false;
			let isKeep = inp.dataset.keep;
			const w_suffix = !!suffix ? suffix.offsetWidth : 0;
			const paddingR = Number((inp.style.paddingRight).split('px')[0]);

			if (!isClear) {
				return false;
			}

			if (isInput) {
				eventType = 'input';
			}

			if (inp.type === 'search') {
				isKeep = true;
			}

			const clear = () => {
				clearTimeout(this.clearTimer);
				inp.value = '';
				inp.focus();
			}
			const beforeClear = () => {
				const btn = wrap.querySelector('.ui-clear');
				const btnclear = () => {
					if (!!btn) {
						const w = btn.offsetWidth;
						inp.style.paddingRight = paddingR - w + 'px';
						btn.removeEventListener('click', clear);
						btn.remove();
					}
				}
				(!!isKeep) ? (!inp.value) && btnclear() : btnclear();
			}

			switch (eventType) {
				case 'focus':
				case 'input':
					if (!!isValue) {
						if (!wrap.querySelector('.ui-clear')) {
							const clearbutton = document.createElement('button');
							clearbutton.type = 'button';
							clearbutton.classList.add('btn-clear');
							clearbutton.classList.add('ui-clear');
							clearbutton.setAttribute('aria-label', title + ' 값 삭제');
							// clearbutton.dataset.id = id;

							inp.after(clearbutton);

							const btn = wrap.querySelector('.ui-clear');
							const w = btn.offsetWidth + w_suffix;

							inp.style.paddingRight = w + 'px'
							btn.style.marginRight = w_suffix + 'px';

							btn.addEventListener('focus', () => clearTimeout(this.clearTimer));
							btn.addEventListener('blur', beforeClear);
							btn.removeEventListener('click', clear);
							btn.addEventListener('click', clear);
						}
					} else {
						beforeClear();
					}
					break;

				case 'blur':
					if (!!wrap.querySelector('.ui-clear')) {
						this.clearTimer = setTimeout(() => {
							beforeClear();
						}, 300);
					}
					break;
			}
		},

		fileUpload() {
			const el_files = document.querySelectorAll('.mdl-file-inp');
			const fileTypes = [
				"image/apng",
				"image/bmp",
				"image/gif",
				"image/jpeg",
				"image/pjpeg",
				"image/png",
				"image/svg+xml",
				"image/tiff",
				"image/webp",
				"image/x-icon"
			];

			const fileDelete = (e) => {
				const id = e.currentTarget.dataset.id;

				const list = document.querySelector('.mdl-file-list[data-id="' + id + '"]');
				const list_ul = list.querySelector('ul');
				const list_li = list.querySelectorAll('li');
				const inp = document.querySelector('#' + id);
				const nodes = [...list_ul.children];
				const index = Number(nodes.indexOf(e.currentTarget.closest('li')));

				const dataTransfer = new DataTransfer();
				const _files = inp.files;
				let fileArray = Array.from(_files);

				fileArray.splice(index, 1);
				fileArray.forEach((file) => {
					dataTransfer.items.add(file);
				});
				list_li[index].remove();
				inp.files = dataTransfer.files;
			}
			const validFileType = (file) => {
				return fileTypes.includes(file.type);
			}
			const returnFileSize = (number) => {
				if (number < 1024) {
					return number + 'bytes';
				} else if (number >= 1024 && number < 1048576) {
					return (number / 1024).toFixed(1) + 'KB';
				} else if (number >= 1048576) {
					return (number / 1048576).toFixed(1) + 'MB';
				}
			}

			const updateImageDisplay = (e) => {
				const el_file = e.currentTarget;
				const id = el_file.id;
				const preview = document.querySelector('.mdl-file-list[data-id="' + id + '"]');
				const curFiles = el_file.files;

				while (preview.firstChild) {
					preview.removeChild(preview.firstChild);
				}

				if (curFiles.length === 0) {
					const para = document.createElement('p');
					para.textContent = 'No files currently selected for upload';
					preview.appendChild(para);
				} else {
					const list = document.createElement('ul');
					const title = document.createElement('h4');

					title.textContent = 'File upload list';
					title.classList.add('a11y-hidden');
					preview.classList.add('on');
					preview.appendChild(title);
					preview.appendChild(list);

					for (let i = 0, len = curFiles.length; i < len; i++) {
						const that = curFiles[i];
						const listItem = document.createElement('li');
						const para = document.createElement('p');
						const delbutton = document.createElement('button');

						delbutton.type = 'button';
						delbutton.classList.add('mdl-file-del');
						delbutton.title = '파일 삭제';
						delbutton.dataset.id = id;
						delbutton.dataset.n = i;

						para.textContent = that.name + ', ' + returnFileSize(that.size) + '.';

						if (validFileType(that)) {
							const image = document.createElement('img');
							image.src = URL.createObjectURL(that);

							listItem.appendChild(image);
						}

						listItem.appendChild(para);
						listItem.appendChild(delbutton);
						list.appendChild(listItem);
						delbutton.addEventListener('click', fileDelete);
					}
				}
			}

			for (let i = 0, len = el_files.length; i < len; i++) {
				const that = el_files[i];

				if (!that.dataset.ready) {
					that.addEventListener('change', updateImageDisplay);
					that.dataset.ready = true;
				}
			}
		},
		allCheck(opt) {
			const el_parents = document.querySelectorAll('[data-allcheck-parent]');
			const el_childs = document.querySelectorAll('[data-allcheck-child]');
			const opt_callback = opt.allCheckCallback;

			const allCheckParent = () => {
				isAllChecked({
					name: this.dataset.allcheckParent,
					type: 'parent'
				});
			}

			const allCheckChild = () => {
				isAllChecked({
					name: this.dataset.allcheckChild,
					type: 'child'
				});
			}

			const isAllChecked = (opt) => {
				const isType = opt.type;
				const isName = opt.name;
				const parent = document.querySelector('[data-allcheck-parent="' + isName + '"]');
				const childs = document.querySelectorAll('[data-allcheck-child="' + isName + '"]');
				const allChecked = parent.checked;
				const len = childs.length;
				let n_checked = 0;
				let n_disabled = 0;

				for (let i = 0; i < len; i++) {
					const child = childs[i];

					if (isType === 'parent' && !child.disabled) {
						child.checked = allChecked;
					}

					n_checked = child.checked && !child.disabled ? ++n_checked : n_checked;
					n_disabled = child.disabled ? ++n_disabled : n_disabled;
				}

				parent.checked = (len !== n_checked + n_disabled) ? false : true;

				opt_callback({
					group: isName,
					allChecked: parent.checked
				});
			}

			for (let i = 0; i < el_parents.length; i++) {
				if (!el_parents[i].dataset.apply) {
					el_parents[i].addEventListener('change', allCheckParent);
					isAllChecked({
						name: el_parents[i].dataset.allcheckParent,
						type: 'child'
					});
				}

				el_parents[i].dataset.apply = '1';
			}

			for (let i = 0; i < el_childs.length; i++) {
				if (!el_childs[i].dataset.apply) {
					el_childs[i].addEventListener('change', allCheckChild);
				}

				el_childs[i].dataset.apply = '1';
			}
		},
		setSelect() {
			const selects = document.querySelectorAll('.mdl-select');
			let n = 0;
			for (let item of selects) {
				if (!!item.dataset.id) {
					const _id = item.dataset.id;
					if (!UI.exe[_id]) {
						UI.exe[_id] = new Layer({
							id: _id,
							type: 'select'
						});
					}
				} else {
					const _id = 'select_' + Date.now() + n;
					n = n + 1;
					item.dataset.id = _id;

					UI.exe[_id] = new Layer({
						id: _id,
						type: 'select'
					});
				}
			}
		},
	}

	Global.correctCheck = (a, b) => {
		if (b !== null) {
			a.length > 1 && a.sort();
			b.length > 1 && b.sort();

			console.log(a,b)
			return a.length === b.length && a.every((v, i) => v === b[i]); 
		} else {
			return null;
		}
	}
	Global.question = {
		mark:(quiz) => {
			quiz.forEach((item) => {
				const _exe = UI.exe[item];
				_exe.check();
				console.log(_exe);
				_exe.answer.selectedAnswer.length ? _exe.answer.checked = true : '';
			});
		}
	}

})();

//문제 컨텐츠 불러오기
class InnerPage {
	constructor(opt) {
		this.pages = opt.pages;
		this.pageView = opt.pageView;
		this.name = opt.name;

		this.playTime = this.pages.time
		this.page_length = this.pages.length;

		this.innerPage = document.querySelector('.inner-page');
		this.innerPageWrap = this.innerPage.querySelector('.inner-page--wrap');
		this.innerPageItem = this.innerPageWrap.querySelector('.inner-page--item');
		this.curretPageNumber = this.pageView - 1;

		this.init();
	}
	init() {
 		//첫 기본 page 불러오기
		this.pageLoad(this.curretPageNumber);

		//페이지네이션 생성
		const paginationHtml = `<div class="inner-page--pagination">
			<button type="button" data-act="prev">이전</button>
			<div>
				<b class="inner-page--pagination-n">${this.pageView}</b> / <span>${this.page_length}<span>
			</div>
			<button type="button" data-act="next">다음</button>
		</div>`;
		this.innerPage.insertAdjacentHTML("beforeend", paginationHtml);
		const pagination = this.innerPage.querySelector('.inner-page--pagination');
		const paginationNumber = pagination.querySelector('.inner-page--pagination-n');
		const paginationBtns = pagination.querySelectorAll('button');
		const paginationBtnPrev = pagination.querySelector('button[data-act="prev"]');
		const paginationBtnNext = pagination.querySelector('button[data-act="next"]');
		pagination.dataset.current = this.pageView;

		//페이지이동 실행
		const pageAct = (e) => {
			const n = Number(this.pageView);
			const _this = e.target;
			const act = _this.dataset.act;

			paginationBtnPrev.removeAttribute('disabled');
			paginationBtnNext.removeAttribute('disabled');
			this.pages[Number(pagination.dataset.current) - 1].time.end = new Date();

			if (act === 'prev') {
				this.pageView = n - 1;
				if (this.pageView <= 1) this.pageView = 1;
				this.pageLoad(this.pageView - 1);
			} else {
				this.pageView = n + 1;
				if (this.pageView >= this.page_length) this.pageView = this.page_length;
				this.pageLoad(this.pageView - 1);
			}
			pagination.dataset.current = this.pageView;
			paginationNumber.textContent = this.pageView;
		};
		paginationBtns.forEach((item) => {
			item.addEventListener('click', pageAct)
		});
	}
	pageLoad(v) {
		const _this = this.pages[v];
		const src = _this.page + '.html';

		fetch(src)
		.then(response => response.text())
		.then(result => {
			this.innerPageItem.innerHTML = result;
		}).then(() => {
			_this.time.start = new Date();
			_this.time.end = null;
			_this.questions.forEach((item, index) => {
				item.callback(item);
			});
		});
	}
}

//객관식 
class MultipleChoice {
	constructor(opt) {
		this.id = opt.id;
		this.wrap = document.querySelector(`[data-choice-id="${this.id}"]`);
		this.items = this.wrap.querySelectorAll(`.multiple-choice--item`);
		this.answer = opt.answer;
		this.callback = opt.callback;

		this.answer_len = this.answer.correctAnswer.length;
		this.type = this.answer_len === 1 ? 'single' : 'multiple';
		this.init();
	}
	init() {
		//선택한 답 표시
		if (!!this.answer.selectedAnswer) {
			for (let i = 0; i < this.answer.selectedAnswer.length; i++) {
				const _this = this.wrap.querySelector(`[data-answer="${this.answer.selectedAnswer[i]}"]`);
				_this.dataset.selected = true;
			}
			(this.answer.selectedAnswer.length && this.answer.checked) && this.check();
		}
		//선택 시
		const act = (e) => {
			const _this = e.currentTarget;
		
			//싱글
			if (this.type === 'single') {
				const el_curret = this.wrap.querySelector('.multiple-choice--item[data-selected="true"]');

				if (_this.dataset.selected !== 'true') {
					el_curret ? el_curret.dataset.selected = 'false' : '';
					_this.dataset.selected = 'true';
					this.answer.selectedAnswer.push(Number(_this.dataset.answer));
					this.answer.selectedAnswer.length > 1 && this.answer.selectedAnswer.shift();
				} else {
					//selected click
					el_curret.dataset.selected = 'false';
					this.answer.selectedAnswer = [];
				}
			} 
			//멀티
			else {
				if (_this.dataset.selected === 'true') {
					_this.dataset.selected = 'false';
					for(let i = 0; i < this.answer.selectedAnswer.length; i++) {
						if(this.answer.selectedAnswer[i] === Number(_this.dataset.answer))  {
							this.answer.selectedAnswer.splice(i, 1);
							break;
						}
					}
				} else {
					_this.dataset.selected = 'true';
					this.answer.selectedAnswer.push(Number(_this.dataset.answer));
				}
			}
 			this.callback({
				el: this.wrap, 
				data: this.answer,
			});
		}
		this.items.forEach((item) => {
			item.addEventListener('click', act);
		});
	}
	//리셋할때 this.answer.selectedAnswer의 배열값 다시 설정 필요해보임.
	reset = v => {
		const isDeep = v;
		for (let item of this.items) {
			item.removeAttribute('data-selected');
		}
		this.answer.selectedAnswer = [];
		// if (isDeep) this.selectedAnswer = [];

		console.log('isDeep', isDeep, this.answer.selectedAnswer);
	}
	check = () => {
		console.log('check', this.selectedAnswer, this.answer.isCorrect)
		const el_title = document.querySelector(`[data-question-title="${this.id}"]`);

		if (!!this.answer.selectedAnswer.length) {
			el_title.dataset.state = this.answer.isCorrect
		} else {
			alert('정답을 선택하세요.');
		}
	}
	complete = () => {

	}
}
// 선잇기 
class DragLine {
	/**
	 * 선잇기 callback 정보
	 * answer_all_sum === answer_current_sum 정답상태
	 * @param {number} answer_all_sum 전체정답갯수
	 * @param {number} answer_current_sum 현재정답갯수
	 * @param {string} answer_current 선택한 답
	 * @param {boolean} answer_all_state 전체정오답상태
	 * @param {object} answer_last 히스토리
	 *
	 */
	constructor(opt) {
		this.id = opt.id;
		this.doc = document.documentElement;
		this.wrap = document.querySelector(`[data-line-id="${this.id}"]`);
		this.items = this.wrap.querySelectorAll('[data-line-object], [data-line-target]');
		this.objects = this.wrap.querySelectorAll(`[data-line-object]`);
		this.targets = this.wrap.querySelectorAll(`[data-line-target]`);

		// this.type = this.wrap.dataset.lineType
		// 	? this.wrap.dataset.lineType
		// 	: 'single';
		const rect = this.wrap.getBoundingClientRect();
		this.wrap_t = rect.top;
		this.wrap_l = rect.left;
		this.wrap_w = this.wrap.offsetWidth;
		this.wrap_h = this.wrap.offsetHeight;

		this.n = this.objects.length;
		this.svg = null;

		this.answer = opt.answer;
		this.correctAnswer = this.answer.correctAnswer;

		let len = 0;
		this.correctAnswer.forEach(item => {
			if (item.length) {
				len = len + item.length;
			} else {
				len = len + 1;
			}
			this.answer.selectedAnswer.push([]);
		});

		this.answer_len = Number(len);
		this.type = (this.answer_len > this.answer.correctAnswer.length) ? 'multiple' : 'single';

		this.answer_n = 0;
		this.complete_n = 0;
		this.selectedAnswer = this.answer.selectedAnswer;

		this.callback = opt.callback;
		this.callbackComplete = opt.callbackComplete;
		this.callbackCheck = opt.callbackCheck;
		this.isTouch =
			navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;

		//userAgent 값 얻기
		const varUA = navigator.userAgent.toLowerCase();
		const isMobile = varUA.indexOf('android') > -1 || varUA.indexOf('iphone') > -1 || varUA.indexOf('ipad') > -1 || varUA.indexOf('ipod') > -1;

		if (!isMobile) this.isTouch = false;
		
		this.init();
	}

	// resizeObserver(setCall) {
	//   setCall();
	// }

	init() {
		//중복실행방지
		if (this.wrap.dataset.load === 'ok') return false;
		this.wrap.dataset.load = 'ok';

		//svg생성
		this.wrap.insertAdjacentHTML('beforeend', `<svg></svg>`);
		this.svg = this.wrap.querySelector('svg');

		//setup
		const set = () => {
			this.reset();

			const rect = this.wrap.getBoundingClientRect();
			this.wrap_t = rect.top;
			this.wrap_l = rect.left;
			this.wrap_w = this.wrap.offsetWidth;
			this.wrap_h = this.wrap.offsetHeight;

			//접근성: 키보드 접근 제한
			for (const item of this.targets) {
				item.setAttribute('tabindex', '-1');
			}

			//object & target 크기, 위치 정보 저장
			for (const [index, item] of this.items.entries()) {
				const rect_item = item.getBoundingClientRect();
				const item_w = item.offsetWidth / 2;
				const item_h = item.offsetHeight / 2;

				item.dataset.name = index;
				item.dataset.x = rect_item.left + item_w - this.wrap_l;
				item.dataset.y = rect_item.top + item_h - this.wrap_t;
			}

			this.wrap.style.opacity = '1';

			//선택한 정답 존재 여부에 따라 
			if (this.selectedAnswer?.length) {
				// this.drawLastAnswer();
			} else {
				// this.selectedAnswer = [];
			}
		};
		this.wrap.style.opacity = '0';
		this.wrap.style.transition = 'opacity 0.2s ease';

		//resize 재설정
		let timer = 0;
		const resizeObserver = new ResizeObserver(() => {
			clearTimeout(timer);
			this.wrap.style.opacity = '0';
			timer = setTimeout(() => {
				set();
			}, 300);
		});
		//this.wrap의 크기가 변경될 때 재설정
		resizeObserver.observe(this.wrap);

		//첫터치 체크
		let firstTouch = {
			state: false,
			item: null,
			line: null,
			x: null,
			y: null,
			is_object: null,
		};
		let moving = false;
		let isObject;

		//선 만들기 시작 actStart에서 실행
		const createLine = e => {
			let el_item = e.type === 'keydown' ? e.target : e.currentTarget;

			//현재 object인가 target인가
			let data_name_object = null;
			let data_name_target = null;
			const data_name = el_item.dataset.name;

			if (isObject) {
				data_name_object = el_item.dataset.name;
			} else {
				data_name_target = el_item.dataset.name;
			}
			const el_rect = el_item.getBoundingClientRect();
			const tag_line = `<line x1="0" x2="0" y1="0" y2="0" data-state="ing" data-name="${data_name}" data-object-name="${data_name_object}" data-target-name="${data_name_target}"></line>`;

			//라인 생성
			if ((this.isTouch && !firstTouch.state) || !moving) {
				this.wrap
					.querySelector('svg')
					.insertAdjacentHTML('beforeend', tag_line);
			}

			// if (e.type !== 'keydown') document.querySelector('body').classList.add('noScroll');

			//라인전체영역
			this.wrap_t = this.wrap.getBoundingClientRect().top;
			this.wrap_l = this.wrap.getBoundingClientRect().left;
			this.wrap_w = this.wrap.offsetWidth;
			this.wrap_h = this.wrap.offsetHeight;

			//싱글모드, 완료아이템 재선택
			if (this.type === 'single' && el_item.dataset.complete === 'true') {
				el_item.removeAttribute('data-complete');
				const _nn = el_item.dataset.lineObject
					? el_item.dataset.lineObject
					: el_item.dataset.lineTarget;
				let _nnn;
				let _name;
				let _dot;

				const line_del = this.wrap.querySelector(`line[data-name="${data_name}"]`);
				const object_name = line_del.dataset.objectName;
				const target_name = line_del.dataset.targetName;
				line_del.remove();

				const _obj = this.wrap.querySelector('[data-name="' + object_name + '"]');
				const _trg = this.wrap.querySelector('[data-name="' + target_name + '"]');

				if (_obj) _obj.setAttribute('aria-label', _obj.dataset.label);
				if (_trg) _trg.setAttribute('aria-label', _trg.dataset.label);

				//target인 경우
				if (el_item.dataset.connect) {
					_name = el_item.dataset.connect;
					el_item.removeAttribute('data-connect');
					_dot = this.wrap.querySelector(`[data-name="${_name}"]`);
				}
				//object인 경우
				else {
					_name = data_name;
					_dot = this.wrap.querySelector(`[data-connect="${_name}"]`);
				}

				_dot.removeAttribute('data-connect');
				_dot.removeAttribute('data-complete');
				_nnn = _dot.dataset.lineObject
					? _dot.dataset.lineObject
					: _dot.dataset.lineTarget;

				if (_nn === _nnn) this.answer_n = this.answer_n - 1;
			}

			el_item.dataset.active = moving ? '' : 'true';

			let el_line = this.svg.querySelector('line[data-state="ing"]');

			if (e.type === 'keydown') {
				const item_w = el_item.offsetWidth / 2;
				const item_h = el_item.offsetHeight / 2;
				const x_value = el_rect.left + item_w - this.wrap_l;
				const y_value = el_rect.top + item_h - this.wrap_t;

				el_line.setAttribute('x1', x_value);
				el_line.setAttribute('y1', y_value);
				el_line.setAttribute('x2', x_value);
				el_line.setAttribute('y2', y_value);
			}
		};

		const actStart = e => {
			e.preventDefault();

			let el_item = e.currentTarget;
			const _drag = el_item.closest('[data-line-id]');
			let actMove;
			let actEnd;
			let _x = e.clientX ? e.clientX : e.targetTouches[0].clientX;
			let _y = e.clientY ? e.clientY : e.targetTouches[0].clientY;

			let _menu = _drag.querySelector('[role="menu"]');
			let _actives = _drag.querySelectorAll('[data-active="true"]');
			let _line = _drag.querySelector('line[data-state="ing"]');

			let is_object;
			let el_line;
			let data_name;
			let rect_item;
			let item_w;
			let item_h;
			let x_value;
			let y_value;

			//이벤트주체가 object인지
			isObject = el_item.dataset.lineObject ? true : false;

			//초기화
			if (_menu) _menu.remove();
			if (_line) _line.remove();
			for (const item of _actives) {
				item.removeAttribute('[data-active]');
			}
			//선그리기 
			createLine(e);
			_drag.dataset.ing = 'true';
			_drag.dataset.ingt = el_item;

			is_object = el_item.dataset.lineObject ? true : false;
			el_line = this.svg.querySelector('line[data-state="ing"]');
			value = is_object
				? el_item.dataset.lineObject
				: el_item.dataset.lineTarget;
			data_name = el_item.dataset.name;

			if (this.type === 'single') {
				if (is_object) {
					el_line = this.svg.querySelector(`line[data-object-name="${data_name}"]`);
				} else {
					el_line = this.svg.querySelector(`line[data-target-name="${data_name}"]`);
				}
			}

			rect_item = el_item.getBoundingClientRect();
			item_w = el_item.offsetWidth / 2;
			item_h = el_item.offsetHeight / 2;
			x_value = rect_item.left + item_w - this.wrap_l;
			y_value = rect_item.top + item_h - this.wrap_t;

			actEnd = () => {
				//클릭완료이벤트에 클릭이벤트인경우 클릭완료 설정
				_drag.dataset.ing = 'false';
				_drag.dataset.ingt = 'false';
				document.querySelector('body').classList.remove('noScroll');
				const v_x = _x - this.wrap_l;
				const v_y = _y - this.wrap_t;
				let is_complete = false;
				moving = false;

				if (el_line) {
					el_line.dataset.state = 'complete';
				}
				el_item.dataset.active = '';
				firstTouch.state = false;

				for (let item of this.items) {
					const _isObject = item.dataset.lineObject ? true : false;

					//다른그룹일때만
					if (_isObject !== isObject) {
						let is_selected = false;
						let connect_array;

						//완료된아이템여부 확인
						const _is_complete = item.dataset.complete;
						const _value = _isObject
							? item.dataset.lineObject
							: item.dataset.lineTarget;

						const _rect_item = item.getBoundingClientRect();
						const i_x = Number(item.dataset.x);
						const i_y = Number(item.dataset.y);

						//현재위치가 범위내에 들어와 있는지?
						const if_x =
							v_x <= i_x + item_w && v_x + item_w * 2 >= i_x + item_w;
						const if_y =
							v_y >= i_y - item_h && v_y <= i_y - item_h + item_h * 2;

						//싱글 연결완료조건: 범위내, 미완료
						//멀티 연결완료조건: 범위내
						const if_true =
							this.type === 'single'
								? if_x && if_y && !_is_complete
								: if_x && if_y;

						//멀티
						//연결된 아이템인 경우에서 서로 이미 연결이 된 경우라면 is_selected true 설정하여 연결실패로 처리
						if (this.type === 'multiple' && item.dataset.connect) {
							connect_array = item.dataset.connect.split(',');

							for (let i = 0; i < connect_array.length; i++) {
								if (data_name === connect_array[i]) {
									is_selected = true;
									break;
								}
							}
						}

						//연결성공
						if (if_true && !is_selected) {
							//완료갯수
							this.complete_n = this.complete_n + 1;

							//연결된 정보 connect 여부에 따른 값설정
							if (!item.dataset.connect) {
								//connect가 없다면
								item.dataset.connect = el_item.dataset.name;
							} else {
								//connect가 있다면 , 추가
								item.dataset.connect =
									item.dataset.connect + ',' + el_item.dataset.name;
							}
							//연결된 정보
							if (!el_item.dataset.connect) {
								el_item.dataset.connect = item.dataset.name;
							} else {
								el_item.dataset.connect =
									el_item.dataset.connect + ',' + item.dataset.name;
							}

							//최종 라인종료 위치
							el_line.setAttribute(
								'x2',
								_rect_item.left + item_w - this.wrap_l
							);
							el_line.setAttribute('y2', _rect_item.top + item_h - this.wrap_t);

							if (_isObject) {
								el_line.dataset.objectName = item.dataset.name;
							} else {
								el_line.dataset.targetName = item.dataset.name;
							}

							//접근성 현재 연결된 상황 aria-label
							let object_correct = el_item.dataset.connect;
							object_correct = object_correct.split(',');
							let label_txt = '';

							if (is_object) {
								if (el_item.dataset.complete === 'true') {
									label_txt = el_item.getAttribute('aria-label') + ', ' + item.dataset.label;
								} else {
									label_txt = item.dataset.label;
								}

								el_item.setAttribute(
								  'aria-label',
								 	`${el_item.dataset.label}은(는)  ${label_txt} 연결됨`
								);
							} else {
								if (item.dataset.complete === 'true') {
									label_txt = item.getAttribute('aria-label') + ', ' + el_item.dataset.label;
								} else {
									label_txt = el_item.dataset.label;
								}

								item.setAttribute(
									'aria-label',
									`${item.dataset.label}은(는)  ${label_txt} 연결됨`
								);
							}

							//연결된 아이템 완료상태
							el_item.dataset.complete = true;
							item.dataset.complete = true;

							//연결완료성공
							is_complete = true;

							//선택한 답 저장
							//시작점이 object
							if (is_object) {
								if (this.type === 'single') {
									this.answer.selectedAnswer[Number(el_item.dataset.name)] = [];
								}
								this.answer.selectedAnswer[Number(el_item.dataset.name)].push(Number(item.dataset.lineTarget));
							} 
							//시작점이 target
							else {
								if (this.type === 'single') {
									this.answer.selectedAnswer[Number(item.dataset.name)] = [];
								}
								this.answer.selectedAnswer[Number(item.dataset.name)].push(Number(el_item.dataset.lineTarget));
							}

							console.log(this.answer.selectedAnswer);
							break;
						}
					}
				}

				//이벤트 취소
				this.doc.removeEventListener('touchmove', actMove);
				this.doc.removeEventListener('touchend', actEnd);
				this.doc.removeEventListener('mousemove', actMove);
				this.doc.removeEventListener('mouseup', actEnd);

				//연결 실패인 경우 라인 삭제 및 이전기록 삭제
				if (!is_complete) {
					const object_name = el_line.dataset.objectName;
					const target_name = el_line.dataset.targetName;

					el_line.remove();
					//answer_last 수정일 경우
					if (this.answer.selectedAnswer && this.type === 'single') {
						for (let i = 0; i < this.answer.selectedAnswer.length; i++) {
							if (
								Object.keys(this.answer.selectedAnswer[i]).includes(
									'key' + el_item.dataset.name
								)
							) {
								this.answer.selectedAnswer.splice(i, 1);
								this.complete_n = this.complete_n - 1;
								const _obj = this.wrap.querySelector(
									'[data-name="' + object_name + '"]'
								);
								if (_obj) _obj.setAttribute('aria-label', _obj.dataset.label);
								const _trg = this.wrap.querySelector('[data-name="' + target_name + '"]');
								if (_trg) _trg.setAttribute('aria-label', _trg.dataset.label);
							}
						}
					}
				}
				
				//callback
				this.callback({
					el: this.wrap, 
					data: this.answer,
				});
				
			};
			actMove = e => {
				e.preventDefault();

				_x = e.clientX ? e.clientX : e.targetTouches[0].clientX;
				_y = e.clientY ? e.clientY : e.targetTouches[0].clientY;
				el_line.setAttribute('x2', _x - this.wrap_l);
				el_line.setAttribute('y2', _y - this.wrap_t);

				if (this.isTouch) {
					// this.doc.addEventListener('touchend', actEnd);
				} else {
					this.doc.addEventListener('mouseup', actEnd);
				}
				moving = true;
			};

			if (this.isTouch) {
				//터치
				if (!firstTouch.state) {
					this.doc.addEventListener('touchmove', actMove, { passive: false });
					this.doc.addEventListener('touchend', actEnd);
					console.log('firstTouch', 1111);
					firstTouch.state = true;
					firstTouch.item = el_item;
					firstTouch.line = el_line;
					firstTouch.x = x_value;
					firstTouch.y = y_value;
					firstTouch.is_object = is_object;

					el_line.setAttribute('x1', x_value);
					el_line.setAttribute('y1', y_value);
					el_line.setAttribute('x2', x_value);
					el_line.setAttribute('y2', y_value);
				} else {
					this.doc.removeEventListener('touchmove', actMove);

					firstTouch.state = false;
					firstTouch.item.dataset.active = '';
					el_item.dataset.active = '';
					el_item = firstTouch.item;
					is_object = firstTouch.is_object;
					value = is_object
						? firstTouch.item.dataset.lineObject
						: firstTouch.item.dataset.lineTarget;
					_x = e.clientX ? e.clientX : e.targetTouches[0].clientX;
					_y = e.clientY ? e.clientY : e.targetTouches[0].clientY;

					actEnd();
				}
			} else {
				//마우스
				if (!moving) {
					this.doc.addEventListener('mousemove', actMove);

					el_line.setAttribute('x1', x_value);
					el_line.setAttribute('y1', y_value);
					el_line.setAttribute('x2', x_value);
					el_line.setAttribute('y2', y_value);
				}
			}
		};

		//keyborad
		const actKey = e => {
			const _this = e.currentTarget;
			const _wrap = _this.parentNode;
			let isEnd = false;
			let innerScroll = document.querySelector('.innerContsScroll');
			innerScroll = !innerScroll ? document.querySelector('body') : innerScroll;

			if (this.svg.querySelector('line[data-state="ing"]')) {
				this.svg.querySelector('line[data-state="ing"]').remove();
			}
			isObject = _this.dataset.lineObject ? true : false;

			//space key
			if (e.keyCode === 32) {
				createLine(e);
				//셀렉트생성
				let m = 1;
				let make_menu = `<div role="menu">`;
				let j = 0;
				let isCnt = true;

				for (const item of this.targets) {
					// if (this.type === 'single' && item.dataset.complete !== 'true') {
					if (this.type === 'single') {
						if (item.dataset.complete !== 'true') {
							make_menu += `<button value="
              ${item.dataset.lineTarget}"
              type="button"
              tabindex="-1"
              role="menuitem"
              data-n="${m}"
            >
              ${item.getAttribute('data-label')}
            </button>`;
						}
					}
					if (this.type === 'multiple') {
						if (_this.dataset.connect) {
							let cnt = _this.dataset.connect.split(',');

							if (!cnt.includes(item.dataset.name)) {
								make_menu += `<button
                  type="button"
                  tabindex="-1"
                  role="menuitem"
                  value="${item.dataset.lineTarget}"
                  data-n="${m}"
                >
                  ${item.getAttribute('data-label')}
                </button>`;
							} else {
								make_menu += `<button
                  type="button"
                  tabindex="-1"
                  role="menuitem"
                  value="${item.dataset.lineTarget}"
                  data-n="${m}"
									data-cancel="true"
                >
                  ${item.getAttribute('data-label')} 취소
                </button>`;
								j = j + 1;
							}
						} else {
							make_menu += `<button
                type="button"
                tabindex="-1"
                role="menuitem"
                value="${item.dataset.lineTarget}"
                data-n="${m}"
              >
                ${item.getAttribute('data-label')}
              </button>`;
						}
					}
					m = m + 1;
				}

				// if (j !== this.targets.length) {
				_wrap.insertAdjacentHTML('beforeend', make_menu);
				innerScroll.dataset.overflow = 'hidden';
				// } else {
				//   return false;
				// }

				const _menu = _wrap.querySelector('[role="menu"]');
				const _menuItem = _menu.querySelectorAll('[role="menuitem"]');
				const len = _menuItem.length;
				const el_line = this.svg.querySelector('line[data-state="ing"]');

				//선택시
				const actSelect = e => {
					isEnd = true;

					const menuItem = e.currentTarget;
					const wrap = menuItem.parentNode;
					const sel_val = Number(menuItem.value);
					const el_target = this.wrap.querySelector('[data-line-target="' + sel_val + '"]');

					let objFocus;

					switch (e.key) {
						case 'Tab':
							if (_menu) _menu.remove();
							if (!isEnd) {
								el_line.remove();
							}
							innerScroll.removeAttribute('data-overflow');
							break;

						case 'ArrowDown':
						case 'ArrowRight':
							objFocus = menuItem.nextSibling;
							if (!objFocus) {
								objFocus = wrap.querySelector('[role="menuitem"]:nth-child(1)');
							}
							objFocus.focus();
							break;

						case 'ArrowUp':
						case 'ArrowLeft':
							objFocus = menuItem.previousSibling;
							if (!objFocus) {
								objFocus = wrap.querySelector(
									'[role="menuitem"]:nth-child(' + len + ')'
								);
							}
							objFocus.focus();
							break;

						case 'Enter':
							//취소---
							if (menuItem.dataset.cancel === 'true') {
								_menu.remove();

								//data-connect 값 수정
								let ary_conect = _this.dataset.connect.split(',');
								let ary_conect2 = [];
								ary_conect.filter(v => {
									if (v === el_target.dataset.name) {
										this.svg.querySelector(`line[data-object-name="${_this.dataset.name}"][data-target-name="${v}"]`).remove();
									} else {
										ary_conect2.push(v);
									}
								});
								_this.dataset.connect = ary_conect2;

								//생성된 라인삭제 및 초기화
								el_line.remove();//ing
								el_target.dataset.complete = false;
								_this.dataset.active = '';
								_this.dataset.complete = false;
								_this.focus();

								//취소한 답 제외 저장
								const del_answer = this.wrap.querySelector(`[data-name="${el_target.dataset.name}"]`).dataset.lineTarget;
								let filtered = this.answer.selectedAnswer[Number(_this.dataset.name)].filter((element) => element !== Number(del_answer));
								if (this.type === 'single') {
									this.answer.selectedAnswer[Number(_this.dataset.name)] = [];
								}
								this.answer.selectedAnswer[Number(_this.dataset.name)] = filtered;

								//callback
								this.callback({
									el: this.wrap, 
									data: this.answer,
								});

								return false;
							}
							//----취소

							el_line.dataset.state = 'complete';
							_this.dataset.active = '';
							_this.focus();

							//target 연결된 정보
							if (!el_target.dataset.connect) {
								el_target.dataset.connect = _this.dataset.name;
							} else {
								el_target.dataset.connect =
									el_target.dataset.connect + ',' + _this.dataset.name;
							}

							//object에 연결된 정보
							if (!_this.dataset.connect) {
								_this.dataset.connect = el_target.dataset.name;
							} else {
								_this.dataset.connect =
									_this.dataset.connect + ',' + el_target.dataset.name;
							}

							//최종 라인종료 위치
							const _rect_item = el_target.getBoundingClientRect();
							const item_w = el_target.offsetWidth / 2;
							const item_h = el_target.offsetHeight / 2;

							//svg line
							el_line.setAttribute(
								'x2',
								_rect_item.left + item_w - this.wrap_l
							);
							el_line.setAttribute('y2', _rect_item.top + item_h - this.wrap_t);
							el_line.dataset.targetName = el_target.dataset.name;

							//접근성 aria-label
							let label_txt = '';
							let object_correct = _this.dataset.connect;
							object_correct = object_correct.split(',');
							for (let i = 0; i < object_correct.length; i++) {
								const el = this.wrap.querySelector('[data-line-target][data-name="' + object_correct[i] + '"]');
								if (label_txt) {
									label_txt = label_txt + ', '+ el.dataset.label;
								} else {
									label_txt = el.dataset.label;
								}
							}
							_this.setAttribute(
								'aria-label',
								`${_this.dataset.label}은(는) ${label_txt} 연결됨`
							);

							//선택한 답 저장
							if (this.type === 'single') {
								this.answer.selectedAnswer[Number(_this.dataset.name)] = [];
							}
							this.answer.selectedAnswer[Number(_this.dataset.name)].push(Number(el_target.dataset.lineTarget));

							//연결된 아이템 완료상태
							_this.dataset.complete = true;
							el_target.dataset.complete = true;

							this.callback({
								el: this.wrap, 
								data: this.answer,
							});
							if (_menu) _menu.remove();
							if (!isEnd) {
								el_line.remove();
							}
							innerScroll.removeAttribute('data-overflow');
							break;

						default:
							break;
					}
				};

				//이벤트
				_menu.querySelector('[role="menuitem"]:nth-child(1)').focus();
				for (const item of _menuItem) {
					item.addEventListener('keydown', actSelect);
				}
			}
		};

		//event
		for (const item of this.items) {
			if (this.isTouch) {
				//touch mode
				item.addEventListener('touchstart', actStart, {
					passive: false,
				});
			} else {
				item.addEventListener('mousedown', actStart);
				item.addEventListener('keydown', actKey);
			}
		}
	}

	completeCallback() {
		if (this.callbackComplete) {
			// this.callbackComplete({
      //   /*전체정답갯수  */ answer_all_sum: this.answer_len,
      //   /*현재정답갯수  */ answer_current_sum: this.answer_n,
      //   /*전체정오답상태*/ answer_all_state:
			// 		this.answer_len === this.answer_n ? true : false,
      //   /*히스토리     */ answer_last: this.answer.selectedAnswer,
			// });

			// this.callbackComplete({
			// 	el: this.wrap, 
			// 	data: this.answer,
			// });
		}
	}

	//초기화 실행
	//리셋할때 this.answer.selectedAnswer의 배열값 다시 설정 필요해보임.
	reset = v => {
		console.log('reset',v);
		const isDeep = v;
		for (let item of this.items) {
			item.removeAttribute('data-state');
			item.removeAttribute('data-complete');
			item.removeAttribute('data-connect');
			item.setAttribute('aria-label', item.dataset.label);
		}
		this.svg = this.wrap.querySelector('svg');
		if (this.svg.lastChild) {
			while (this.svg.lastChild) {
				this.svg.removeChild(this.svg.lastChild);
			}
		}

		if (isDeep) {
			this.answer.selectedAnswer = [];
		}
		this.wrap.dataset.state = '';

		console.log('isDeep', isDeep, this.answer.selectedAnswer);
	};

	//정오답체크
	check = () => {
		this.wrap.dataset.state = 'check';
		if (this.callbackCheck) {
			// this.callbackCheck({
			// 	answer_all_sum: this.answer_len,
			// 	answer_current_sum: this.answer_n,
			// 	answer_all_state: this.answer_len === this.answer_n ? true : false,
			// 	answer_last: this.selectedAnswer,
			// });

			// this.callbackCheck({
			// 	el: this.wrap, 
			// 	data: this.answer,
			// });
		}
	};

	//정답확인 그리기
	complete = () => {
		this.reset();
		for (let i = 0; i < this.n; i++) {
			const el_object = this.items[i];
			const value = el_object.dataset.lineObject;
			if (value !== 'null') {
				const _v = value.split(',');
				for (let j = 0; j < _v.length; j++) {
					const el_target = this.wrap.querySelector(
						`[data-line-target="${_v[j]}"]`
					);

					this.svg.insertAdjacentHTML(
						'beforeend',
						`<line x1="${el_object.dataset.x}" x2="${el_target.dataset.x}" y1="${el_object.dataset.y}" y2="${el_target.dataset.y}" data-state="complete"></line>`
					);
				}
			}
		}
		this.answer_n = this.answer_len;
		this.wrap.dataset.state = 'complete';
		// this.completeCallback();
	};

	//마지막 답선택 그리기
	drawLastAnswer = (v) => {
		//새로운 정답정보가 있다면 교체
		if (v) {
			this.reset();
			this.selectedAnswer = v.lastAnswer;
		} else if (!this.selectedAnswer.length) {
			return false;
		}

		for (let i = 0; i < this.selectedAnswer.length; i++) {
			const item = this.selectedAnswer[i];
			const keyname = Object.keys(item);
			const el_object = this.wrap.querySelector(
				`[data-name="${keyname[0].split('key')[1]}"]`
			);
			const el_target = this.wrap.querySelector(
				`[data-name="${keyname[1].split('key')[1]}"]`
			);

			//해당 object,target 상태 설정
			el_object.dataset.complete = 'true';
			el_object.dataset.connect = el_target.dataset.name;
			el_object.setAttribute('aria-label', item.label);
			el_target.dataset.complete = 'true';
			el_target.dataset.connect = el_object.dataset.name;

			//정답여부 체크하여 정답인 경우 정답갯수(this.answer_n)증가
			const is_answer = item[keyname[0]] === item[keyname[1]];
			if (is_answer) {
				this.answer_n = this.answer_n + 1;
			}

			//선라인 그리기
			this.svg.insertAdjacentHTML(
				'beforeend',
				`<line x1="${el_object.dataset.x}" x2="${el_target.dataset.x}"
          y1="${el_object.dataset.y}"
          y2="${el_target.dataset.y}"
          data-state="complete"
          data-target-name="${el_target.dataset.name}"
          data-object-name="${el_object.dataset.name}"
          data-name="${el_object.dataset.name}"
          data-answer="${is_answer ? true : false}"></line>`
			);
		}
	};
}

class Layer {
	constructor(opt) {
		const defaults = {
			type: 'modal', // 
			classname: '',
			//system
			ps: 'BL',
			//toast
			delay: 'short', // short[2s] | long[3.5s]
			status: 'off',  //assertive[중요도 높은 경우] | polite[중요도가 낮은 경우] | off[default]
			auto: true,
		};

		// this.opt = Object.assign({}, defaults, opt);
		this.opt = { ...defaults, ...opt };
		this.el = {
			html: document.querySelector('html'),
			body: document.querySelector('body'),

			// ||와 ??의 차이점
			// 자바스크립트에서 ||(OR 연산자)는 값이 falsy(거짓같이 평가되는 값: 0, false, '', null, undefined, NaN)일 경우 오른쪽 값을 반환합니다. 하지만 ??는 null 또는 undefined만 처리합니다.
			pageScroll: document.querySelector('[data-pagescroll]') ?? document.querySelector('html'),
			modal: null,
			modal_wrap: null,
			btn_close: null,
			last_layer: null,
		}

		this.id = opt.id;
		this.src = opt.src;
		this.type = !opt.type ? 'modal' : opt.type;
		this.classname = opt.classname ? opt.classname : '',
		this.callback = opt.callback;
		this.callback_close = opt.callback_close;

		//system 
		this.ps = opt.ps ?? 'BL';
		this.title = opt.title;
		this.btn = opt.button;

		//toast
		this.delay = opt.delay ? opt.delay : 'short',
			this.delaytime = this.delay === 'short' ? 2000 : 3500; //short[2s] | long[3.5s]
		this.status = opt.status ? opt.status : 'off',
			//assertive[중요도 높은 경우] | polite[중요도가 낮은 경우] | off[default]
			this.auto = opt.auto ? opt.auto : true,

			//system & toast
			this.content = opt.content;

		this.html = document.querySelector('html');
		this.el_body = document.querySelector('body');
		this.modal;
		this.btn_close;
		this.modal_wrap;
		this.ok;
		this.cancel;
		this.last;
		this.focus;
		this.pageScroll = document.querySelector('[data-pagescroll]') ?? document.querySelector('html');
		this.select;
		this.select_btn;

		//tooltip
		this.el_tooltip_btns;

		this.isFocus = false;
		this.timer;

		switch (this.opt.type) {
			case 'system':
				this.madeSystem();
				break;

			case 'toast':
				this.madeToast();
				break;

			case 'select':
				if (!!document.querySelector('[data-id="' + this.id + '"]')) {
					this.removeSelect();
					this.madeSelect();
				}
				break;

			case 'tooltip':
				this.tooltip();
				break;

			default: // modal, bottom, dropdown
				if (this.opt.src) {
					this.setFetch();
				}
				else {
					this.el.modal = document.querySelector('.mdl-layer[data-id="' + this.opt.id + '"]');

					this.modal = document.querySelector('.mdl-layer[data-id="' + this.opt.id + '"]');
					this.btn_close = this.modal.querySelector('.mdl-layer-close');
					this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

					switch (this.opt.type) {
						case 'modal':
							this.modal.dataset.type = 'modal';
							break;
						case 'bottom':
							this.modal.dataset.type = 'bottom';
							break;
						case 'dropdown':
							this.modal.dataset.type = 'dropdown';
							break;
					}

					this.init();
				}
				break;
		}
	}
	// initializeLayer() {
	//     switch (this.opt.type) {
	//         case 'system':
	//             this.createSystemLayer();
	//             break;
	//         case 'toast':
	//             this.createToastLayer();
	//             break;
	//         case 'select':
	//             this.createSelectLayer();
	//             break;
	//         case 'tooltop':
	//             this.createTooltipLayer();
	//             break;
	//         default:
	//             this.createModalLayer();
	//             break;
	//     }
	// }
	// createSystemLayer() {
	//     const html_system = `
	//         <section class="mdl-layer" data-id="${this.id}" data-type="alert">
	//             <div class="mdl-layer-wrap">
	//                 <div class="mdl-layer-body">
	//                     ${this.title ? `<h1 class="mdl-layer-tit">${this.title}</h1>` : ''}
	//                     <div>${this.content}</div>
	//                     <div class="mdl-button-wrap">
	//                         ${this.btn.length === 2 ? `<button type="button" class="mdl-button" data-state="cancel" data-style="primary-gray"><span>${this.btn[1].text}</span></button>` : ''}
	//                         <button type="button" class="mdl-button" data-state="ok" data-style="primary">
	//                             <span>${this.btn[0].text}</span>
	//                         </button>
	//                     </div>
	//                 </div>
	//             </div>
	//             <div class="mdl-layer-dim"></div>
	//         </section>`;
	//     this.appendToBody(html_system);

	//     this.modal = document.querySelector(`.mdl-layer[data-id="${this.id}"]`);
	//     this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');
	//     this.ok = this.modal.querySelector('.mdl-button[data-state="ok"]');
	//     this.cancel = this.modal.querySelector('.mdl-button[data-state="cancel"]');

	//     this.ok?.addEventListener('click', this.btn[0].callback);
	//     this.cancel?.addEventListener('click', this.btn[1].callback);

	//     this.init();
	// }
	removeSelect() {
		this.selectBtn = document.querySelector('.mdl-select-btn[data-select-id="' + this.id + '"]');
		this.selectLayer = document.querySelector('.mdl-layer[data-type="select"][data-id="' + this.id + '_select"]');
		this.selectBtn && this.selectBtn.remove();
		this.selectLayer && this.selectLayer.remove();
	}
	resetSelect() {
		this.selectLayer = document.querySelector('.mdl-layer[data-id="' + this.id + '_select"]');
		const layerBody = this.selectLayer.querySelector('.mdl-layer-body');
		const optionWrap = layerBody.querySelector('.mdl-select-wrap');

		optionWrap.remove();
		let html_option = `
        <ul class="mdl-select-wrap">
            ${this.madeOption()}
        </ul>`;
		layerBody.insertAdjacentHTML('beforeend', html_option);
		html_option = null;
	}
	madeOption() {
		this.select = document.querySelector('.mdl-select[data-id="' + this.id + '"]');
		const select = this.select.querySelector('select');
		const options = select.querySelectorAll('option');

		let html_option = '';
		for (let i = 0, len = options.length; i < len; i++) {
			html_option += `
            <li>
                <input type="radio" id="${this.id}_r${i}" value="${options[i].value}"  name="${this.id}_r" ${((options[i].selected) && 'checked')}>
                <label for="${this.id}_r${i}" class="mdl-select-option" data-type="radio" data-value="${options[i].value}" role="option">
                    <span>${options[i].text}</span>
                </label>
            </li>`;
		}

		return html_option;
	}
	madeSelect() {
		this.select = document.querySelector('.mdl-select[data-id="' + this.id + '"]');
		const select = this.select.querySelector('select');

		let html_select_button = `
        <button type="button" class="mdl-select-btn" data-select-id="${this.id}_select" value="${select.value}" tabindex="-1" role="combobox" aria-haspopup="listbox" aria-expanded="false">
            <span>${select.querySelector('[selected]').text}</span>
        </button>`;
		this.select.insertAdjacentHTML('beforeend', html_select_button);
		html_select_button = null;

		let html_select = `
        <section class="mdl-layer" data-id="${this.id}_select" data-type="select" role="listbox">
            <div class="mdl-layer-wrap">
                <div class="mdl-layer-header">
                    <h2>${select.title}</h2>
                    <button type="button" class="mdl-layer-close" data-material="close"  aria-label="닫기"></button>
                </div>
                <div class="mdl-layer-body">
                    <ul class="mdl-select-wrap">
                        ${this.madeOption()}
                    </ul>
                </div>
            </div>
            <div class="mdl-layer-dim"></div>
        </section>`;
		document.querySelector('body').insertAdjacentHTML('beforeend', html_select);
		html_select = null;

		this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '_select"]');
		this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');
		this.btn_close = this.modal.querySelector('.mdl-layer-close');
		this.select_btn = this.select.querySelector('.mdl-select-btn');

		select.addEventListener('change', (e) => {
			let _this = e.currentTarget;
			this.select_btn.querySelector('span').textContent = _this.querySelector('option:checked').textContent;
			this.select_btn.value = _this.value;
		});

		this.select_btn.addEventListener('click', this.show);
		this.init();
	}
	madeToast() {
		let html_toast = `
        <div class="mdl-layer ${this.classname}" data-id="${this.id}" data-type="toast" aria-live="${this.status}">
            <div class="mdl-layer-wrap">
                <div class="mdl-layer-body">${this.content}</div>
                ${!this.auto ? '<button type="button" class="mdl-layer-close" data-material="close" aria-label="닫기"></button>' : ''}
            </div>
        </div>`;
		this.el_body.insertAdjacentHTML('beforeend', html_toast);

		this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
		this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

		this.init();
	}
	madeSystem() {
		//alert & confirm
		let html_system = `
        <section class="mdl-layer" data-id="${this.id}" data-type="alert">
            <div class="mdl-layer-wrap">
                <div class="mdl-layer-body">
                    ${(!!this.title) ? `<h1 class="mdl-layer-tit">${this.title}</h1>` : ''}
                    <div>${this.content}</div>
                    <div class="mdl-button-wrap">
                        ${(this.btn.length === 2) ? `<button type="button" class="mdl-button" data-state="cancel" data-style="primary-gray"><span>${this.btn[1].text}</span></button>` : ''}
                        <button type="button" class="mdl-button" data-state="ok" data-style="primary">
                            <span>${this.btn[0].text}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="mdl-layer-dim"></div>
        </section>`;
		document.querySelector('body').insertAdjacentHTML('beforeend', html_system);
		html_system = null;

		this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
		this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');
		this.ok = this.modal.querySelector('.mdl-button[data-state="ok"]');
		this.cancel = this.modal.querySelector('.mdl-button[data-state="cancel"]');
		this.ok && this.ok.addEventListener('click', this.btn[0].callback);
		this.cancel && this.cancel.addEventListener('click', this.btn[1].callback);

		this.init();
	}
	setFetch() {
		UI.parts.include({
			id: 'body',
			src: this.opt.src + '.html',
			type: 'HTML',
			insert: true,
			callback: () => {
				const el_link = document.querySelector('link[data-usage="' + this.id + '"]');
				const el_script = document.querySelector('script[data-usage="' + this.id + '"]');

				let _script = document.createElement('script');
				_script.dataset.usage = this.id;
				_script.type = 'module';
				_script.src = this.opt.src + '.js?v=' + Date.now();

				let _link = document.createElement('link');
				_link.dataset.usage = this.id;
				_link.rel = 'stylesheet';
				_link.href = this.opt.src + '.css?v=' + Date.now();

				let _btn = document.createElement('button');
				_btn.type = 'button';
				_btn.setAttribute('aria-lable', '마지막 구간입니다. 클릭하시면 닫힙니다.');
				_btn.classList.add('mdl-layer-last');

				el_link && el_link.remove();
				el_script && el_script.remove();
				document.body.appendChild(_script);
				document.head.appendChild(_link);

				this.el.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
				this.el.btn_close = this.el.modal.querySelector('.mdl-layer-close');
				this.el.modal_wrap = this.el.modal.querySelector('.mdl-layer-wrap');
				// this.el.modal_wrap.appendChild(_btn);
				this.el.last_layer = this.el.modal.querySelector('.mdl-layer-last');

				this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
				this.btn_close = this.modal.querySelector('.mdl-layer-close');
				this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

				this.modal_wrap.appendChild(_btn);
				this.last = this.modal.querySelector('.mdl-layer-last');

				switch (this.type) {
					case 'modal':
						this.modal.dataset.type = 'modal';
						break;

					case 'dropdown':
						this.modal.dataset.type = 'dropdown';
						break;

					case 'tooltip':
						this.modal.dataset.type = 'tooltip';
						break;

					case 'select':
						this.modal.dataset.type = 'select';
						break;

					case 'toast':
						this.modal.dataset.type = 'toast';
						break;
				}

				this.init();
			}
		});
	}
	tooltip() {
		this.el_tooltip_btns = document.querySelectorAll('[data-tooltip]');

		for (let item of this.el_tooltip_btns) {
			item.addEventListener('mouseover', this.actTooltipShow);
			item.addEventListener('mouseleave', this.actTooltipHide);
		}
	}
	init() {
		//focus loop
		const keyStart = (e) => {
			if (e.shiftKey && e.key === 'Tab') {
				e.preventDefault();
				this.last.focus();
			}
		}
		const keyEnd = (e) => {
			if (!e.shiftKey && e.key === 'Tab') {
				e.preventDefault();
				this.btn_close.focus();
			}
		}

		this.btn_close && this.btn_close.removeEventListener('click', this.hide);
		this.btn_close && this.btn_close.addEventListener('click', this.hide);
		this.last && this.last.removeEventListener('click', this.hide);
		this.last && this.last.addEventListener('click', this.hide);
		this.btn_close && this.btn_close.addEventListener('keydown', keyStart);
		this.last && this.last.addEventListener('keydown', keyEnd);

		this.type === 'tooltip' && this.show();
	}
	actToastShow = (e) => {
		this.madeToast();
	}
	actTooltipShow = (e) => {
		const _this = e.currentTarget;
		this.opt.src = _this.dataset.tooltip;
		this.id = _this.getAttribute('aria-describedby');
		this.setFetch();
	}
	actTooltipHide = (e) => {
		const _this = e.currentTarget;
		const _id = _this.getAttribute('aria-describedby');
		const _files = document.querySelectorAll('[data-usage="' + _id + '"]');
		const _tooltip = document.querySelector('#' + _id);

		for (let item of _files) {
			item.remove();
		}
		_tooltip.remove();
	}
	actSelected = (e) => {
		let _this = e.currentTarget;

		if (_this.type === 'radio') {
			_this = this.modal.querySelector('.mdl-select-option[for="' + _this.id + '"]');
		}
		this.select.querySelector('.mdl-select-btn span').textContent = _this.textContent;
		this.select.querySelector('.mdl-select-btn').value = _this.dataset.value;
		this.select.querySelector('select option[value="' + _this.dataset.value + '"]').selected = true;

		e.type !== 'keyup' && this.hide();

		this.callback && this.callback({
			text: _this.textContent,
			value: _this.dataset.value
		});
	}
	show = (e) => {
		if (this.type === 'toast') {
			if (this.modal.dataset.state === 'show') {
				console.log('열려있음');
				return false;
			}
			console.log('toast show: ', this.modal);
		}

		const _zindex = 100;
		const _prev = document.querySelector('[data-layer-current="true"]');
		let btn = false;

		(this.type === 'select') ? btn = document.querySelector('.mdl-select-btn[data-select-id="' + this.id + '_select"]') : '';
		(this.type === 'dropdown') ? btn = document.querySelector('[data-dropdown="' + this.id + '"]') : '';
		(this.type === 'tooltip') ? btn = document.querySelector('.mdl-tooltip[aria-describedby="' + this.id + '"]') : '';

		//object position : dropdown & select & tooltip
		if (this.type === 'dropdown' || this.type === 'select' || this.type === 'tooltip') {
			const ps_info = {
				m_width: this.modal.offsetWidth,
				m_height: this.modal.offsetHeight,
				height: btn.offsetHeight,
				width: btn.offsetWidth,
				top: btn.getBoundingClientRect().top,
				left: btn.getBoundingClientRect().left,
				sc_top: this.pageScroll.scrollTop,
				sc_left: this.pageScroll.scrollLeft,
			}
			let _top, _left;

			!this.ps ? this.ps = 'BL' : '';

			switch (this.ps) {
				case 'TL':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left)) + 'px';
					break;
				case 'TC':
					break;
				case 'TR':
					break;
				case 'BL':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left)) + 'px';
					break;
				case 'BC':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left) + (ps_info.width / 2) - (ps_info.m_width / 2)) + 'px';
					break;
				case 'BR':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left) - (ps_info.m_width - ps_info.width)) + 'px';
					break;

				case 'LT':
					break;
				case 'LC':
					break;
				case 'LB':
					break;
				case 'RT':
					break;
				case 'RC':
					break;
				case 'RB':
					break;
			}

			this.modal.style.top = _top;
			this.modal.style.left = _left;
		}
		else {
			this.html.dataset.modal = 'show';
		}

		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			_prev ? _prev.dataset.layerCurrent = 'false' : '';
			this.modal.dataset.layerCurrent = 'true';
		}

		this.modal || this.src && this.setFetch();
		this.modal.dataset.state = 'show';
		this.focus = document.activeElement;

		// toast, tooltip 자동 생성 자동 hidden 제외
		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			this.html.dataset.layerN = !this.html.dataset.layerN ? 1 : Number(this.html.dataset.layerN) + 1;
			this.modal.style.zIndex = Number(_zindex) + Number(this.html.dataset.layerN);
			this.modal.dataset.layerN = this.html.dataset.layerN;
		}

		this.btn_close && this.btn_close.focus();

		// select layer
		if (this.type === 'select') {
			console.log(this.select_btn.offsetWidth, this.select_btn.dataset.selectId);
			document.querySelector('.mdl-layer[data-id="' + this.select_btn.dataset.selectId + '"]').style.width = (this.select_btn.offsetWidth / 10) + 'rem';

			const el_options = this.modal.querySelectorAll('.mdl-select-option');
			const el_inputs = this.modal.querySelectorAll('input');
			const el_options_checked = this.modal.querySelector('input:checked');

			this.select_btn.setAttribute('aria-expanded', true);
			this.select_btn.removeEventListener('click', this.show);

			el_options_checked && el_options_checked.focus();

			for (let i = 0, len = el_options.length; i < len; i++) {
				el_options[i].addEventListener('click', this.actSelected);
				el_inputs[i].addEventListener('keydown', this.keyCheck);
				el_inputs[i].addEventListener('keyup', this.keyCheck);
				el_options[i].addEventListener('focusout', this.keyCheck);
				el_inputs[i].addEventListener('focusin', this.foucsOutCheck);
			}

			setTimeout(() => {
				this.html.addEventListener('click', this.backClick);
			}, 0);
		}
		else if (this.type === 'toast' && this.auto) {
			this.timer = setTimeout(() => {
				this.hide();
			}, this.delaytime);
		}

		this.callback && this.callback();

	}
	backClick = (e) => {
		//mouse click, touch 인 경우만 실행. ''값은 방향키로 이동 시
		if (e.pointerType !== '') {
			e.srcElement.querySelector('.mdl-layer[role="listbox]') ?? this.hide();
		}

	}
	foucsOutCheck = () => {
		clearTimeout(this.timer);
	}
	keyCheck = (e) => {
		switch (e.keyCode) {
			case 13: e.type === 'keydown' && this.actSelected(e);
				break;
			case 38:
			case 40: e.type === 'keyup' && this.actSelected(e);
				break;
			default: e.type === 'keydown' ? this.timer = setTimeout(this.hide, 300) : '';
				break;
		}
	}
	hidden = () => {
		const _prev = document.querySelector('[data-layer-current="true"]');
		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			_prev.dataset.layerCurrent = 'false';
		}
		// this.modal.dataset.layerCurrent = 'true';

		this.modal_wrap.removeEventListener('animationend', this.hidden);
		this.modal.dataset.state = 'hidden';
		this.html.dataset.modal = 'hidden';

		this.select_btn && this.select_btn.setAttribute('aria-expanded', false);
		this.focus.focus();

		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			console.log(Number(this.html.dataset.layerN));
			if (Number(this.html.dataset.layerN) !== 0) {
				document.querySelector('.mdl-layer[data-layer-n="' + this.html.dataset.layerN + '"]').dataset.layerCurrent = 'true';
			}
		}

		if (this.type === 'tooltip') {
			console.log('tooltip', this.modal);
			this.modal.remove();
		}
	}
	hideAct = () => {
		clearTimeout(this.timer);
		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			this.html.dataset.layerN = Number(this.html.dataset.layerN) - 1;
		} else if (this.type === 'toast') {
			const _state = document.querySelector('.mdl-layer[data-id="' + this.id + '"]').dataset.state;

			console.log('hide', Number(this.html.dataset.layerN));
			this.html.dataset.layerN = Number(this.html.dataset.layerN) - 1;
		}

		this.select_btn && this.select_btn.addEventListener('click', this.show);
		this.html.removeEventListener('click', this.backClick);
		this.modal.dataset.state = 'hide';
		this.modal_wrap.addEventListener('animationend', this.hidden);
	}
	hide = () => {
		if (this.callback_close) {
			this.callback_close && this.callback_close();
		} else {
			this.hideAct();
		}
	}
}

