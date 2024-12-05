/**
 * counter up slot effect motion
 * option
 *  @param {string} opt.id 유니크한 아이디
 *  @param {number} opt.value 숫자로 ,를 제외한 순수한 숫자
 *  @param {() => {}} opt.callback 모션 완료 후 실행.
 */

class CounterUpSlotResult {
    constructor(opt) {
        this.id = opt.id;
        this.callback = opt.callback;
        this.value = opt.value;
        this.el = document.querySelector('.mdl-count[data-id="'+ this.id +'"]');
        this.items;
        this.h = this.el.offsetHeight;
        this.init();
    }
    init() {
        const n = UI.parts.comma(this.value);
        const len = n.length;
        
        const html_number = '<span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>';
        const html_comma = '<span style="height:'+ this.h + 'px">';
        let html_item = '';
        
        for (let i = 0; i < len; i++) {
            const _n = (Number(n.substr(i, 1)));

            if (isNaN(_n)) {
                html_item += '<span class="mdl-count-item" style="height:'+ this.h + 'px"><span class="mdl-count-num">';
                html_item += html_comma + n.substr(i, 1) + '</span>';
            } else {
                html_item += '<span class="mdl-count-item" data-n="'+ n.substr(i, 1) +'"><span class="mdl-count-num">';
                html_item += html_number;
            }
            html_item += '</span></span>';
        }

        this.el.setAttribute('aria-label', n);
        this.el.insertAdjacentHTML('beforeend', html_item);
        this.items = this.el.querySelectorAll('.mdl-count-item[data-n]');

        html_item = null;
    }
    act() {
        const len = this.items.length;
        let loop = 0;
        const act = () => {
            const item = this.items[(len - 1) - loop];
            const n = Number(item.dataset.n);
            const _num = item.querySelector('.mdl-count-num');
            let add = n < 7 ? 10 : 0;

            _num.style.transition = 'transform '+ 1.3 +'s cubic-bezier(.21,-0.04,.66,1.21)';

            setTimeout(() => {
                _num.style.transform = 'translateY(-'+ (this.h * (n + add)) +'px)';
            },0);

            setTimeout(() => {
                loop = loop + 1;

                if (loop < len) {
                    act();
                } else {
                    _num.addEventListener('transitionend', () => {
                        this.callback && this.callback();
                    });
                }                 
            }, 200);
        }
        act();
    }
}

class CounterUpSlotLive {
    constructor(opt) {
        this.id = opt.id;
        this.callback = opt.callback;
        this.value = opt.value;
        this.valuePrev = this.value;
        this.el = document.querySelector('.mdl-count[data-id="'+ this.id +'"]');
        this.items;
        this.h = this.el.offsetHeight;
        this.html_number = '<span>9</span><span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span>';
        this.prev_n = 0;
        this.init();
    }

    init() {
        let n = UI.parts.comma(Math.abs(this.value));
        let m = UI.parts.comma(Math.abs(this.valuePrev));
        let str_n = n.split('.');
        let str_m = m.split('.');
        let n_pos = str_n[0];
        let m_pos = str_m[0];
        let n_dec = str_n[1];
        let m_dec = str_m[1];

        //음수,양수 
        if (this.value < 0 && this.el.dataset.minus !== 'true') {
            this.el.dataset.minus = 'true';
        } else if (this.value > 0 && this.el.dataset.minus === 'true') {
            this.el.dataset.minus = 'false';
        }
        
        if (n_pos.length > m_pos.length) {
            for (let i = 0; i < n_pos.length - m_pos.length; i++) {
                str_m[0] = '0' + str_m[0];
            }
        } else if (n_pos.length < m_pos.length) {
            for (let i = 0; i < m_pos.length - n_pos.length; i++) {
                str_m[0] = str_m[0].substring(1);
            }
        }

        if (!!n_dec) {
            (!m_dec) ? m_dec = '0' : '';
            if (n_dec.length > m_dec.length) {
                for (let i = 0; i < n_dec.length - m_dec.length; i++) {
                    str_m[1] = str_m[1] + '0';
                }
            }
            if (m_dec.length > n_dec.length ) {
                for (let i = 0; i < m_dec.length - n_dec.length; i++) {
                    str_m[1] = str_m[1].slice(0,-1);
                }
            }

            m = str_m[0] + '.' + str_m[1];
        } else {
            m = str_m[0];
        }
        
        const len = n.length;
        const html_comma = '<span style="height:'+ this.h + 'px">';
        let html_item = '';
        
        console.log(len);

        for (let i = 0; i < len; i++) {
            
            let _n = (Number(n.substr(i, 1))) + 9;
            let _m = (Number(m.substr(i, 1))) + 9;
            
            _n = _n > 9 ? 9 - (_n - 9) : _n;
            _m = _m > 9 ? 9 - (_m - 9) : _m;
           
            if (isNaN(_n)) {
                html_item += '<span class="mdl-count-item" data-n="'+ n.substr(i, 1) +'" style="height:'+ this.h + 'px"><span class="mdl-count-num">';
                html_item += html_comma + n.substr(i, 1) + '</span>';
            } else {
                html_item += '<span class="mdl-count-item" data-n="'+ Number(n.substr(i, 1)) +'"><span class="mdl-count-num" style="transform: translateY(-'+ ((this.h) * _m) +'px); transition: transform 0.6s cubic-bezier(.21,-0.04,.66,1.21);">';
                html_item += this.html_number;
            }
            html_item += '</span></span>';
        }

        this.el.setAttribute('aria-label', n);
        this.el.insertAdjacentHTML('beforeend', html_item);
        this.items = this.el.querySelectorAll('.mdl-count-item[data-n]');

        setTimeout(() => {
            for (let i = 0; i < len; i++) {
                let _n = (Number(n.substr(i, 1))) + 9;
                 _n = _n > 9 ? 9 - (_n - 9) : _n;

                if (!isNaN(_n)) {
                    this.items[i] ? this.items[i].querySelector('.mdl-count-num').style.transform = 'translateY(-'+ ((this.h) * _n) +'px)' : '';
                }
            }
        }, 0);

        html_item = null;
    }
    add(v) {
        this.valuePrev = this.value;
        this.value = this.value * 1000 + v * 1000;
        this.value = this.value / 1000;
        this.items = this.el.querySelectorAll('.mdl-count-item[data-n]');
        this.prev_n = '';
        for (const item of this.items) { 
            
            this.prev_n =  this.prev_n + item.dataset.n
            item.remove(); 
        }
        console.log(this.prev_n)
        this.init();
    }
}

export {CounterUpSlotResult, CounterUpSlotLive}; 
