export default class IABoard {
    constructor(opt) {
        this.file = opt.url;
        this.id = opt.id;

        this.link = '';
        this.main = document.querySelector('.base-main');
        this.tit = this.main.querySelector('.tit');
        this.items = this.main.querySelectorAll('.item');
        this.selects = this.main.querySelectorAll('select');
        this.a = this.main.querySelectorAll('a');
        this.len = this.items.length;
        this.treeInfo = null;

        this.init();
    }
    iframe() {
        setTimeout(() => {
            let _link = document.createElement('link');
            _link.rel = 'stylesheet';
            _link.href = '../../assets/css/iframe.css';
            iframe.contentWindow.document.head.appendChild(_link);
        },300);
    }
    init() {
        const loadItems = () => {
            return fetch(this.file).then((response) => response.json()).then((json) => json.list);
        }

        loadItems().then((item) => {
            let today = new Date();
            const getFormatDate = (date) => {
                const year = date.getFullYear();
                let month = (1 + date.getMonth());
                let day = date.getDate();

                month = month >= 10 ? month : '0'+ month;
                day = day >= 10 ? day : '0'+ day;

                return year +'-'+ month +'-'+ day;
            }
            const changeFormatDate = (date) => {
                const year = date.substring(0, 4);
                let month = date.substring(4, 6);
                let day = date.substring(6, 8);
                month = month >= 10 ? month : '0'+ month;
                day = day >= 10 ? day : '0'+ day;

                return year +'-'+ month +'-'+ day;
            }
            const dateDiff = (...arg) => {
                const _date1 = arg[0];
                const _date2 = arg[1];

                let diffDate_1 = _date1 instanceof Date ? _date1 : new Date(_date1);
                let diffDate_2 = _date2 instanceof Date ? _date2 : new Date(_date2);

                diffDate_1 = new Date(diffDate_1.getFullYear(), diffDate_1.getMonth() + 1, diffDate_1.getDate());
                diffDate_2 = new Date(diffDate_2.getFullYear(), diffDate_2.getMonth() + 1, diffDate_2.getDate());

                const gt1 = diffDate_1.getTime();
                const gt2 = diffDate_2.getTime();

                return gt2 - gt1 < 0 ? '' : '-'+ Math.ceil(Math.abs(gt2 - gt1) / (1000 * 3600 * 24));
            }

            today = getFormatDate(today);

            let state, date, date_e, ver, pub, type, name, id, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, memo, root;
            let endsum = 0,
                delsum = 0,
                watsum = 0,
                num = -1,

                ctg_state = [],
                ctg_pub = [],
                ctg_dev = [],
                ctg_date = [],
                ctg_date_e = [],
                ctg_menu = [],
                cls = '',
                table = '';

            const dataExecelList = item;
            const len = dataExecelList.length;

            for (let i = 0; i < len; i++) {
                const x = (i === 0) ? 0 : i - 1;
                const item = dataExecelList[i];
                const item_prev = dataExecelList[x];

                state = item.state || '';
                date = item.date || '';
                date_e = item.date_e || '';
                ver = item.ver || '';
                pub = item.pub || '';
                type = item.type || '';
                name = item.name || '';
                id = item.id || '';
                d1 = item.d1 || '';
                d2 = item.d2 || '';
                d3 = item.d3 || '';
                d4 = item.d4 || '';
                d5 = item.d5 || '';
                d6 = item.d6 || '';
                d7 = item.d7 || '';
                d8 = item.d8 || '';
                d9 = item.d9 || '';
                d10 = item.d10 || '';
                memo = item.memo || '';
                root = item.root || '';

                endsum = (state === "완료") ? endsum + 1 : endsum;
                delsum = (state === "제외") ? delsum + 1 : delsum;
                watsum = (state === "대기") ? watsum + 1 : watsum;
                
                let depthChange = false;

                const depthClass = (v) => {
                    let current = item['d'+ v].trimEnd();
                    let prev = item_prev['d'+ v].trimEnd();

                    if (current !== '' && current !== prev) {
                        item['c'+ v] = ' c'+ v
                        depthChange = true;
                    } else {
                        item['c'+ v] = depthChange ? ' c'+ v : '';
                    }
                }

                for (let j = 0; j < 10; j++) {
                    depthClass(j + 1);
                }

                cls = item.c1 + item.c2 + item.c3 + item.c4 + item.c5 + item.c6 + item.c7 + item.c8 + item.c9 + item.c10;

                ctg_state.push(item.state);
                ctg_pub.push(item.pub);
                ctg_dev.push(item.dev);
                state !== '제외' ? ctg_date.push(item.date) : '';
                ctg_date_e.push(item.date_e);
                ctg_menu.push(item.d2);

                if (i === 0) {
                    table += '<div>';
                    table += '<table>';
                    table += '<caption>코딩리스트</caption>';
                    table += '<thead>';
                    table += '  <th scope="col">'+ state +'</th>';
                    table += '  <th scope="col">'+ date +'</th>';
                    table += '  <th scope="col">'+ date_e +'</th>';
                    table += '  <th scope="col">'+ ver +'</th>';
                    table += '  <th scope="col">'+ pub +'</th>';
                    table += '  <th scope="col">'+ name +'</th>';
                    table += '  <th scope="col">'+ id +'</th>';
                    table += '  <th scope="col">'+ type +'</th>';
                    table += '  <th scope="col">'+ d1 +'</th>';
                    table += '  <th scope="col">'+ d2 +'</th>';
                    table += '  <th scope="col">'+ d3 +'</th>';
                    table += '  <th scope="col">'+ d4 +'</th>';
                    table += '  <th scope="col">'+ d5 +'</th>';
                    table += '  <th scope="col">'+ d6 +'</th>';
                    table += '  <th scope="col">'+ d7 +'</th>';
                    table += '  <th scope="col">'+ d8 +'</th>';
                    table += '  <th scope="col">'+ d9 +'</th>';
                    table += '  <th scope="col">'+ d10 +'</th>';
                    table += '  <th scope="col">'+ memo +'</th>';
                    table += '</thead>';
                    table += '<tbody>';
                } else {
                    num = num + 1;

                    // if (!(date === '미정' || date === '일정' || date === undefined) && state !== '완료') {
                    //     let dateStart = date;

                    //     dateStart = changeFormatDate(dateStart)
                    //     const care = dateDiff(dateStart, new Date());

                    //     if (care < 3 && care >= 0) {
                    //         cls = cls +' sch_care';
                    //     } else if (care < 0) {
                    //         cls = cls +' sch_warn';
                    //     }
                    // }

                    // if (!(date_e === '미정' || date_e === '작업일' || date === undefined) && state === '완료') {
                    //     let dateStart = date_e;

                    //     dateStart = changeFormatDate(dateStart)
                    //     const todayModify = dateDiff(dateStart, new Date());

                    //     if (Number(todayModify) === 0) {
                    //         cls = cls +' today-mod';
                    //     }
                    // }

                    if (!!item.c1) {
                        table += '</tbody>';
                        table += '<tbody>';
                    }
                    table += '<tr class="'+ cls +'" data-id="'+ name +'" data-pub="'+ pub +'" data-state="'+ state +'">';
                    table += '  <td class="state"><span>'+ state +'</span></td>';
                    table += '  <td class="date"><span>'+ date.substring(4, 10) +'</span></td>';
                    table += '  <td class="date"><span>'+ date_e.substring(4, 10) +'</span></td>';
                    table += '  <td class="ver"><span>'+ ver +'</span></td>';
                    table += '  <td class="pub" ><span>'+ pub +'</span></td>';
                    table += '  <td class="name"><span><a class="mdl-coding-link" href="'+ (root + name) +'.html" target="_coding">'+ name +'</a></td>';
                    table += '  <td class="id"><span>'+ id +'</span></td>';
                    table += '  <td class="type"><span>'+ type +'</span></td>';
                    table += '  <td class="d d1 '+ (d1 && 'is') +'"><span>'+ d1 +'</span></td>';
                    table += '  <td class="d d2 '+ (d2 && 'is') +'"><span>'+ d2 +'</span></td>';
                    table += '  <td class="d d3 '+ (d3 && 'is') +'"><span>'+ d3 +'</span></td>';
                    table += '  <td class="d d4 '+ (d4 && 'is') +'"><span>'+ d4 +'</span></td>';
                    table += '  <td class="d d5 '+ (d5 && 'is') +'"><span>'+ d5 +'</span></td>';
                    table += '  <td class="d d6 '+ (d6 && 'is') +'"><span>'+ d6 +'</span></td>';
                    table += '  <td class="d d7 '+ (d7 && 'is') +'"><span>'+ d7 +'</span></td>';
                    table += '  <td class="d d8 '+ (d8 && 'is') +'"><span>'+ d8 +'</span></td>';
                    table += '  <td class="d d9 '+ (d9 && 'is') +'"><span>'+ d9 +'</span></td>';
                    table += '  <td class="d d10 '+ (d10 && 'is') +'"><span>'+ d10 +'</span></td>';
                    table += '  <td class="memo"><span>'+ memo +'</span></td>';
                    table += '</tr>';

                    if (i === len - 1) {
                        table += '</tbody>';
                        table += '</table>';
                    } 
                }
                table += '</div>';
                root = '';
            }

            const codinglist = document.querySelector('#'+ this.id);
            codinglist.innerHTML = table;
            table = '';

            //head
            let info = '';
            info += '<div class="mdl-codinglist-header">';
            info += '<div class="mdl-codinglist-state"><dl><dt>'+ today +'</dt><dd>'
            info += '<ul class="mdl-codinglist-info">';
            info += '<li><b class="target">전체</b> 진행율 : <span class="n_all">0</span> / <span class="total">0</span> (<span class="per0">0</span>%)</li>';
            info += '</ul></dd></dl><span class="bar"><span></div>';
            info += '<div class="box-srch mt-x1">';
            info += '<div class="srch-area">';
            info += '<div class="mdl-select mr-x1"><select title="상태" id="arstate">';

            const arstate = Array.from(new Set(ctg_state));
            for (let i = 0; i < arstate.length; i++) {
                if (i === 0) {
                    info += '<option value="전체">전체</option>';
                } else {
                    info += '<option value="'+ arstate[i] +'">'+ arstate[i] +'</option>';
                }
            }

            info += '</select></div>';
            info += '<div class="mdl-select mr-x1"><select title="작업담당자" id="pubWorker">';

            const pubworker = Array.from(new Set(ctg_pub));
            for (let i = 0; i < pubworker.length; i++) {
                if (i === 0) {
                    info += '<option value="전체">모든 작업자</option>';
                } else {
                    info += '<option value="'+ pubworker[i] +'">'+ pubworker[i] +'</option>';
                }
            }

            info += '</select></div>';
            info += '<input type="search" id="projectListSrchCode" class="inp-base mdl-inpcancel mr-x1" value="" placeholder="검색어를 입력해주세요.">';
            info += '<button type="button" id="projectListSrchBtn" class="btn-base"><span>검색</span></button>';
            info += '</div>';
            info += '</div>';
            codinglist.insertAdjacentHTML('afterbegin', info);

            const links = document.querySelectorAll('.mdl-coding-link');
            for (let i = 0; i < links.length; i++) {
                links[i].addEventListener('click', (e) => {

                    if (window.outerWidth > 799) {
                        e.preventDefault();
                        const that = e.currentTarget;
                        const parentWrap = that.closest('tr');

                        sessionStorage.setItem('codinglist', parentWrap.dataset.id);
                        document.querySelector('.mdl-codinglist-iframe a').href = that.href;
                        document.querySelector('.mdl-codinglist-iframe iframe').src = that.href;
                        document.querySelector('.mdl-codinglist-iframe a').textContent = that.href;

                        const sId = sessionStorage.getItem('codinglist');

                        if (!!document.querySelector('.mdl-codinglist tr.on')) {
                            document.querySelector('.mdl-codinglist tr.on').classList.remove('on');
                        }

                        document.querySelector('[data-id="'+ sId +'"]').classList.add('on');

                        setTimeout(()=>{
                            let _link = document.createElement('link');
                            _link.rel = 'stylesheet';
                            _link.href = '../../assets/css/iframe.css';
                            document.querySelector('.mdl-codinglist-iframe iframe').contentWindow.document.head.appendChild(_link);
                        },300)
                    }

                });
            }

            document.querySelector('#pubWorker').addEventListener('change', (e) => {
                const that = e.currentTarget;

                if (that.value === '전체') {
                    document.querySelector('.mdl-codinglist').removeAttribute('data-pub');
                    perSet(len, endsum, delsum);
                } else {
                    document.querySelector('.mdl-codinglist').dataset.pub = that.value;
                }

                const pubs = document.querySelectorAll('tr[data-pub="'+ that.value +'"]');
                const pubs_end = document.querySelectorAll('tr[data-pub="'+ that.value +'"][data-state="완료"]');
                const pubs_del = document.querySelectorAll('tr[data-pub="'+ that.value +'"][data-state="제외"]');
                const trs = document.querySelectorAll('tr');

                trs.forEach(function (tr) {
                    tr.classList.remove('worker-view');
                });
                pubs.forEach(function (pub) {
                    pub.classList.add('worker-view');
                });

                document.querySelector('.mdl-codinglist-info .target').textContent = that.value;

                if (that.value === '전체') {
                    perSet(len, endsum, delsum);
                } else {
                    const target_len = pubs.length;
                    const target_endsum = pubs_end.length;
                    const target_delsum = pubs_del.length;

                    perSet(target_len, target_endsum, target_delsum);
                }
            });

            document.querySelector('#arstate').addEventListener('change', (e) => {
                const that = e.currentTarget;

                if (that.value === '전체') {
                    document.querySelector('.mdl-codinglist').removeAttribute('data-state');
                } else {
                    document.querySelector('.mdl-codinglist').dataset.state = that.value;
                }

                const pubs = document.querySelectorAll('tr[data-state="'+ that.value +'"]');
                const trs = document.querySelectorAll('tr');

                trs.forEach((tr) => {
                    tr.classList.remove('state-view');
                });
                pubs.forEach((pub) => {
                    pub.classList.add('state-view');
                });
            });

            // document.querySelector('#nameToggle').addEventListener('click', () => {
            //   document.querySelector('.mdl-codinglist').classList.toggle('name-toggle-view');
            // });

            const el_info = document.querySelector('.mdl-codinglist-info');
            const el_total = el_info.querySelector('.total');
            const el_all = el_info.querySelector('.n_all');
            const el_per0 = el_info.querySelector('.per0');
            const el_bar = document.querySelector('.mdl-codinglist-state .bar');
            const srchCode = document.querySelector('#projectListSrchCode');
            const srchBtn = document.querySelector('#projectListSrchBtn');

            const perSet = (len, endsum, delsum) => {
                const _len = len;
                const _endsum = endsum;
                const _delsum = delsum;

                el_total.textContent = (_len - _delsum - 1);
                el_all.textContent = _endsum;
                el_per0.textContent = (_endsum / (_len - _delsum - 1) * 100).toFixed(0);
                el_bar.style.width = (_endsum / (_len - _delsum - 1) * 100).toFixed(0) +'%';
            }
            const srchAct = () => {
                const k = srchCode.value;
                const el = document.querySelector('.mdl-codinglist table');
                const el_td = el.querySelectorAll('td');
                const el_tr = el.querySelectorAll('tr');

                for (let i = 0, len = el_tr.length; i < len; i++) {
                    const that = el_tr[i];
                    that.classList.add('srch-hidden');
                }

                for (let i = 0, len = el_td.length; i < len; i++) {
                    const that = el_td[i];
                    const text = that.textContent;
                    const el_tr2 = that.closest('tr');

                    if (text.indexOf(k) >= 0) {
                        el_tr2.classList.remove('srch-hidden');
                    }
                }
            }

            perSet(len, endsum, delsum);

            if (srchCode.value !== '') {
                var temp = $('.mdl-codinglist tbody tr td *:contains('+ $('#projectListSrchCode').val() +')');

                $('.mdl-codinglist tbody tr').hide();
                $(temp).closest('tr').show();
            }

            srchBtn.addEventListener('click', srchAct);
            srchCode.addEventListener('keyup', () => {
                if (window.event.keyCode === 13) {
                    srchAct();
                }
            });
        
        }).then(() => {
            // this.nav_btns = this.nav.querySelectorAll('button');
            // for (const nav_btn of this.nav_btns) {
            //     nav_btn.addEventListener('click', this.act.bind(this));
            // }
            // for (const sel of this.selects) {
            //     sel.addEventListener('change', this.change.bind(this));
            // }
        });
    }
    set(v) {
        const iframes = document.querySelectorAll('iframe');
        const links = document.querySelectorAll('.base-main a[target]');
        for (let that of links) {
            that.href = v;
        }
        for (let iframe of iframes) {
            iframe.src = v;
        }
    }
    change(event) {
        const select = event.currentTarget;
        const v = select.value;
        const id = select.dataset.id;
        const iframe = document.querySelector('iframe[data-id="'+ id +'"]');
        iframe.name = v;
    }
    act(event) {
        const _this = this;
        const btn = event.currentTarget;
        const wrap = btn.parentNode;
        const link = btn.dataset.link;
        const childs = wrap.children;
        let isTree = false;

        // document.querySelector('.base-wrap').dataset.type = 'tree';

        for (let i of childs) {
            if (i.classList.contains('ico')) {
                isTree = true;
                break;
            }
        }

        for (let item of this.nav_btns) {
            item.classList.remove('selected');
        }
        btn.classList.add('selected');

        if (!wrap.classList.contains('on')) {
            wrap.classList.add('on');
        } else {
            wrap.classList.remove('on');
        }

        if (!!link) {
            const styleScroll = '';

            for (let i = 0; i < _this.len; i++) {
                const _input = _this.items[i].querySelector('input');
                const _iframe = _this.items[i].querySelector('iframe');
                // const name = _this.items[i].querySelector('select').value;

                // if (_input.checked) {
                    _iframe.src = link;
                    // _iframe.name = name;
                    _this.items[i].querySelector('a').href = link;
                    _this.items[i].querySelector('a').textContent = link;

                    sessionStorage.setItem('tree', link);

                    setTimeout(() => {
                        // const _body = _iframe.contentWindow.document.querySelector('.scrollBox');
                        // _body && _body.classList.add('style-scroll');
                        let _link = document.createElement('link');
                        _link.rel = 'stylesheet';
                        _link.href = '../../assets/css/iframe.css';
                        _iframe.contentWindow.document.head.appendChild(_link);

                    }, 300);
                // }
            }
        }
    }
    all(v) {
        if (v) {
            const uls = document.querySelectorAll('ul');
            for (let ul of uls) {
                const ul_parent = ul.parentNode;
                console.log(ul_parent.tagName);
                ul_parent.tagName === 'LI' && ul_parent.classList.add('on');
            }
        } else {
            const lis = document.querySelectorAll('li.on');
            for (let li of lis) {
                li.classList.remove('on');
            }
        }
    }
   
}
