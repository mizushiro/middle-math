export default class Range {
    /**
     * 
     * @param {el_} element 
     * @param {ar_} array 
     * @param {st_} string 
     * @param {nu_} number 
     * @param {is} 'ture/false'
     */
    constructor(opt) {
        this.st_id = opt.id;
        this.st_title = opt.title;
        this.ar_value = opt.value;
        this.ar_text = opt.text;
        this.ar_tickmark = opt.tickmark;
        this.nu_step = opt.step;
        this.nu_min = opt.min;
        this.nu_max = opt.max;
        this.callback = opt.callback;

        this.el_range = document.querySelector('.mdl-range[data-id="'+ this.st_id +'"]');
        this.el_from = this.el_range.querySelector('.mdl-range-inp[data-range="from"]');
        this.el_to = this.el_range.querySelector('.mdl-range-inp[data-range="to"]');
        this.el_track = this.el_range.querySelector('.mdl-range-track');
        this.el_pointer_from;
        this.el_pointer_to;
        this.el_bar;
        
        this.isSingle = this.el_to ? false : true;
        this.isMark_from;
        this.isMark_to;

        this.timer;
        this.init();
    }
    init() {
        this.el_from.min = this.nu_min;
        this.el_from.max = this.nu_max;
        this.el_from.value = this.ar_value[0];
        this.el_from.classList.add('on');
        this.el_from.setAttribute('list', this.st_id + '_from');
        
        let html_track = '<div class="mdl-range-track">';
        let html_tickmarks_from = '';
        let html_tickmarks_to = '';
        
        let vleft = ((this.ar_value[0] / this.nu_max) * 100);
        
        if (this.isSingle === false) {
            this.el_to.min = this.nu_min;
            this.el_to.max = this.nu_max;
            this.el_to.value = this.ar_value[1];
            this.el_to.setAttribute('list', this.st_id + '_to');

            html_tickmarks_from += '<div class="mdl-range-marks" id="'+ this.st_id +'_tickmarks_from" data-from="true">';
            html_tickmarks_to += '<div class="mdl-range-marks" id="'+ this.st_id +'_tickmarks_to" data-to="true">';

            for (let i = 0, len = this.ar_tickmark.length; i < len; i++) {
                if (i > this.ar_value[1]) {
                    html_tickmarks_from += '<button class="mdl-range-btn" type="button" data-id="' + this.st_id + '_from" data-value="'+ i +'" disabled><span>'+ this.ar_tickmark[i] +'</span></button>';
                } else {
                    html_tickmarks_from += '<button class="mdl-range-btn" type="button" data-id="' + this.st_id + '_from" data-value="'+ i +'"><span>'+ this.ar_tickmark[i] +'</span></button>';
                }

                if (i < this.ar_value[0]) {
                    html_tickmarks_to += '<button class="mdl-range-btn" type="button" data-id="' + this.st_id + '_to" data-value="'+ i +'" disabled><span>'+ this.ar_tickmark[i] +'</span></button>';
                } else {
                    html_tickmarks_to += '<button class="mdl-range-btn" type="button" data-id="' + this.st_id + '_to" data-value="'+ i +'"><span>'+ this.ar_tickmark[i] +'</span></button>';
                }
            }
            html_tickmarks_from += '</div>';             
            html_tickmarks_to += '</div>';

            this.el_range.insertAdjacentHTML('beforeend', html_tickmarks_from);
            this.el_range.insertAdjacentHTML('beforeend', html_tickmarks_to);
            html_tickmarks_from = null;
            html_tickmarks_to = null;

            const vright = 100 - ((this.ar_value[1] / this.nu_max) * 100);

            html_track += '<div class="mdl-range-bar" style="left:'+ vleft +'%; right: '+ vright +'%;"><em class="mdl-range-txt"></em></div>';
            html_track += '<span class="left mdl-range-point on" data-range="from" aria-hidden="true" style="left: '+ vleft +'%;"><em class="mdl-range-txt" data-from="'+ this.st_id +'"></em></span>';
            html_track += '<span class="right mdl-range-point" data-range="to" aria-hidden="true" style="right: '+ vright +'%;"><em class="mdl-range-txt" data-to="'+ this.st_id +'"></em></span>'; 
        } else {
            html_tickmarks_from += '<div class="mdl-range-marks" id="'+ this.st_id +'_tickmarks_from" data-from="true">';

            for (let i = 0, len = this.ar_tickmark.length; i < len; i++) {
                html_tickmarks_from += '<button class="mdl-range-btn"  data-id="' + this.st_id + '_from"  type="button" data-value="'+ i +'"><span>'+ this.ar_tickmark[i] +'</span></button>';
            }
                        
            html_tickmarks_from += '</div>';

            this.el_range.insertAdjacentHTML('beforeend', html_tickmarks_from);
            html_tickmarks_from = null;

            html_track += '<div class="mdl-range-bar" style="width:'+ vleft +'%;"></div>';
            html_track += '<span class="left mdl-range-point on" data-range="from" aria-hidden="true" style="left: '+ vleft +'%;"><em class="mdl-range-txt" data-from="'+ this.st_id +'"></em></span>';
        }

        html_track += '</div>';
        this.el_range.insertAdjacentHTML('beforeend', html_track);
        html_track = null;

        this.el_pointer_from = this.el_range.querySelector('.mdl-range-point[data-range="from"]');
        this.el_pointer_to = this.el_range.querySelector('.mdl-range-point[data-range="to"]');
        this.el_bar = this.el_range.querySelector('.mdl-range-bar');
        this.isMark_from = this.el_range.querySelector('.mdl-range-marks[data-from="true"]');
        this.isMark_to = this.el_range.querySelector('.mdl-range-marks[data-to="true"]');

        const tickmark_btns = this.el_range.querySelectorAll('.mdl-range-btn');

        for (let item of tickmark_btns) {
            item.addEventListener('click', this.actClick);
        }
        
        this.el_from.addEventListener('input', this.act);
        this.el_to && this.el_to.addEventListener('input', this.act);
    }
    tickmarks = () => {
        const from_btns = this.isMark_from.querySelectorAll('.mdl-range-btn');
        const to_btns = this.isMark_to?.querySelectorAll('.mdl-range-btn');
        if (this.isSingle === false) {
            for (let i = 0, len = this.ar_tickmark.length; i < len; i++) {
                if (to_btns) {
                    if (i >= this.ar_value[0]) {
                        to_btns[i].disabled = false;
                    } else {
                        to_btns[i].disabled = true;
                    }
                }

                if (i <= this.ar_value[1]) {
                    from_btns[i].disabled = false;
                } else {
                    from_btns[i].disabled = true;
                }
            }
        }
    }
    actClick = (e) => {
        const _this = e.currentTarget;
        const _inp = this.el_range.querySelector('.mdl-range-inp[list="'+ _this.dataset.id +'"]');
        const isFrom = _this.closest('.mdl-range-marks[data-from]');
        console.log(_inp, _this.dataset.id);

        _inp.value = _this.dataset.value;
        let vleft = (_this.dataset.value / this.nu_max) * 100;
        let vright;

        if (!isFrom) {
            vright = 100 - ((_this.dataset.value / this.nu_max) * 100);
            this.el_pointer_to.style.right = vright + '%';
            this.el_bar.style.right = vright + '%';
            this.ar_value[1] = _this.dataset.value;
        } else {
            this.el_pointer_from.style.left = vleft + '%';
            this.el_bar.style.left = vleft + '%';
            this.ar_value[0] = _this.dataset.value;
        }
        this.tickmarks();
    }
    act = (e) => {       
        const _this = e.target;
        const _rangeState = _this.dataset.range;
        
        let vleft;
        let vright;

        if (this.el_to) {
            if (_rangeState === 'from') {
                if (Number(this.el_from.value) > Number(this.el_to.value)) {
                    this.el_from.value = this.el_to.value;
                    this.el_range.classList.add('same');
                } else {
                    this.el_range.classList.remove('same');
                }
                vleft = (this.el_from.value / this.nu_max) * 100;
                this.el_pointer_from.style.left = vleft + '%';
                this.el_from.classList.add('on');
                this.el_to.classList.remove('on');
                this.el_pointer_from.classList.add('on');
                this.el_pointer_to.classList.remove('on');
                this.ar_value[0] = this.el_from.value;
            } else {
                if (Number(this.el_from.value) > Number(this.el_to.value)) {
                    this.el_to.value = this.el_from.value;
                    this.el_range.classList.add('same');
                } else {
                    this.el_range.classList.remove('same');
                }
                vright = 100 - ((this.el_to.value / this.nu_max) * 100);
                this.el_pointer_to.style.right = vright + '%';
                this.el_to.classList.add('on');
                this.el_from.classList.remove('on');
                this.el_pointer_to.classList.add('on');
                this.el_pointer_from.classList.remove('on');
                this.ar_value[1] = this.el_to.value;
            }
            this.el_bar.style.left = vleft + '%';
            this.el_bar.style.right = vright + '%';
        } else {
            vleft = (this.el_from.value / this.nu_max) * 100;
            this.el_pointer_from.style.left = vleft + '%';
            this.el_bar.style.width = vleft + '%';
            this.ar_value[0] = this.el_from.value;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(this.tickmarks, 200);

        this.callback && this.callback({
            id: this.st_id,
            value: this.ar_value
        });
    }
}
