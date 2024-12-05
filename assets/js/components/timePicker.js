export default class TimeSelect {
	constructor(opt) {
		this.id = opt.id;
		this.min = "00:00";
		this.max = "24:00";
		this.value = opt.value;
		this.middayUnit = ['오전', '오후'];
		this.miuntUnit = opt.miuntUnit;
		this.timerWheel = null;
		this.nowScrollTop = 0;
		this.hUnit = 0;
		this.el_time = document.querySelector('.mdl-time[data-id="'+ this.id +'"]')

		this.init();
	}
	init () {
		const txt_midday = this.middayUnit;
		const min_time = !!this.min ? this.min : null;
		const max_time = !!this.max ? this.max : null;
		const time = this.value;

		let _time = time.split(':');
		let _time_min = min_time.split(':');
		let _time_max = max_time.split(':');
		let hour = Number(_time[0]);
		let minute = Number(_time[1]);
		let hour_min = Number(_time_min[0]) - 1 < 0 ? 0 : Number(_time_min[0]) - 1;
		let hour_max = Number(_time_max[0]);
		let minute_min = Number(_time_min[1]);
		let minute_max = Number(_time_max[1]);
		let isPM = 0;
		let hour12 = hour;
		let hour_len = 24;

		hour === 0 ? hour = 24 : '';
		hour > 11 ? isPM = 1 : '';
		hour > 23 ? isPM = 0 : '';

		let html = '';
		html += '<div class="mdl-time-wrap">';
		html += '<div class="mdl-time-line"><div></div><div></div><div></div></div>';
		html += '<div class="mdl-time-midday" data-type="midday"><div class="mdl-time-group"></div></div>';
		html += '<div class="mdl-time-hour" data-type="hour"><div class="mdl-time-group"></div></div>';
		html += '<div class="mdl-time-minute" data-type="minute"><div class="mdl-time-group"></div></div>';
		html += '</div>';
		this.el_time.insertAdjacentHTML('beforeend', html);
		html = '';

		const el_midday = this.el_time.querySelector('.mdl-time-midday');
		const el_hour = this.el_time.querySelector('.mdl-time-hour');
		const el_minute = this.el_time.querySelector('.mdl-time-minute');
		
		this.el_time.dataset.midday = isPM;
		this.el_time.dataset.hour = hour;
		this.el_time.dataset.minute = minute;
		this.el_time.dataset.hourMin = Number(_time_min[0]);
		this.el_time.dataset.hourMax = Number(_time_max[0]);
		this.el_time.dataset.minuteMin = Number(_time_min[1]);
		this.el_time.dataset.minuteMax = Number(_time_max[1]);

		//오전,오후
		for (let i = 0; i < 2; i++) {
			const group = el_midday.querySelector('.mdl-time-group');
			let btn = document.createElement('button');
			btn.type = 'button';
			btn.value = i;
			btn.textContent = txt_midday[i];

			if (isPM === i) {
				btn.dataset.selected = true;
			}

			group.appendChild(btn);
			btn = '';				
		}

		//시간
		for (let i = 1; i < hour_len + 1; i++) {
			const group = el_hour.querySelector('.mdl-time-group');
			let btn = document.createElement('button');

			btn.type = 'button';
			btn.value = i;
			btn.textContent = i > 12 ? i - 12 : i;
			
			if ((hour_min + 1 > i && hour_min !== null) || (hour_max < i && hour_max !== null)) {
				btn.disabled = true;
			}
			if (hour === i) {
				btn.dataset.selected = true;
			} 

			group.appendChild(btn);
			btn = '';
		}

		//분
		for (let i = 0; i < 60; i++) {
			if (i === 0 || i % this.miuntUnit === 0) {
				const group = el_minute.querySelector('.mdl-time-group');
				let btn = document.createElement('button');

				btn.type = 'button';
				btn.value = UI.parts.add0(i);
				btn.textContent = UI.parts.add0(i);

				if ((minute_min > i && minute_min !== null && minute_min !== minute_max) || (minute_max < i && minute_max !== null && minute_min !== minute_max)){
					btn.disabled = true;
				}
				if (minute === i) {
					btn.dataset.selected = true;
				}

				group.appendChild(btn);
			}
		}

		this.hUnit = el_hour.querySelectorAll('button')[0].offsetHeight;
		UI.scroll.move({ 
			top: Number(this.hUnit * (isPM ? 1 : 0)), 
			selector: el_midday, 
			effect: 'auto', 
			align: 'default' 
		});
		UI.scroll.move({ 
			top: Number(this.hUnit * (hour - 1)), 
			selector: el_hour, 
			effect: 'auto', 
			align: 'default' 
		});
		UI.scroll.move({ 
			top: Number(this.hUnit * Number(minute / this.miuntUnit)), 
			selector: el_minute, 
			effect: 'auto', 
			align: 'default' 
		});

		//event
		const el_midday_btns = el_midday.querySelectorAll('button');
		const el_hour_btns = el_hour.querySelectorAll('button');
		const el_minute_btns = el_minute.querySelectorAll('button');

		for (let btn of el_minute_btns) {
			btn.addEventListener('click', this.action);
		}
		for (let btn of el_hour_btns) {
			btn.addEventListener('click', this.action);
		}
		for (let btn of el_midday_btns) {
			btn.addEventListener('click', this.action);
		}
		
		el_midday.removeEventListener('touchstart', this.action);
		el_hour.removeEventListener('touchstart', this.action);
		el_minute.removeEventListener('touchstart', this.action);

		el_midday.addEventListener('touchstart', this.action);
		el_hour.addEventListener('touchstart', this.action);
		el_minute.addEventListener('touchstart', this.action);

		el_midday.addEventListener('mousedown', this.action);
		el_hour.addEventListener('mousedown', this.action);
		el_minute.addEventListener('mousedown', this.action);

		el_midday.addEventListener('wheel', this.action);
		el_hour.addEventListener('wheel', this.action);
		el_minute.addEventListener('wheel', this.action);
	}
	set(opt) {
		this.value = opt.value;

		const min_time = !!this.min ? this.min : null;
		const max_time = !!this.max ? this.max : null;
		const time = this.value;

		let _time = time.split(':');
		let _time_min = min_time.split(':');
		let _time_max = max_time.split(':');
		let hour = Number(_time[0]);
		let minute = Number(_time[1]);
		let isPM = 0;

		hour === 0 ? hour = 24 : '';
		hour > 11 ? isPM = 1 : '';
		hour > 23 ? isPM = 0 : '';

		const el_midday = this.el_time.querySelector('.mdl-time-midday');
		const el_hour = this.el_time.querySelector('.mdl-time-hour');
		const el_minute = this.el_time.querySelector('.mdl-time-minute');
		
		const el_midday_btn = el_midday.querySelector('[data-selected="true"]');
		const el_hour_btn = el_hour.querySelector('[data-selected="true"]');
		const el_minute_btn = el_minute.querySelector('[data-selected="true"]');

		const el_midday_btns = el_midday.querySelectorAll('button');
		const el_hour_btns = el_hour.querySelectorAll('button');
		const el_minute_btns = el_minute.querySelectorAll('button');
		
		const n_midday =  Number((isPM ? 1 : 0));
		const n_hour =  Number((hour - 1));
		const n_minute =  Number(minute / this.miuntUnit);

		el_midday_btn.removeAttribute('data-selected');
		el_hour_btn.removeAttribute('data-selected');
		el_minute_btn.removeAttribute('data-selected');
		el_midday_btns[n_midday].dataset.selected = 'true';
		el_hour_btns[n_hour].dataset.selected = 'true';
		el_minute_btns[n_minute].dataset.selected = 'true';

		this.el_time.dataset.midday = isPM;
		this.el_time.dataset.hour = hour;
		this.el_time.dataset.minute = minute;
		this.el_time.dataset.hourMin = Number(_time_min[0]);
		this.el_time.dataset.hourMax = Number(_time_max[0]);
		this.el_time.dataset.minuteMin = Number(_time_min[1]);
		this.el_time.dataset.minuteMax = Number(_time_max[1]);

		UI.scroll.move({ 
			top: Number(this.hUnit * n_midday), 
			selector: el_midday, 
			effect: 'auto', 
			align: 'default' 
		});
		UI.scroll.move({ 
			top: Number(this.hUnit * n_hour), 
			selector: el_hour, 
			effect: 'auto', 
			align: 'default' 
		});
		UI.scroll.move({ 
			top: Number(this.hUnit * n_minute), 
			selector: el_minute, 
			effect: 'auto', 
			align: 'default' 
		});
	}
	action = (e) => {
		const _this = this;
		const event = e;
		const that = e.currentTarget;
		const eType = e.type;
		const unit = this.miuntUnit;
		const el_time = that.closest('.mdl-time');
		const el_wrap = that.closest('.mdl-time-wrap');
		const el_midday = el_wrap.querySelector('.mdl-time-midday');
		const el_midday_button = el_midday.querySelectorAll('button');
		const el_hour = el_wrap.querySelector('.mdl-time-hour');
		const el_hour_button = el_hour.querySelectorAll('button');

		let isPM = Number(el_wrap.dataset.midday);
		let timerScroll = null;
		let touchMoving = null;
		let type_time = null;
		let that_wrap = null;
		let wrapT = 0;
		let getScrollTop = 0;
		let currentN = 0;
		let actEnd;
		let midday_n;

		const selectedInit = (v, el) => {
			const n = v;
			const btns = el;
			const val = btns[n].value;
			
			for (let i = 0, len = btns.length; i < len; i++) {
				if (!!btns[i].dataset.selected) {
					delete btns[i].dataset.selected;
				}
				if (val === btns[i].value) {
					btns[i].dataset.selected = true;
				} 
			}
			if (type_time === 'hour') {
				if (val < 12) {
					isPM = 0;
					el_midday_button[0].dataset.selected = true;
					el_midday_button[1].dataset.selected = false;
				} else if (val > 11 && val < 24) {
					isPM = 1;
					el_midday_button[1].dataset.selected = true;
					el_midday_button[0].dataset.selected = false;
				} else if (val > 23 ) {
					isPM = 0;
					el_midday_button[0].dataset.selected = true;
					el_midday_button[1].dataset.selected = false;
				}
				
				UI.scroll.move({ 
					top: Number(this.hUnit * isPM), 
					selector: el_midday
				});
				
				el_wrap.dataset.hour = currentN + 1;
				el_wrap.dataset.midday = isPM;
			}
		}
		const scrollSelect = (v, el) => {
			const btn = el.querySelectorAll('button');
			const len = btn.length;
			const n = v < 0 ? 0 : v > len - 1 ? len - 1 : v;
			
			el.scrollTo({
				top: this.hUnit * n,
				behavior: 'smooth'
			});
			selectedInit(n, el.querySelectorAll('button'));

		}
		const actMove = () => {
			touchMoving = true;
			getScrollTop = Math.abs(that_wrap.getBoundingClientRect().top - wrapT);
			that.addEventListener('touchcancel', actEnd);
			that.addEventListener('touchend', actEnd);

		}
		const actValue = (v, w) => {
			let n_hour = Number(v.dataset.hour);
			currentN = Math.floor((Math.floor(getScrollTop) + (this.hUnit / 2)) / this.hUnit);

			switch (eType) {
				case 'touchstart' :
				case 'mousedown' :
				case 'wheel' :
					scrollSelect(currentN, that);
					break;

				case 'click' : 
					currentN = w;
					break;
			}

			//dataset 값 설정
			switch (type_time) {
				case 'midday':
					if (!n_hour) {
						n_hour = Number(el_time.dataset.hour);
					}
					eType === 'mousedown' ? currentN = midday_n : '';
					el_hour_button[n_hour - 1].dataset.selected = false;

					if (currentN < 1) {
						//오전
						if (n_hour === 12) {
							isPM = 1;
							n_hour = n_hour + 12;
						} else if (n_hour > 12) {
							isPM = 0;
							n_hour = n_hour - 12;
						} else {
							isPM = 0;
						}
					} else {
						//오후
						if (n_hour === 24) {
							isPM = 0;
							n_hour = n_hour - 12;
						} else if (n_hour < 12) {
							isPM = 1;
							n_hour = n_hour + 12;
						} else {
							isPM = 1;
						}
					}

					el_hour_button[n_hour - 1].dataset.selected = true;
					UI.scroll.move({ 
						top: Number(this.hUnit * (n_hour - 1)), 
						selector: el_hour
					});

					el_wrap.dataset.midday = isPM;
					el_wrap.dataset.hour = n_hour;
					break;
				
				case 'minute':
					el_wrap.dataset.minute = UI.parts.add0(currentN * unit);
					break;
			}

			const _m = el_time.querySelector('.mdl-time-minute button[data-selected="true"]').value;
			const _h = el_time.querySelector('.mdl-time-hour button[data-selected="true"]').value;

			el_time.dataset.minute = _m;
			el_time.querySelector('.mdl-time-wrap').dataset.minute = _m;
			el_time.dataset.hour = _h;
			el_time.querySelector('.mdl-time-wrap').dataset.hour = _h;
		}
		
		//touch 이벤트 종료시 가까운 값으로 추가 이동
		actEnd = () => {
			const scrollCompare = () => {
				timerScroll = setTimeout(() => {
					if (getScrollTop !== Math.abs(that_wrap.getBoundingClientRect().top - wrapT)) {
						getScrollTop = Math.abs(that_wrap.getBoundingClientRect().top - wrapT);
						scrollCompare();
					} else {
						actValue(that_wrap.closest('.mdl-time-wrap'));
					}
					that.removeEventListener('touchmove', actMove);
					that.removeEventListener('touchend', actEnd);
					that.removeEventListener('touchcancel', actEnd);
				},20);
			} 
			touchMoving && scrollCompare();
		}
		
		//이벤트 click & touch
		const eventList = {
			click (){
				const el_p = that.parentNode;
				const el_pp = that.parentNode.parentNode;
				const btns = el_p.querySelectorAll('button');
				const nodes = [... e.target.parentElement.children];
				let index = Number(nodes.indexOf(e.target));

				that_wrap = el_pp.querySelector('.mdl-time-group');
				type_time = el_pp.dataset.type;
				wrapT = el_pp.getBoundingClientRect().top;
				currentN = 0;
				
				el_pp.scrollTo({
					top: _this.hUnit * index,
					behavior: 'smooth'
				});
				
				
				selectedInit(index, btns);
			},
			wheel(){
				type_time = that.dataset.type;
				that_wrap = that.closest('.mdl-time-wrap');
				
				event.preventDefault();
				if (event.deltaY > 0) {//아래로
					getScrollTop = that.scrollTop + _this.hUnit;
				} else if (event.deltaY < 0) {//위로
					getScrollTop = that.scrollTop - _this.hUnit;
				}
				actValue(that_wrap);
			},
			mousedown() {
				const btns = that.querySelectorAll('button');
				const tn = that.scrollTop;
				const ts = e.pageY - tn;

				if (e.target.type !== 'button') {
					return false
				}

				const _wrap = e.target.closest('.mdl-time-midday');
				_wrap ? midday_n = e.target.value : midday_n = null;

				type_time = that.dataset.type;
				that_wrap = that.querySelector('.mdl-time-group');
				wrapT = that.getBoundingClientRect().top;
				
				const onMouseMove = (e) => {
					const tm = e.pageY - tn;
					that.scrollTo(0, tn + ts - tm);

					for (let btn of btns) {
						btn.removeEventListener('click', _this.action);
					}
				}
				
				document.addEventListener('mousemove', onMouseMove);
				document.onmouseup = (e) => {
					
					document.removeEventListener('mousemove', onMouseMove);
					document.onmouseup = null;
					getScrollTop = Math.abs(that_wrap.getBoundingClientRect().top - wrapT);

					actValue(that_wrap.closest('.mdl-time'));

					setTimeout(() => {
						for (let btn of btns) {
							 btn.addEventListener('click',_this.action);
						}
					},0);
				}
			},
			touchstart() {
				that_wrap = that.querySelector('.mdl-time-group');
				type_time = that.dataset.type;
				wrapT = that.getBoundingClientRect().top;
				currentN = 0;
				getScrollTop = Math.abs(that_wrap.getBoundingClientRect().top - wrapT);

				clearTimeout(timerScroll);
				that.addEventListener('touchmove', actMove);
			}
		}
		eventList[eType]();
	}
}