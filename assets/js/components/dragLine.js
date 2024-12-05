export default class DragLine {
  /**
   * 선잇기 callback 정보
   * answer_all_sum === answer_current_sum 정답상태
   * @param {number} answer_all_sum 전체정답갯수
   * @param {number} answer_current_sum 현재정답갯수
   * @param {string} answer_current 선택한 답
   * @param {boolean} answer_all_state 전체정오답상태
   * @param {object} answer_last 히스토리
   *
   */
  constructor(opt) {
    this.id = opt.id;
    this.doc = document.documentElement;
    this.wrap = document.querySelector(`[data-line-id="${this.id}"]`);
    this.items = this.wrap.querySelectorAll(
      '[data-line-object], [data-line-target]'
    );
    this.objects = this.wrap.querySelectorAll(`[data-line-object]`);
    this.targets = this.wrap.querySelectorAll(`[data-line-target]`);

    this.type = this.wrap.dataset.lineType
      ? this.wrap.dataset.lineType
      : 'single';
    const rect = this.wrap.getBoundingClientRect();
    this.wrap_t = rect.top;
    this.wrap_l = rect.left;
    this.wrap_w = this.wrap.offsetWidth;
    this.wrap_h = this.wrap.offsetHeight;

    this.n = this.objects.length;
    this.svg = null;
    this.answer_len = Number(opt.answer);
    this.answer_n = 0;
    this.complete_n = 0;
    this.answer_last = opt.lastAnswer;

    this.callback = opt.callback;
    this.callbackComplete = opt.callbackComplete;
    this.callbackCheck = opt.callbackCheck;
    this.isTouch =
      navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;

    //userAgent 값 얻기
    const varUA = navigator.userAgent.toLowerCase();
    const isMobile = varUA.indexOf('android') > -1 || varUA.indexOf('iphone') > -1 || varUA.indexOf('ipad') > -1 || varUA.indexOf('ipod') > -1;

    if (!isMobile) this.isTouch = false;

    this.init();
  }

  // resizeObserver(setCall) {
  //   setCall();
  // }

  init() {
    //중복실행방지
    if (this.wrap.dataset.load === 'ok')  return false;
    this.wrap.dataset.load = 'ok';

    //svg생성
    this.wrap.insertAdjacentHTML('beforeend', `<svg></svg>`);
    this.svg = this.wrap.querySelector('svg');

    //setup
    const set = () => {
      this.reset();

      const rect = this.wrap.getBoundingClientRect();
      this.wrap_t = rect.top;
      this.wrap_l = rect.left;
      this.wrap_w = this.wrap.offsetWidth;
      this.wrap_h = this.wrap.offsetHeight;

      //접근성: 키보드 접근 제한
      for (const item of this.targets) {
        item.setAttribute('tabindex', '-1');
      }

      //object & target 크기, 위치 정보 저장
      for (const [index, item] of this.items.entries()) {
        const rect_item = item.getBoundingClientRect();
        const item_w = item.offsetWidth / 2;
        const item_h = item.offsetHeight / 2;

        item.dataset.name = index;
        item.dataset.x = rect_item.left + item_w - this.wrap_l;
        item.dataset.y = rect_item.top + item_h - this.wrap_t;
      }

      this.wrap.style.opacity = '1';

      //선택한 정답 존재 여부에 따라 
      if (this.answer_last?.length) {
        this.drawLastAnswer();
      } else {
        this.answer_last = [];
      }
    };
    this.wrap.style.opacity = '0';
    this.wrap.style.transition = 'opacity 0.2s ease';
    
    //resize 재설정
    let timer = 0;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timer);
      this.wrap.style.opacity = '0';
      timer = setTimeout(() => {
        set();
      }, 300);
    });
    //this.wrap의 크기가 변경될 때 재설정
    resizeObserver.observe(this.wrap);

    //첫터치 체크
    let firstTouch = {
      state: false,
      item: null,
      line: null,
      x: null,
      y: null,
      is_object: null,
    };
    let moving = false;
    let isObject;

    //선 만들기 시작 actStart에서 실행
    const createLine = e => {
      let el_item = e.type === 'keydown' ? e.target : e.currentTarget;

      //현재 object인가 target인가
      let data_name_object = null;
      let data_name_target = null;
      const data_name = el_item.dataset.name;

      if (isObject) {
        data_name_object = el_item.dataset.name;
      } else {
        data_name_target = el_item.dataset.name;
      }
      const el_rect = el_item.getBoundingClientRect();
      const tag_line = `<line x1="0" x2="0" y1="0" y2="0" data-state="ing" data-name="${data_name}" data-object-name="${data_name_object}" data-target-name="${data_name_target}"></line>`;

      //라인 생성
      if ((this.isTouch && !firstTouch.state) || !moving) {
        this.wrap
          .querySelector('svg')
          .insertAdjacentHTML('beforeend', tag_line);
      }

      // if (e.type !== 'keydown') document.querySelector('body').classList.add('noScroll');

      //라인전체영역
      this.wrap_t = this.wrap.getBoundingClientRect().top;
      this.wrap_l = this.wrap.getBoundingClientRect().left;
      this.wrap_w = this.wrap.offsetWidth;
      this.wrap_h = this.wrap.offsetHeight;

      //싱글모드, 완료아이템 재선택
      if (this.type === 'single' && el_item.dataset.complete === 'true') {
        el_item.removeAttribute('data-complete');
        const _nn = el_item.dataset.lineObject
          ? el_item.dataset.lineObject
          : el_item.dataset.lineTarget;
        let _nnn;
        let _name;
        let _dot;

        const line_del = this.wrap.querySelector(`line[data-name="${data_name}"]`);
        const object_name = line_del.dataset.objectName;
        const target_name = line_del.dataset.targetName;
        line_del.remove();

        const _obj = this.wrap.querySelector('[data-name="' + object_name + '"]');
        const _trg = this.wrap.querySelector('[data-name="' + target_name + '"]');

        if (_obj) _obj.setAttribute('aria-label', _obj.dataset.label);
        if (_trg) _trg.setAttribute('aria-label', _trg.dataset.label);

        //target인 경우
        if (el_item.dataset.connect) {
          _name = el_item.dataset.connect;
          el_item.removeAttribute('data-connect');
          _dot = this.wrap.querySelector(`[data-name="${_name}"]`);
        }
        //object인 경우
        else {
          _name = data_name;
          _dot = this.wrap.querySelector(`[data-connect="${_name}"]`);
        }

        _dot.removeAttribute('data-connect');
        _dot.removeAttribute('data-complete');
        _nnn = _dot.dataset.lineObject
          ? _dot.dataset.lineObject
          : _dot.dataset.lineTarget;

        if (_nn === _nnn) this.answer_n = this.answer_n - 1;
      }

      el_item.dataset.active = moving ? '' : 'true';

      let el_line = this.svg.querySelector('line[data-state="ing"]');

      if (e.type === 'keydown') {
        const item_w = el_item.offsetWidth / 2;
        const item_h = el_item.offsetHeight / 2;
        const x_value = el_rect.left + item_w - this.wrap_l;
        const y_value = el_rect.top + item_h - this.wrap_t;

        el_line.setAttribute('x1', x_value);
        el_line.setAttribute('y1', y_value);
        el_line.setAttribute('x2', x_value);
        el_line.setAttribute('y2', y_value);
      }
    };

    const actStart = e => {
      e.preventDefault();

      let el_item = e.currentTarget;
      const _drag = el_item.closest('[data-line-id]');
      let actMove;
      let actEnd;
      let _x = e.clientX ? e.clientX : e.targetTouches[0].clientX;
      let _y = e.clientY ? e.clientY : e.targetTouches[0].clientY;

      let _menu = _drag.querySelector('[role="menu"]');
      let _actives = _drag.querySelectorAll('[data-active="true"]');
      let _line = _drag.querySelector('line[data-state="ing"]');

      let is_object;
      let el_line;
      let value;
      let data_name;
      let rect_item;
      let item_w;
      let item_h;
      let x_value;
      let y_value;

      if (_drag.dataset.ing === 'true') {
        if (this.isTouch) {
          let el_line = this.svg.querySelector('line[data-state="ing"]');
          _x = e.clientX ? e.clientX : e.targetTouches[0].clientX;
          _y = e.clientY ? e.clientY : e.targetTouches[0].clientY;
          el_line.setAttribute('x2', _x - this.wrap_l);
          el_line.setAttribute('y2', _y - this.wrap_t);

          moving = true;

          const rect_item = el_item.getBoundingClientRect();
          const item_w = el_item.offsetWidth / 2;
          const item_h = el_item.offsetHeight / 2;
          let is_object = el_item.dataset.lineObject ? true : false;

          let value = is_object
            ? el_item.dataset.lineObject
            : el_item.dataset.lineTarget;
          const data_name = el_item.dataset.name;
          is_object = true;

          //클릭완료이벤트에 클릭이벤트인경우 클릭완료 설정
          _drag.dataset.ing = 'false';
          document.querySelector('body').classList.remove('noScroll');
          const v_x = _x - this.wrap_l;
          const v_y = _y - this.wrap_t;
          let is_complete = false;
          moving = false;

          if (el_line) {
            el_line.dataset.state = 'complete';
          }
          el_item.dataset.active = '';
          firstTouch.state = false;

          for (let item of this.items) {
            const _isObject = item.dataset.lineObject ? true : false;

            //다른그룹일때만
            if (_isObject !== isObject) {
              let is_selected = false;
              let connect_array;

              //완료된아이템여부 확인
              const _is_complete = item.dataset.complete;
              const _value = _isObject
                ? item.dataset.lineObject
                : item.dataset.lineTarget;

              const _rect_item = item.getBoundingClientRect();
              const i_x = Number(item.dataset.x);
              const i_y = Number(item.dataset.y);

              //현재위치가 범위내에 들어와 있는지?
              const if_x =
                v_x <= i_x + item_w && v_x + item_w * 2 >= i_x + item_w;
              const if_y =
                v_y >= i_y - item_h && v_y <= i_y - item_h + item_h * 2;

              //싱글 연결완료조건: 범위내, 미완료
              //멀티 연결완료조건: 범위내
              const if_true =
                this.type === 'single'
                  ? if_x && if_y && !_is_complete
                  : if_x && if_y;

              //멀티
              //연결된 아이템인 경우에서 서로 이미 연결이 된 경우라면 is_selected true 설정하여 연결실패로 처리
              if (this.type === 'multiple' && item.dataset.connect) {
                connect_array = item.dataset.connect.split(',');

                for (let i = 0; i < connect_array.length; i++) {
                  if (data_name === connect_array[i]) {
                    is_selected = true;
                    break;
                  }
                }
              }

              //연결성공
              if (if_true && !is_selected) {
                //연결된 아이템 완료상태
                el_item.dataset.complete = true;
                item.dataset.complete = true;

                //완료갯수
                this.complete_n = this.complete_n + 1;

                //연결된 정보 connect 여부에 따른 값설정
                if (!item.dataset.connect) {
                  //connect가 없다면
                  item.dataset.connect = el_item.dataset.name;
                } else {
                  //connect가 있다면 , 추가
                  item.dataset.connect =
                    item.dataset.connect + ',' + el_item.dataset.name;
                }
                //연결된 정보
                if (!el_item.dataset.connect) {
                  el_item.dataset.connect = item.dataset.name;
                } else {
                  el_item.dataset.connect =
                    el_item.dataset.connect + ',' + item.dataset.name;
                }

                //최종 라인종료 위치
                el_line.setAttribute(
                  'x2',
                  _rect_item.left + item_w - this.wrap_l
                );
                el_line.setAttribute(
                  'y2',
                  _rect_item.top + item_h - this.wrap_t
                );

                if (_isObject) {
                  el_line.dataset.objectName = item.dataset.name;
                } else {
                  el_line.dataset.targetName = item.dataset.name;
                }

                //접근성 현재 연결된 상황 aria-label
                let object_correct = el_item.dataset.connect;
                object_correct = object_correct.split(',');
                let label_txt = '';
                for (let i = 0; i < object_correct.length; i++) {
                  let el = this.wrap.querySelector(
                    '[data-line-target][data-name="' + object_correct[i] + '"]'
                  );

                  if (!is_object) {
                    el = this.wrap.querySelector(
                      `[data-line-object][data-name="${object_correct[i]}"]`
                    );
                  }
                  if (label_txt !== '') {
                    label_txt =
                      label_txt + ', ' + el.getAttribute('aria-label');
                  } else {
                    label_txt = el.getAttribute('aria-label');
                  }
                }
              
                console.log('연결', el_item.dataset.label,label_txt)
                el_item.setAttribute(
                  'aria-label',
                  `${el_item.dataset.label}, ${label_txt} 연결됨`
                );
                item.setAttribute(
                  'aria-label',
                  `${el_item.dataset.label}, ${label_txt} 연결됨`
                );

                //정오답적용
                const v1 = value.split(',');
                const v2 = _value.split(',');

                //multiple인 경우 정오답
                if (this.type === 'multiple') {
                  if (v1.filter(x => v2.includes(x)).length > 0) {
                    el_line.dataset.answer = true;
                    this.answer_n = this.answer_n + 1;
                  } else {
                    el_line.dataset.answer = false;
                    this.answer_n = this.answer_n - 1;
                  }
                }
                //single인 경우 정오답
                else {
                  if (value === _value) {
                    el_line.dataset.answer = true;
                    this.answer_n = this.answer_n + 1;
                  } else {
                    el_line.dataset.answer = false;
                  }
                }
                //연결완료성공
                is_complete = true;

                //answer_last 수정일 경우
                if (this.answer_last) {
                  for (let i = 0; i < this.answer_last.length; i++) {
                    if (
                      Object.keys(this.answer_last[i]).includes(
                        'key' + el_item.dataset.name
                      )
                    ) {
                      this.answer_last.splice(i, 1);
                      this.complete_n = this.complete_n - 1;
                    }
                  }
                }

                if (is_object) {
                  //this.answer_last 선택값 정보 넣기
                  this.answer_last.push({
                    ['key' + el_item.dataset.name]: el_item.dataset.lineObject,
                    ['key' + item.dataset.name]: item.dataset.lineTarget,
                    label: el_item.getAttribute('aria-label'),
                  });
                } else {
                  this.answer_last.push({
                    ['key' + el_item.dataset.name]: el_item.dataset.lineTarget,
                    ['key' + item.dataset.name]: item.dataset.lineObject,
                    label: item.getAttribute('aria-label'),
                  });
                }
                break;
              }
            }
          }

          //이벤트 취소
          this.doc.removeEventListener('touchmove', actMove);
          this.doc.removeEventListener('touchend', actEnd);
          this.doc.removeEventListener('mousemove', actMove);
          this.doc.removeEventListener('mouseup', actEnd);

          //연결 실패인 경우 라인 삭제 및 이전기록 삭제
          if (!is_complete) {
            const object_name = el_line.dataset.objectName;
            const target_name = el_line.dataset.targetName;

            el_line.remove();
            //answer_last 수정일 경우
            if (this.answer_last) {
              for (let i = 0; i < this.answer_last.length; i++) {
                if (
                  Object.keys(this.answer_last[i]).includes(
                    'key' + el_item.dataset.name
                  )
                ) {
                  this.answer_last.splice(i, 1);
                  this.complete_n = this.complete_n - 1;
                  const _obj = this.wrap.querySelector(
                    '[data-name="' + object_name + '"]'
                  );
                  if (_obj) _obj.setAttribute('aria-label', _obj.dataset.label);
                  const _trg = this.wrap.querySelector(
                    '[data-name="' + target_name + '"]'
                  );
                  if (_trg) _trg.setAttribute('aria-label', _trg.dataset.label);
                }
              }
            }
          }
          if (this.callback) {
            this.callback({
              answer_state: this.answer_n === this.answer_len ? true : false,
              answer_last: this.answer_last,
            });
          }
        }
        return false;
      }

      //이벤트주체가 object인지
      isObject = el_item.dataset.lineObject ? true : false;

      //초기화
      if (_menu) _menu.remove();
      if (_line) _line.remove();
      for (const item of _actives) {
        item.removeAttribute('[data-active]');
      }
      //선그리기 
      createLine(e);
      _drag.dataset.ing = 'true';
      _drag.dataset.ingt = el_item;

      is_object = el_item.dataset.lineObject ? true : false;
      el_line = this.svg.querySelector('line[data-state="ing"]');
      value = is_object
        ? el_item.dataset.lineObject
        : el_item.dataset.lineTarget;
      data_name = el_item.dataset.name;

      if (this.type === 'single') {
        if (is_object) {
          el_line = this.svg.querySelector(`line[data-object-name="${data_name}"]`);
        } else {
          el_line = this.svg.querySelector(`line[data-target-name="${data_name}"]`);
        }
      }

      rect_item = el_item.getBoundingClientRect();
      item_w = el_item.offsetWidth / 2;
      item_h = el_item.offsetHeight / 2;
      x_value = rect_item.left + item_w - this.wrap_l;
      y_value = rect_item.top + item_h - this.wrap_t;

      actEnd = () => {
        //클릭완료이벤트에 클릭이벤트인경우 클릭완료 설정
        _drag.dataset.ing = 'false';
        _drag.dataset.ingt = 'false';
        document.querySelector('body').classList.remove('noScroll');
        const v_x = _x - this.wrap_l;
        const v_y = _y - this.wrap_t;
        let is_complete = false;
        moving = false;

        if (el_line) {
          el_line.dataset.state = 'complete';
        }
        el_item.dataset.active = '';
        firstTouch.state = false;

        for (let item of this.items) {
          const _isObject = item.dataset.lineObject ? true : false;

          //다른그룹일때만
          if (_isObject !== isObject) {
            let is_selected = false;
            let connect_array;

            //완료된아이템여부 확인
            const _is_complete = item.dataset.complete;
            const _value = _isObject
              ? item.dataset.lineObject
              : item.dataset.lineTarget;

            const _rect_item = item.getBoundingClientRect();
            const i_x = Number(item.dataset.x);
            const i_y = Number(item.dataset.y);

            //현재위치가 범위내에 들어와 있는지?
            const if_x =
              v_x <= i_x + item_w && v_x + item_w * 2 >= i_x + item_w;
            const if_y =
              v_y >= i_y - item_h && v_y <= i_y - item_h + item_h * 2;

            //싱글 연결완료조건: 범위내, 미완료
            //멀티 연결완료조건: 범위내
            const if_true =
              this.type === 'single'
                ? if_x && if_y && !_is_complete
                : if_x && if_y;

            //멀티
            //연결된 아이템인 경우에서 서로 이미 연결이 된 경우라면 is_selected true 설정하여 연결실패로 처리
            if (this.type === 'multiple' && item.dataset.connect) {
              connect_array = item.dataset.connect.split(',');

              for (let i = 0; i < connect_array.length; i++) {
                if (data_name === connect_array[i]) {
                  is_selected = true;
                  break;
                }
              }
            }

            //연결성공
            if (if_true && !is_selected) {
              //연결된 아이템 완료상태
              el_item.dataset.complete = true;
              item.dataset.complete = true;

              //완료갯수
              this.complete_n = this.complete_n + 1;

              //연결된 정보 connect 여부에 따른 값설정
              if (!item.dataset.connect) {
                //connect가 없다면
                item.dataset.connect = el_item.dataset.name;
              } else {
                //connect가 있다면 , 추가
                item.dataset.connect =
                  item.dataset.connect + ',' + el_item.dataset.name;
              }
              //연결된 정보
              if (!el_item.dataset.connect) {
                el_item.dataset.connect = item.dataset.name;
              } else {
                el_item.dataset.connect =
                  el_item.dataset.connect + ',' + item.dataset.name;
              }

              //최종 라인종료 위치
              el_line.setAttribute(
                'x2',
                _rect_item.left + item_w - this.wrap_l
              );
              el_line.setAttribute('y2', _rect_item.top + item_h - this.wrap_t);

              if (_isObject) {
                el_line.dataset.objectName = item.dataset.name;
              } else {
                el_line.dataset.targetName = item.dataset.name;
              }

              //접근성 현재 연결된 상황 aria-label
              let object_correct = el_item.dataset.connect;
              object_correct = object_correct.split(',');
              let label_txt = '';
              for (let i = 0; i < object_correct.length; i++) {
                let el = this.wrap.querySelector(
                  '[data-line-target][data-name="' + object_correct[i] + '"]'
                );

                if (!is_object) {
                  el = this.wrap.querySelector(
                    '[data-line-object][data-name="' + object_correct[i] + '"]'
                  );
                }
                if (label_txt !== '') {
                  label_txt = label_txt + ', ' + el.getAttribute('aria-label');
                } else {
                  label_txt = el.getAttribute('aria-label');
                }
              }

              console.log('연결', el_item.dataset.label, '-', label_txt)
              el_item.setAttribute(
                'aria-label',
                `${el_item.dataset.label}, ${label_txt} 연결됨`
              );
              // item.setAttribute(
              //   'aria-label',
              //   `${el_item.dataset.label}, ${label_txt} 연결됨`
              // );

              //정오답적용
              const v1 = value.split(',');
              const v2 = _value.split(',');

              //multiple인 경우 정오답
              if (this.type === 'multiple') {
                if (v1.filter(x => v2.includes(x)).length > 0) {
                  el_line.dataset.answer = true;
                  this.answer_n = this.answer_n + 1;
                } else {
                  el_line.dataset.answer = false;
                  this.answer_n = this.answer_n - 1;
                }
              }
              //single인 경우 정오답
              else {
                if (value === _value) {
                  el_line.dataset.answer = true;
                  this.answer_n = this.answer_n + 1;
                } else {
                  el_line.dataset.answer = false;
                }
              }
              //연결완료성공
              is_complete = true;

              //answer_last 수정일 경우
              if (this.answer_last) {
                for (let i = 0; i < this.answer_last.length; i++) {
                  if (
                    Object.keys(this.answer_last[i]).includes(
                      'key' + el_item.dataset.name
                    )
                  ) {
                    if (this.type === 'single') {
                      this.answer_last.splice(i, 1);
                    }
                    this.complete_n = this.complete_n - 1;
                  }
                }
              }
              if (is_object) {
                this.answer_last.push({
                  ['key' + el_item.dataset.name]: el_item.dataset.lineObject,
                  ['key' + item.dataset.name]: item.dataset.lineTarget,
                  label: el_item.getAttribute('aria-label'),
                });
              } else {
                this.answer_last.push({
                  ['key' + item.dataset.name]: item.dataset.lineObject,
                  ['key' + el_item.dataset.name]: el_item.dataset.lineTarget,
                  label: item.getAttribute('aria-label'),
                });
              }
              break;
            }
          }
        }

        //이벤트 취소
        this.doc.removeEventListener('touchmove', actMove);
        this.doc.removeEventListener('touchend', actEnd);
        this.doc.removeEventListener('mousemove', actMove);
        this.doc.removeEventListener('mouseup', actEnd);

        //연결 실패인 경우 라인 삭제 및 이전기록 삭제
        if (!is_complete) {
          const object_name = el_line.dataset.objectName;
          const target_name = el_line.dataset.targetName;

          el_line.remove();
          //answer_last 수정일 경우
          if (this.answer_last && this.type === 'single') {
            for (let i = 0; i < this.answer_last.length; i++) {
              if (
                Object.keys(this.answer_last[i]).includes(
                  'key' + el_item.dataset.name
                )
              ) {
                this.answer_last.splice(i, 1);
                this.complete_n = this.complete_n - 1;
                const _obj = this.wrap.querySelector(
                  '[data-name="' + object_name + '"]'
                );
                if (_obj) _obj.setAttribute('aria-label', _obj.dataset.label);
                const _trg = this.wrap.querySelector(
                  '[data-name="' + target_name + '"]'
                );
                if (_trg) _trg.setAttribute('aria-label', _trg.dataset.label);
              }
            }
          }
        }
        if (this.callback) {
          this.callback({
            answer_state: this.answer_n === this.answer_len ? true : false,
            answer_last: this.answer_last,
          });
        }
      };
      actMove = e => {
        e.preventDefault();

        _x = e.clientX ? e.clientX : e.targetTouches[0].clientX;
        _y = e.clientY ? e.clientY : e.targetTouches[0].clientY;
        el_line.setAttribute('x2', _x - this.wrap_l);
        el_line.setAttribute('y2', _y - this.wrap_t);

        if (this.isTouch) {
          // this.doc.addEventListener('touchend', actEnd);
        } else {
          this.doc.addEventListener('mouseup', actEnd);
        }
        moving = true;
      };

      if (this.isTouch) {
        //터치
        if (!firstTouch.state) {
          this.doc.addEventListener('touchmove', actMove, { passive: false });
          this.doc.addEventListener('touchend', actEnd);
          console.log('firstTouch', 1111);
          firstTouch.state = true;
          firstTouch.item = el_item;
          firstTouch.line = el_line;
          firstTouch.x = x_value;
          firstTouch.y = y_value;
          firstTouch.is_object = is_object;

          el_line.setAttribute('x1', x_value);
          el_line.setAttribute('y1', y_value);
          el_line.setAttribute('x2', x_value);
          el_line.setAttribute('y2', y_value);
        } else {
          this.doc.removeEventListener('touchmove', actMove);

          firstTouch.state = false;
          firstTouch.item.dataset.active = '';
          el_item.dataset.active = '';
          el_item = firstTouch.item;
          is_object = firstTouch.is_object;
          value = is_object
            ? firstTouch.item.dataset.lineObject
            : firstTouch.item.dataset.lineTarget;
          _x = e.clientX ? e.clientX : e.targetTouches[0].clientX;
          _y = e.clientY ? e.clientY : e.targetTouches[0].clientY;

          actEnd();
        }
      } else {
        //마우스
        if (!moving) {
          this.doc.addEventListener('mousemove', actMove);

          el_line.setAttribute('x1', x_value);
          el_line.setAttribute('y1', y_value);
          el_line.setAttribute('x2', x_value);
          el_line.setAttribute('y2', y_value);
        }
      }
    };

    //keyborad
    const actKey = e => {
      const _this = e.currentTarget;
      const _wrap = _this.parentNode;
      let isEnd = false;
      let innerScroll = document.querySelector('.innerContsScroll');
      innerScroll = !innerScroll ? document.querySelector('body') : innerScroll;

      if (this.svg.querySelector('line[data-state="ing"]')) {
        this.svg.querySelector('line[data-state="ing"]').remove();
      }
      isObject = _this.dataset.lineObject ? true : false;

      //space key
      if (e.keyCode === 32) {
        createLine(e);
        //셀렉트생성
        let m = 1;
        let make_menu = `<div role="menu">`;
        let j = 0;
        let isCnt = true;

        for (const item of this.targets) {
          // if (this.type === 'single' && item.dataset.complete !== 'true') {
          if (this.type === 'single') {
            if (item.dataset.complete !== 'true') {
              make_menu += `<button value="
              ${item.dataset.lineTarget}"
              type="button"
              tabindex="-1"
              role="menuitem"
              data-n="${m}"
            >
              ${item.getAttribute('data-label')}
            </button>`;
            }
          }
          if (this.type === 'multiple') {
            if (_this.dataset.connect) {
              let cnt = _this.dataset.connect.split(',');

              if (!cnt.includes(item.dataset.name)) {
                make_menu += `<button
                  type="button"
                  tabindex="-1"
                  role="menuitem"
                  value="${item.dataset.lineTarget}"
                  data-n="${m}"
                >
                  ${item.getAttribute('data-label')}
                </button>`;
              } else {
                make_menu += `<button
                  type="button"
                  tabindex="-1"
                  role="menuitem"
                  value="${item.dataset.lineTarget}"
                  data-n="${m}"
									data-cancel="true"
                >
                  ${item.getAttribute('data-label')} 취소
                </button>`;
                j = j + 1;
              }
            } else {
              make_menu += `<button
                type="button"
                tabindex="-1"
                role="menuitem"
                value="${item.dataset.lineTarget}"
                data-n="${m}"
              >
                ${item.getAttribute('data-label')}
              </button>`;
            }
          }
          m = m + 1;
        }

        // if (j !== this.targets.length) {
        _wrap.insertAdjacentHTML('beforeend', make_menu);
        innerScroll.dataset.overflow = 'hidden';
        // } else {
        //   return false;
        // }

        const _menu = _wrap.querySelector('[role="menu"]');
        const _menuItem = _menu.querySelectorAll('[role="menuitem"]');
        const len = _menuItem.length;
        const el_line = this.svg.querySelector('line[data-state="ing"]');

        //선택시
        const actSelect = e => {
          isEnd = true;

          const menuItem = e.currentTarget;
          const wrap = menuItem.parentNode;
          const sel_val = Number(menuItem.value);
          const el_target = this.wrap.querySelector(
            '[data-line-target="' + sel_val + '"]'
          );

          let objFocus;

          switch (e.key) {
            case 'Tab':
              if (_menu) _menu.remove();
              if (!isEnd) {
                el_line.remove();
              }
              innerScroll.removeAttribute('data-overflow');
              break;

            case 'ArrowDown':
            case 'ArrowRight':
              objFocus = menuItem.nextSibling;
              if (!objFocus) {
                objFocus = wrap.querySelector('[role="menuitem"]:nth-child(1)');
              }
              objFocus.focus();
              break;

            case 'ArrowUp':
            case 'ArrowLeft':
              objFocus = menuItem.previousSibling;
              if (!objFocus) {
                objFocus = wrap.querySelector(
                  '[role="menuitem"]:nth-child(' + len + ')'
                );
              }
              objFocus.focus();
              break;

            case 'Enter':
              if (menuItem.dataset.cancel === 'true') {
                _menu.remove();

                //data-connect 값 수정
                let ary_conect = _this.dataset.connect.split(',');
                let ary_conect2 = [];
                ary_conect.filter(v => {
                  if (v !== el_target.dataset.name) {
                    ary_conect2.push(v);
                  }
                });
                _this.dataset.connect = ary_conect2;

                //생성된 라인삭제 및 초기화
                el_line.remove();
                el_target.dataset.complete = false;
                _this.dataset.active = '';
                _this.dataset.complete = false;
                _this.focus();

                const value = _this.dataset.lineObject;
                const _value = el_target.dataset.lineTarget;
                const v1 = value.split(',');
                const v2 = _value.split(',');

                if (this.type === 'multiple') {
                  //multiple인 경우 정오답
                  if (v1.filter(x => v2.includes(x)).length > 0) {
                    el_line.dataset.answer = true;
                  } else {
                    el_line.dataset.answer = false;
                  }
                }

                // else {
                // 	//single인 경우 정오답
                // 	if (value === _value) {
                // 		el_line.dataset.answer = true;
                // 		this.answer_n = this.answer_n - 1;
                // 	} else {
                // 		el_line.dataset.answer = false;
                // 	}
                // }

                //this.answer_last 선택삭제
                const elements = this.answer_last.entries();
                for (const [index, _last] of elements) {
                  const key1 = _last['key' + _this.dataset.name];
                  const key2 = _last['key' + el_target.dataset.name];
                  if (
                    key1 === _this.dataset.lineObject &&
                    key2 === el_target.dataset.lineTarget
                  ) {
                    this.answer_last.splice(index, 1);
                    document
                      .querySelector(
                        `line[data-name="${_this.dataset.name}"][data-target-name="${el_target.dataset.name}"]`
                      )
                      .remove();
                  }
                }

                const trueLines = this.svg.querySelectorAll(
                  'line[data-answer="true"]'
                );
                const falseLines = this.svg.querySelectorAll(
                  'line[data-answer="false"]'
                );
                this.answer_n = trueLines?.length - falseLines?.length;
                //콜백
                if (this.callback) {
                  this.callback({
                    answer_state:
                      this.answer_n === this.answer_len ? true : false,
                    answer_last: this.answer_last,
                  });
                }

                return false;
              }

              el_line.dataset.state = 'complete';
              el_target.dataset.complete = true;
              _this.dataset.active = '';
              _this.dataset.complete = true;
              _this.focus();

              //target 연결된 정보
              if (!el_target.dataset.connect) {
                el_target.dataset.connect = _this.dataset.name;
              } else {
                el_target.dataset.connect =
                  el_target.dataset.connect + ',' + _this.dataset.name;
              }

              //object에 연결된 정보
              if (!_this.dataset.connect) {
                _this.dataset.connect = el_target.dataset.name;
              } else {
                _this.dataset.connect =
                  _this.dataset.connect + ',' + el_target.dataset.name;
              }

              //최종 라인종료 위치
              const _rect_item = el_target.getBoundingClientRect();
              const item_w = el_target.offsetWidth / 2;
              const item_h = el_target.offsetHeight / 2;

              //svg line
              el_line.setAttribute(
                'x2',
                _rect_item.left + item_w - this.wrap_l
              );
              el_line.setAttribute('y2', _rect_item.top + item_h - this.wrap_t);
              el_line.dataset.targetName = el_target.dataset.name;

              //접근성 aria-label
              let object_correct = _this.dataset.connect;

              object_correct = object_correct.split(',');
              let label_txt = '';

              for (let i = 0; i < object_correct.length; i++) {
                const el = this.wrap.querySelector(
                  '[data-line-target][data-name="' + object_correct[i] + '"]'
                );
                if (label_txt !== '') {
                  label_txt = label_txt + ', ' + el.getAttribute('aria-label');
                } else {
                  label_txt = el.getAttribute('aria-label');
                }
              }
              _this.setAttribute(
                'aria-label',
                `${_this.dataset.label}, ${label_txt} 연결됨`
              );

              //정오답적용
              const value = _this.dataset.lineObject;
              const _value = el_target.dataset.lineTarget;
              const v1 = value.split(',');
              const v2 = _value.split(',');

              if (this.type === 'multiple') {
                //multiple인 경우 정오답
                if (v1.filter(x => v2.includes(x)).length > 0) {
                  el_line.dataset.answer = true;
                } else {
                  el_line.dataset.answer = false;
                }
              } else {
                //single인 경우 정오답
                if (value === _value) {
                  el_line.dataset.answer = true;
                } else {
                  el_line.dataset.answer = false;
                }
              }

              const trueLines = this.svg.querySelectorAll(
                'line[data-answer="true"]'
              );
              const falseLines = this.svg.querySelectorAll(
                'line[data-answer="false"]'
              );
              this.answer_n = trueLines?.length - falseLines?.length;

              //콜백정보정리
              this.complete_n = this.complete_n + 1;

              //answer_last 수정일 경우
              if (this.answer_last) {
                for (let i = 0; i < this.answer_last.length; i++) {
                  if (
                    Object.keys(this.answer_last[i]).includes(
                      'key' + _this.dataset.name
                    )
                  ) {
                    if (this.type === 'single') {
                      this.answer_last.splice(i, 1);
                    }
                    this.complete_n = this.complete_n - 1;
                  }
                }
              }

              if (_this.dataset.lineObject) {
                this.answer_last.push({
                  ['key' + _this.dataset.name]: _this.dataset.lineObject,
                  ['key' + el_target.dataset.name]:
                    el_target.dataset.lineTarget,
                });
              } else {
                this.answer_last.push({
                  ['key' + el_target.dataset.name]:
                    el_target.dataset.lineObject,
                  ['key' + _this.dataset.name]: _this.dataset.lineTarget,
                });
              }
              if (this.callback) {
                this.callback({
                  answer_state:
                    this.answer_n === this.answer_len ? true : false,
                  answer_last: this.answer_last,
                });
              }
              if (_menu) _menu.remove();
              if (!isEnd) {
                el_line.remove();
              }
              innerScroll.removeAttribute('data-overflow');
              break;

            default:
              break;
          }
        };

        //이벤트
        _menu.querySelector('[role="menuitem"]:nth-child(1)').focus();
        for (const item of _menuItem) {
          item.addEventListener('keydown', actSelect);
        }
      }
    };

    //event
    for (const item of this.items) {
      if (this.isTouch) {
        //touch mode
        item.addEventListener('touchstart', actStart, {
          passive: false,
        });
      } else {
        item.addEventListener('mousedown', actStart);
        item.addEventListener('keydown', actKey);
      }
    }
  }

  completeCallback() {
    if (this.callbackComplete) {
      this.callbackComplete({
        /*전체정답갯수  */ answer_all_sum: this.answer_len,
        /*현재정답갯수  */ answer_current_sum: this.answer_n,
        /*전체정오답상태*/ answer_all_state:
          this.answer_len === this.answer_n ? true : false,
        /*히스토리     */ answer_last: this.answer_last,
      });
    }
  }

  //초기화 실행
  reset = v => {
    const isDeep = v;
    for (let item of this.items) {
      item.removeAttribute('data-state');
      item.removeAttribute('data-complete');
      item.removeAttribute('data-connect');
      item.setAttribute('aria-label', item.dataset.label);
    }
    this.svg = this.wrap.querySelector('svg');
    if (this.svg.lastChild) {
      while (this.svg.lastChild) {
        this.svg.removeChild(this.svg.lastChild);
      }
    }

    if (isDeep) {
      this.answer_last = [];
    }
    this.wrap.dataset.state = '';
    this.complete_n = 0;
    this.answer_n = 0;

    console.log('isDeep', isDeep, this.answer_last);
  };

  //정오답체크
  check = () => {
    this.wrap.dataset.state = 'check';
    if (this.callbackCheck) {
      this.callbackCheck({
        answer_all_sum: this.answer_len,
        answer_current_sum: this.answer_n,
        answer_all_state: this.answer_len === this.answer_n ? true : false,
        answer_last: this.answer_last,
      });
    }
  };

  //정답확인 그리기
  complete = () => {
    this.reset();
    for (let i = 0; i < this.n; i++) {
      const el_object = this.items[i];
      const value = el_object.dataset.lineObject;
      if (value !== 'null') {
        const _v = value.split(',');
        for (let j = 0; j < _v.length; j++) {
          const el_target = this.wrap.querySelector(
            `[data-line-target="${_v[j]}"]`
          );

          this.svg.insertAdjacentHTML(
            'beforeend',
            `<line x1="${el_object.dataset.x}" x2="${el_target.dataset.x}" y1="${el_object.dataset.y}" y2="${el_target.dataset.y}" data-state="complete"></line>`
          );
        }
      }
    }
    this.answer_n = this.answer_len;
    this.wrap.dataset.state = 'complete';
    this.completeCallback();
  };

  //마지막 답선택 그리기
  drawLastAnswer = (v) => {
    //새로운 정답정보가 있다면 교체
    if (v) {
      this.reset();
      this.answer_last = v.lastAnswer;
    } else if (!this.answer_last.length){
      return false;
    }

    for (let i = 0; i < this.answer_last.length; i++) {
      const item = this.answer_last[i];
      const keyname = Object.keys(item);
      const el_object = this.wrap.querySelector(
        `[data-name="${keyname[0].split('key')[1]}"]`
      );
      const el_target = this.wrap.querySelector(
        `[data-name="${keyname[1].split('key')[1]}"]`
      );

      //해당 object,target 상태 설정
      el_object.dataset.complete = 'true';
      el_object.dataset.connect = el_target.dataset.name;
      el_object.setAttribute('aria-label', item.label);
      el_target.dataset.complete = 'true';
      el_target.dataset.connect = el_object.dataset.name;

      //정답여부 체크하여 정답인 경우 정답갯수(this.answer_n)증가
      const is_answer = item[keyname[0]] === item[keyname[1]];
      if (is_answer) {
        this.answer_n = this.answer_n + 1;
      }

      //선라인 그리기
      this.svg.insertAdjacentHTML(
        'beforeend',
        `<line x1="${el_object.dataset.x}" x2="${el_target.dataset.x}"
          y1="${el_object.dataset.y}"
          y2="${el_target.dataset.y}"
          data-state="complete"
          data-target-name="${el_target.dataset.name}"
          data-object-name="${el_object.dataset.name}"
          data-name="${el_object.dataset.name}"
          data-answer="${is_answer ? true : false}"></line>`
      );
    }
  };
}
