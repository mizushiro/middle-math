export default class AudioPlayer {
    constructor(opt) {
        this.players = document.querySelectorAll('.audio-player');
        this.item = null;
        this.current = null;
        this.timer = 0;
        this.init();
    }
    init() {
        for (const item of this.players) {
            item.dataset.state = 'stop';
            item.dataset.size = 'max';
            const _label = item.dataset.label;
            const btn_size = item.querySelector('.audio-player--size');
            btn_size.addEventListener('click', this.actSize);
            const btn = item.querySelector('.audio-player--btn');
            btn.setAttribute('aria-label',  _label + ' 실행');
            btn.addEventListener('click', this.act);
        }
    }
    reset = (v) => {         
        for (const item of this.players) {
            const _audio = item.querySelector('audio');
            const _label = item.dataset.label;
            
            if (item.dataset.state === 'play' && (this.current !== _label || v)) {
                item.dataset.state = 'pause';
                item.querySelector('.audio-player--btn').setAttribute('aria-label',  _label + ' 정지');
                _audio.pause();
                _audio.currentTime = 0;
                this.current = null;
            }
        }
    } 
    actSize = (e) => {
        const _this = e.currentTarget;
        const wrap = _this.closest('.audio-player');
        const _size = wrap.dataset.size;

        wrap.dataset.size = (_size === 'max') ? 'min' : 'max';
    }
    actTimer = (v) => {
        const _time = v;
        let mm = Math.floor((_time % 3600) / 60).toString().padStart(2, '0');
        let ss = Math.floor(_time % 60).toString().padStart(2, '0');

        return mm + ':' + ss;
    }
    act = (e) => {
        const _this = e.currentTarget;
        const file = _this.dataset.audio;
        const wrap = _this.closest('.audio-player');
        const _label = wrap.dataset.label;
        const _audio = wrap.querySelector('audio');

        _audio.loop = false;
        _audio.volume = 0.5;

        //초기화세팅
        this.item = wrap;
        this.current = _label;
        this.reset();
        this.item.dataset.size = "max";
        const cur = wrap.querySelector('.audio-player--time-cur');
        const dur = wrap.querySelector('.audio-player--time-dur');

        cur.textContent = this.actTimer(_audio.currentTime);
        dur.textContent = this.actTimer(_audio.duration);

        const nowTime = () => {
            console.log('째각');
            this.timer = setTimeout(() => {
                cur.textContent = this.actTimer(_audio.currentTime);
                nowTime();
            },0);
        }

        //실행여부에 따른 조건
        if (_audio?.paused) {
            wrap.dataset.state = 'play';
            _this.setAttribute('aria-label',  _label + ' 정지');
            clearTimeout(this.timer);
            nowTime();
            _audio.play();
        } else {
            clearTimeout(this.timer);
            wrap.dataset.state = 'pause';
            _this.setAttribute('aria-label',  _label + ' 실행');
            _audio?.pause();
        } 
        
        //종료
        _audio.addEventListener('ended', () => {
            console.log('끝');
            clearTimeout(this.timer);
            wrap.dataset.state = 'pause';
            _this.setAttribute('aria-label',  _label + ' 실행');
            _audio.currentTime = 0;
            this.current = null;
        });
    }
}