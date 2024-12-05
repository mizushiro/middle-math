export default class Tab {
    constructor(opt) {
        this.current = opt.current ? opt.current : false;
        this.id = opt.id;
        this.callback = opt.callback;
        this.tab = document.querySelector('.mdl-tab[data-tab-id="'+ this.id +'"]');
        this.tab_btns = this.tab.querySelectorAll('.mdl-tab-btn');
        this.pnl = document.querySelector('.mdl-tab-pnl[data-tab-id="'+ this.id +'"]');
        this.items = this.pnl.querySelectorAll('.mdl-tab-item');

        this.init();
    }
    init() {
        // if (!!para) {
        //     if (para.split('+').length > 1) {
        //         //2 or more : tab=exeAcco1*2+exeAcco2*3
        //         paras = para.split('+');

        //         for (let j = 0; j < paras.length; j++ ) {
        //             paraname = paras[j].split('*');
        //             opt.id === paraname[0] ? current = Number(paraname[1]) : '';
        //         }
        //     } else {
        //         //only one : tab=1
        //         if (para.split('*').length > 1) {
        //             paraname = para.split('*');
        //             opt.id === paraname[0] ? current = Number(paraname[1]) : '';
        //         } else {
        //             current = Number(para);
        //         }
        //     }
        // }


        let para = UI.parts.paraGet(this.id);

        if (!!para && typeof para === 'string') {
            this.current = para
        }

        for (let item of this.tab_btns) {
            item.addEventListener('click', this.act);
        }

        if (this.current === false) {
            !!sessionStorage.getItem(this.id) ? this.selected(sessionStorage.getItem(this.id)) :  this.selected(this.tab_btns[0].dataset.tab);
        } else {
            this.selected(this.current);
        }
    }
    ps = (e) => {
        const _this = e;
        const _wrap = _this.closest('.mdl-tab'); 
        const _rect_wrap = _wrap.getBoundingClientRect();  
        const _rect = _this.getBoundingClientRect();   
        
        UI.scroll.move({ 
            selector: _wrap, 
            left: (_rect.left - _rect_wrap.left) + _wrap.scrollLeft + (_rect.width / 2), 
            add : 0,
            align: 'center' 
        });
    }
    act = (e) => {
        const _this = e.currentTarget;
        const tab = _this.dataset.tab;
        this.selected(tab);
        this.ps(_this);
    }
    selected(tab) {
        const btn = this.tab.querySelector('.mdl-tab-btn[data-tab="'+ tab +'"]');
        const _selected = this.tab.querySelector('.mdl-tab-btn[data-selected="true"]');
        const item = this.pnl.querySelector('.mdl-tab-item[data-tab="'+ tab +'"]');
        const _selected_pnl = this.pnl.querySelector('.mdl-tab-item[data-selected="true"]');

        sessionStorage.setItem(this.id, tab);

        _selected ? _selected.dataset.selected = false : '';
        _selected_pnl ? _selected_pnl.dataset.selected = false : '';

        this.ps(btn);
        this.callback && this.callback({
            id: this.id,
            current: tab
        });

        btn.dataset.selected = true;
        item.dataset.selected = true;
    }
}
