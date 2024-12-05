export default class PageScroll {
    constructor(opt) {
        this.scrollPage = document.querySelector(`.page-scroll[data-page-id="${opt.id}"]`);
        this.scrollPageItems = this.scrollPage.querySelectorAll(`.page-scroll--item[data-page-id="${opt.id}"]`);
        this.top = this.scrollPage.scrollTop;
        this.baseTop = 0;
        this.wrapHeight = this.scrollPage.offsetHeight
        this.item_rect = [];
        this.timer;
        this.cutline = 100;
        this.init();
    }
    init() {
        this.scrollPage.removeEventListener('scroll', this.act);
        this.scrollPage.addEventListener('scroll', this.act);
        
        for (let i = 0, len = this.scrollPageItems.length; i < len; i++) {
            const rect = this.scrollPageItems[i].getBoundingClientRect();
            if (i === 0)  this.baseTop = rect.top;

            if (this.wrapHeight > rect.top + rect.height) {
                this.scrollPageItems[i].dataset.cutline = 'on';
            }
            if (i === 0) {
                this.scrollPageItems[i].dataset.cutline = 'on';
            }
            this.item_rect.push(rect);
        }

        this.act();
    }
    act = e => {
        const _this = e?.currentTarget;
        this.top = _this?.scrollTop;

        if (!_this) this.top = 0;

        for (let i = 0, len = this.item_rect.length; i < len; i++ ) {
            const item = this.item_rect[i];
            const _start = item.top - this.baseTop;
            const _end = _start + item.height;
            const _top = this.top + this.wrapHeight;
           
            if (_start < _top && _top < _end) {
                this.scrollPageItems[i].dataset.pagePercent = ((_top - _start) / (_end - _start) * 10).toFixed(0);

                if ((_top - _start) > this.cutline) {
                    this.scrollPageItems[i].dataset.cutline = "on";
                } else {
                    this.scrollPageItems[i].dataset.cutline = "off";
                }

                for (let n = 1; n < i; n ++) {
                    if (this.scrollPageItems[i - n]) {
                        this.scrollPageItems[i - n].dataset.cutline = "on";
                        this.scrollPageItems[i - n].dataset.pagePercent = 10;
                    } else {
                        break;
                    }
                }
                for (let n = 1; n < len; n ++) {
                    if (this.scrollPageItems[i + n]) {
                        this.scrollPageItems[i + n].dataset.cutline = "off";
                        this.scrollPageItems[i + n].dataset.pagePercent = 0;
                    } else {
                        break;
                    }
                }

                if (i === 6) {
                    if (Number(((_top - _start) / (_end - _start) * 10).toFixed(0)) > 3) {
                        this.scrollPageItems[i].querySelector('.img1').dataset.eff = 'on';
                    } else {
                        
                    }
                } 
                if (i < 6)  {
                    this.scrollPageItems[6].querySelector('.img1').dataset.eff = 'off';
                }
            }

            if (_start < this.top && this.top < _end) {
                const per = ((this.top - _start) / (_end - _start) * 10).toFixed(0);
                
                if (this.scrollPageItems[i]) this.scrollPageItems[i].dataset.pageInPercent = per;
                if (this.scrollPageItems[i - 1]) {
                    this.scrollPageItems[i - 1].dataset.pageInPercent = 10;
                }
                if (this.scrollPageItems[i + 1]) {
                    this.scrollPageItems[i + 1].dataset.pageInPercent = 0;
                }
            }
        }
    }
}