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

  Global.PDFbook = {

  }

})();

class PDFeBook {
	constructor(opt) {
    this.data = opt.data;
    this.id = opt.id;
    this.group = document.querySelector('.ebook-flip--group');
    
    this.init();
  }
  init() {
    const ebook_flip = document.querySelector('.ebook-flip');

    for(let i = 0, len = this.data.length; i < len; i++) {
      this.group.insertAdjacentHTML('beforeend', `<div class="page"><img src="${this.data[i]}" alt=""></div>`);
    }

    const html_control = `<div class="ebook-flip--control">
      <button type="button" class="ebook-flip--btn" data-act="prev">prev</button>
      <button type="button" class="ebook-flip--btn" data-act="next">next</button>
    </div>

    <div class="ebook-flip--foot">
      <button type="button" class="ebook-flip--btn" data-act="first">first</button>
      <button type="button" class="ebook-flip--btn" data-act="prev">prev</button>
      <div class="ebook-flip--number">
        <b class="ebook-flip--number-current"></b> / <span class="ebook-flip--number-total"></span>
      </div>
      <button type="button" class="ebook-flip--btn" data-act="next">next</button>
      <button type="button" class="ebook-flip--btn" data-act="last">last</button>
    </div>`;
    ebook_flip.insertAdjacentHTML('beforeend', html_control);

    const page_current = document.querySelector('.ebook-flip--number-current');
    const page_total = document.querySelector('.ebook-flip--number-total');
    const page_btns = document.querySelectorAll('.ebook-flip--btn');
    
    UI.ebook = {};
    UI.ebook[this.id] = new St.PageFlip(
      document.getElementById(this.id),
      {
        // start page index
        width: 550,
        height: 733,
        size: "stretch",
        minWidth: 315,
        maxWidth: 1e3,
        minHeight: 400,
        maxHeight: 1533,
        maxShadowOpacity: .5,
        // showCover: !0,
        mobileScrollSupport: !1,
      }
    );
    const pageFlip = UI.ebook[this.id];

    // pageFlip.loadFromImages(['./page1.jpg', './page2.jpg', './page3.jpg', './page4.jpg', './page2.jpg', './page3.jpg', './page4.jpg']);
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    pageFlip.on('flip', (e) => {
      console.log("Current page: " + e.data);
      // ca llback code
      page_current.textContent = pageFlip.getCurrentPageIndex() + 1;
    });

    page_current.textContent = pageFlip.getCurrentPageIndex() + 1;
    page_total.textContent = pageFlip.getPageCount()  ;

    const pageMove = (e) => {
      const _this = e.target;
      const _data = _this.dataset.act;

      switch(_data) {
        case 'prev': pageFlip.flipPrev(); break;
        case 'next': pageFlip.flipNext(); break;
        case 'first': pageFlip.turnToPage(0); break;
        case 'last': pageFlip.turnToPage(pageFlip.getPageCount() -  1); break;
      }
    }
    page_btns.forEach((item) => {
      item.addEventListener('click', pageMove);
    });

  }
}