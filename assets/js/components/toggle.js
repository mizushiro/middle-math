export default class ToggleUI {
    constructor(opt) {
        this.scope = !!opt ? opt.scope : false;
        this.objects = this.scope ? this.scope.querySelectorAll('[data-toggle-object]') : document.querySelectorAll('[data-toggle-object]');
        this.init();
    }
    init() {
        for (let item of this.objects) {
            if (item.dataset.event !== 'on') {
                item.dataset.event = 'on';
                item.removeEventListener('click', this.actClick);
                item.addEventListener('click', this.actClick);
            }
        }
    }
    actClick = (e) => {
        const type = e.type;
        const el_object = e.currentTarget;
        const callbackName = el_object.dataset.callback;
        const is_name = el_object.dataset.toggleObject;
        const el_objects = document.querySelectorAll('[data-toggle-object="'+ is_name +'"]');
        const el_target = document.querySelector('[data-toggle-target="'+ is_name +'"]');

        let data_state = el_object.dataset.toggleState;
        let is_state = data_state !== 'true' ? 'true' : 'false';
        
        for(let item of el_objects) {
            item.dataset.toggleState = is_state;
        }
        // el_object.dataset.toggleState = is_state;
        !!el_target ? el_target.dataset.toggleState = is_state : '';
              
        !!callbackName && UI.callback[callbackName]({
            state: is_state,
            event: type,
            name: is_name
        });
    }
    actHover = (e) => {
        const el_object = e.currentTarget;
        const callbackName = el_object.dataset.callback;
        const is_name = el_object.dataset.toggleObject;
        const el_target = document.querySelector('[data-toggle-target="'+ is_name +'"]');

        el_object.dataset.toggleEvent = 'hover';

        !!callbackName && UI.callback[callbackName]({
            state: if_state,
            event: 'hover',
            name: is_name
        });
    }
}
