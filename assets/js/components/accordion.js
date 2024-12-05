export default class Accordion {
    constructor(opt) {
        this.id = opt.id;
        this.current = opt.current;
        this.callback = opt.callback;
        this.acco = document.querySelector('.mdl-acco[data-id="'+ this.id +'"]');
        this.acco_items = document.querySelectorAll('.mdl-acco[data-id="'+ this.id +'"] > .mdl-acco-item');
        this.acco_wrap;
        this.acco_body;
        this.acco_item;
        this.h = 0;
        this.init();
    }

    init() {
        for (const item of this.acco_items) {
            const btn = item.querySelector('.mdl-acco-btn');

            btn.addEventListener('click', this.actToggle);
        }

        (typeof this.current === 'number') && this.show(this.current);
    }
    actToggle = (e) => {
        const _this = e.currentTarget;
        this.acco_item = _this.closest('.mdl-acco-item');
        const acco_head = _this.closest('.mdl-acco-head');
        this.acco_body = acco_head.nextElementSibling;

        if (this.acco_body) {
            this.acco_wrap = this.acco_body.children[0];
            this.h = this.acco_wrap.offsetHeight;
            this.acco_item.dataset.expanded !== 'true' ? 
            this.actShow() :  this.actHide() ;
        }
    }
    showEnd = (e) => {
        this.acco_body.style.height = 'auto';
    }
    actShow() {
        this.callback && this.callback({
            id: this.id,
            current: UI.parts.getIndex(this.acco_item)
        });
        this.acco_item.dataset.expanded = 'true';
        this.acco_body.style.height = (this.h) + 'px';
        this.acco_body.addEventListener('transitionend', this.showEnd);
    }
    actHide() {
        this.acco_wrap = this.acco_body.children[0];
        this.h = this.acco_wrap.offsetHeight;
        this.acco_body.style.height = (this.h) + 'px';
        this.acco_body.removeEventListener('transitionend', this.showEnd);
       
        setTimeout(() => {
            this.acco_item.dataset.expanded = 'false';
            this.acco_body.style.height = 0;
        }, 0);
    }

    show(v) {
        this.acco_item = this.acco_items[v];

        for (const item of this.acco_item.children) {
            if (item.classList.contains('mdl-acco-body')) {
                this.acco_body = item;
            }
        }
        
        this.acco_wrap = this.acco_body.children[0];
        this.h = this.acco_wrap.offsetHeight;
        this.actShow();
    }
    hide(v) {
        this.acco_item = this.acco_items[v];

        for (const item of this.acco_item.children) {
            if (item.classList.contains('mdl-acco-body')) {
                this.acco_body = item;
            }
        }
        
        this.acco_wrap = this.acco_body.children[0];
        this.h = this.acco_wrap.offsetHeight;
        this.acco_body.style.height = (this.h) + 'px';
        this.acco_body.removeEventListener('transitionend', this.showEnd);
       
        setTimeout(() => {
            this.acco_item.dataset.expanded = 'false';
            this.acco_body.style.height = 0;
        }, 0);
    }
    allHide() {
        for (const item of this.acco_items) {
            item.dataset.expanded = 'false';
            const _body = item.querySelector('.mdl-acco-body');
            _body ? _body.style.height = 0 : '';
        }
    }
    allShow() {
        for (const item of this.acco_items) {
            item.dataset.expanded = 'true';
            const _body = item.querySelector('.mdl-acco-body');
            _body ? _body.style.height = 'auto' : '';
        }
    }
}