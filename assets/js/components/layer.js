/**
 * T:top        L:left
 * C:center     C:center
 * B:bottom     R:right
 */

export default class Layer {
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
        this.classname  = opt.classname ? opt.classname : '',
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
                if (!!document.querySelector('[data-id="'+ this.id +'"]')) {
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
                    this.el.modal = document.querySelector('.mdl-layer[data-id="'+ this.opt.id +'"]');

                    this.modal = document.querySelector('.mdl-layer[data-id="'+ this.opt.id +'"]');
                    this.btn_close = this.modal.querySelector('.mdl-layer-close');
                    this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

                    switch(this.opt.type) {
                        case 'modal' :
                            this.modal.dataset.type = 'modal';
                            break;
                        case 'bottom' :
                            this.modal.dataset.type = 'bottom';
                            break;
                        case 'dropdown' :
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
        this.selectBtn = document.querySelector('.mdl-select-btn[data-select-id="'+ this.id +'"]');
        this.selectLayer = document.querySelector('.mdl-layer[data-type="select"][data-id="'+ this.id +'_select"]');
        this.selectBtn && this.selectBtn.remove();
        this.selectLayer && this.selectLayer.remove();
    }
    resetSelect() {
        this.selectLayer = document.querySelector('.mdl-layer[data-id="'+ this.id +'_select"]');
        const layerBody = this.selectLayer.querySelector('.mdl-layer-body');
        const optionWrap = layerBody.querySelector('.mdl-select-wrap');
       
        optionWrap.remove();
        let html_option = `
        <ul class="mdl-select-wrap">
            ${ this.madeOption() }
        </ul>`;
        layerBody.insertAdjacentHTML('beforeend', html_option);
        html_option = null;
    }
    madeOption() {
        this.select = document.querySelector('.mdl-select[data-id="'+ this.id +'"]');
        const select = this.select.querySelector('select');
        const options = select.querySelectorAll('option');

        let html_option = '';
        for (let i = 0, len = options.length; i < len; i++) {
            html_option += `
            <li>
                <input type="radio" id="${ this.id }_r${ i }" value="${ options[i].value }"  name="${ this.id }_r" ${ ((options[i].selected) && 'checked') }>
                <label for="${ this.id }_r${ i }" class="mdl-select-option" data-type="radio" data-value="${ options[i].value }" role="option">
                    <span>${ options[i].text }</span>
                </label>
            </li>`;
        }

        return html_option;
    }
    madeSelect() {
        this.select = document.querySelector('.mdl-select[data-id="'+ this.id +'"]');
        const select = this.select.querySelector('select');

        let html_select_button = `
        <button type="button" class="mdl-select-btn" data-select-id="${ this.id }_select" value="${ select.value }" tabindex="-1" role="combobox" aria-haspopup="listbox" aria-expanded="false">
            <span>${ select.querySelector('[selected]').text }</span>
        </button>`;
        this.select.insertAdjacentHTML('beforeend', html_select_button);
        html_select_button = null;

        let html_select = `
        <section class="mdl-layer" data-id="${ this.id }_select" data-type="select" role="listbox">
            <div class="mdl-layer-wrap">
                <div class="mdl-layer-header">
                    <h2>${ select.title }</h2>
                    <button type="button" class="mdl-layer-close" data-material="close"  aria-label="닫기"></button>
                </div>
                <div class="mdl-layer-body">
                    <ul class="mdl-select-wrap">
                        ${ this.madeOption() }
                    </ul>
                </div>
            </div>
            <div class="mdl-layer-dim"></div>
        </section>`;  
        document.querySelector('body').insertAdjacentHTML('beforeend', html_select);
        html_select = null;

        this.modal = document.querySelector('.mdl-layer[data-id="'+ this.id +'_select"]');
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
        <div class="mdl-layer ${ this.classname }" data-id="${ this.id }" data-type="toast" aria-live="${ this.status }">
            <div class="mdl-layer-wrap">
                <div class="mdl-layer-body">${ this.content }</div>
                ${ !this.auto ? '<button type="button" class="mdl-layer-close" data-material="close" aria-label="닫기"></button>' : ''}
            </div>
        </div>`;
        this.el_body.insertAdjacentHTML('beforeend', html_toast);

        this.modal = document.querySelector('.mdl-layer[data-id="'+ this.id +'"]');
        this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

        this.init();
    }
    madeSystem() {
        //alert & confirm
        let html_system = `
        <section class="mdl-layer" data-id="${ this.id }" data-type="alert">
            <div class="mdl-layer-wrap">
                <div class="mdl-layer-body">
                    ${(!!this.title) ? `<h1 class="mdl-layer-tit">${ this.title }</h1>` : ''}
                    <div>${ this.content }</div>
                    <div class="mdl-button-wrap">
                        ${(this.btn.length === 2) ? `<button type="button" class="mdl-button" data-state="cancel" data-style="primary-gray"><span>${ this.btn[1].text }</span></button>` : ''}
                        <button type="button" class="mdl-button" data-state="ok" data-style="primary">
                            <span>${ this.btn[0].text }</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="mdl-layer-dim"></div>
        </section>`;
        document.querySelector('body').insertAdjacentHTML('beforeend', html_system);
        html_system = null;

        this.modal = document.querySelector('.mdl-layer[data-id="'+ this.id +'"]');
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
                const el_link = document.querySelector('link[data-usage="'+ this.id +'"]');
                const el_script = document.querySelector('script[data-usage="'+ this.id +'"]');
                
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

                this.el.modal = document.querySelector('.mdl-layer[data-id="'+ this.id +'"]');
                this.el.btn_close = this.el.modal.querySelector('.mdl-layer-close');
                this.el.modal_wrap = this.el.modal.querySelector('.mdl-layer-wrap');
                // this.el.modal_wrap.appendChild(_btn);
                this.el.last_layer = this.el.modal.querySelector('.mdl-layer-last');

                this.modal = document.querySelector('.mdl-layer[data-id="'+ this.id +'"]');
                this.btn_close = this.modal.querySelector('.mdl-layer-close');
                this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

                this.modal_wrap.appendChild(_btn);
                this.last = this.modal.querySelector('.mdl-layer-last');

                switch(this.type) {
                    case 'modal' :
                    this.modal.dataset.type = 'modal';
                    break;

                    case 'dropdown' :
                    this.modal.dataset.type = 'dropdown';
                    break;

                    case 'tooltip' :
                    this.modal.dataset.type = 'tooltip';
                    break;

                    case 'select' :
                    this.modal.dataset.type = 'select';
                    break;

                    case 'toast' :
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
        const _files = document.querySelectorAll('[data-usage="'+ _id +'"]');
        const _tooltip = document.querySelector('#'+ _id );

        for (let item of _files) {
            item.remove();
        }
        _tooltip.remove();
    }
    actSelected = (e) => {
        let _this = e.currentTarget;
       
        if (_this.type === 'radio') {
            _this = this.modal.querySelector('.mdl-select-option[for="'+ _this.id +'"]');
        }
        this.select.querySelector('.mdl-select-btn span').textContent = _this.textContent;
        this.select.querySelector('.mdl-select-btn').value = _this.dataset.value;
        this.select.querySelector('select option[value="'+ _this.dataset.value +'"]').selected = true;
       
        e.type !== 'keyup' && this.hide();

        this.callback && this.callback({
            text:  _this.textContent,
            value: _this.dataset.value
        });
    }
    show = (e) =>  {
        if (this.type === 'toast') {
            if (this.modal.dataset.state === 'show') {
                console.log('열려있음');
                return false;
            }
            console.log('toast show: ' , this.modal);
        }

        const _zindex = 100;
        const _prev = document.querySelector('[data-layer-current="true"]');
        let btn = false;

        (this.type === 'select') ? btn = document.querySelector('.mdl-select-btn[data-select-id="'+ this.id +'_select"]') : '';
        (this.type === 'dropdown') ? btn = document.querySelector('[data-dropdown="'+ this.id +'"]') : '';
        (this.type === 'tooltip') ? btn = document.querySelector('.mdl-tooltip[aria-describedby="'+ this.id +'"]') : '';

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

            switch(this.ps){
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
            document.querySelector('.mdl-layer[data-id="'+ this.select_btn.dataset.selectId +'"]').style.width = (this.select_btn.offsetWidth / 10) + 'rem';
            
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
            },0);
        }
        else if (this.type === 'toast' && this.auto) {
            this.timer = setTimeout(()=> {
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
            case 13 : e.type === 'keydown' && this.actSelected(e);
                break;
            case 38 :
            case 40 : e.type === 'keyup' && this.actSelected(e);
                    break;
            default : e.type === 'keydown' ? this.timer = setTimeout(this.hide, 300) : '';
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
                document.querySelector('.mdl-layer[data-layer-n="'+ this.html.dataset.layerN +'"]').dataset.layerCurrent = 'true';
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
            const _state = document.querySelector('.mdl-layer[data-id="'+ this.id +'"]').dataset.state;

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
