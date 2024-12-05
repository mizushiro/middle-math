export default class TextLimit {
    constructor(opt) {
        this.id = opt.id;
        this.textarea = document.querySelector(`#${this.id}`);
        this.liveUnit = 10;
        this.liveSum = this.liveUnit;
        this.init();
    }
    init() {
        this.textarea.addEventListener('keyup', this.act);
        this.act(this.textarea);
    }
    act = e => {
        const el_this = e.type === 'keyup' ? e.currentTarget : e;
        const data_describedby = el_this.getAttribute('aria-describedby');
        const data_max_num = Number(el_this.getAttribute('maxlength'));
        const data_min_num = Number(el_this.getAttribute('minlength'));

        const el_enteredTxtSums = document.querySelectorAll(`[data-entered-sum="${this.id}"]`);
        const el_enteredTxtBtn = document.querySelector(`[data-entered-btn="${this.id}"]`);
        const el_enteredTxtLive = document.querySelector(`#${data_describedby}`);
        let sum = el_this.value.length;

        if (e.key !== 'Process') {
            sum = (data_max_num < sum) ? data_max_num : sum;

            for (const item of el_enteredTxtSums) {
                item.textContent = sum;
            }
            
            //버튼이 있다면
            if (el_enteredTxtBtn) {
                el_enteredTxtBtn.disabled = (sum > data_min_num) ? false : true;
            }

            if (sum === this.liveSum ) {
                this.liveSum = this.liveSum + this.liveUnit;
                console.log(sum, this.liveSum)
                el_enteredTxtLive.setAttribute('aria-live', 'polite');
            } else {
                el_enteredTxtLive.setAttribute('aria-live', 'off');
            }
        
            console.log(sum)
        }

        

        // for (const item of textLengthObjects) {
        //     if (item.dataset.state === 'on') n = n + 1;
        // }
        
        // if (_btn) {
        //     if (n === 3) {
        //         _btn.disabled = false;
        //     } else {
        //         _btn.disabled = true;
        //     }
        // }
    }
}