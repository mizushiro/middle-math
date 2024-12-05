import Layer from '../../../assets/js/components/layer.js';
export default class Datepicker {
    constructor (opt){
        const defaults = {
            isFooter: false,
            specialday:{
                "1":[
                    {"solar": true, "day":1, "holiday": true, "name":"신정", "sub": false},
                    {"solar": false, "day":1, "holiday": true, "name":"설날", "sub": true},
                    {"solar": false, "day":2, "holiday": true, "name":"설날 다음날", "sub": true}
                ],
                "2":[],
                "3":[
                    {"solar": true, "day": 1, "holiday": true, "name": "삼일절", "sub": true}
                ],
                "4": [
                    {"solar": false, "day": 8, "holiday": true, "name": "석가탄신일", "sub": false}
                ],
                "5": [
                    {"solar": true, "day": 5, "holiday": true, "name": "어린이날", "sub": true}
                ],
                "6": [
                    {"solar": true, "day": 6, "holiday": true, "name": "현충일", "sub": false}
                ],
                "7": [],
                "8": [
                    {"solar": true, "day": 15, "holiday": true, "name": "광복절", "sub": true},
                    {"solar": false, "day": 14, "holiday": true, "name": "추석 전날", "sub": true},
                    {"solar": false, "day": 15, "holiday": true, "name": "추석", "sub": true},
                    {"solar": false, "day": 16, "holiday": true, "name": "추석 다음날", "sub": true}
                ],
                "9": [],
                "10": [
                    {"solar": true, "day": 3, "holiday": true, "name": "개천절", "sub": true},
                    {"solar": true, "day": 9, "holiday": true, "name": "한글날", "sub": true}
                ],
                "11": [
                    {}
                ],
                "12": [
                    {"solar": true, "day": 25, "holiday": true, "name": "성탄절", "sub": false},
                    {"solar": false, "day": 'last', "holiday": true, "name": "설날 전날", "sub":true}
                ],
            },
            week : ['일', '월', '화', '수', '목', '금', '토', '년', '월' , '일'],
            baseTxt: ['년','월','일'],
        }
        this.opt = Object.assign({}, defaults, opt);
        this.id = opt.id;

        this.el_wrap = document.querySelector('.mdl-datepicker[data-id="'+ this.id +'"]');
        this.el_input = this.el_wrap.querySelector('input');
        this.el_btn = this.el_wrap.querySelector('.mdl-datepicker-btn');

        this.todayDate = {
            yyyy : this.opt.val.split('-')[0],
            mm : this.opt.val.split('-')[1],
            dd : this.opt.val.split('-')[2],
        }

        this.modal;

        this.year;
        this.month;
        this.day;
        this.leapMonth;

        console.log(this.todayDate);
        this.init();
       
    }
    init() {
        this.set();
        this.el_btn.addEventListener('click',this.show);
    }
    show = () => {
        this.modal.show()
    }
    make () {
        const day = opt.day;
        const id = opt.id;
        const datepicker_date = !!day ? day : new Date();
        let datepicker_today;
        
        if (!!day) {
                datepicker_today = day;
        } else  {
                datepicker_today =  datepicker_date.getFullYear() + '-' + ("0" + (1 + datepicker_date.getMonth())).slice(-2) + '-' + ("0" + datepicker_date.getDate()).slice(-2);
        }
        
        document.querySelector('#' + id).value = datepicker_today;
        Global.datepicker.init();
    }
    destroy() {

    }
    //음력계산
    solarToLunar(solYear, solMonth, solDay){
        const LUNAR_LAST_YEAR = 1939;
        const lunarMonthTable = [
            [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],   /* 양력 1940년 1월은 음력 1939년에 있음 그래서 시작년도는 1939년*/
            [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   /* 1941 */
            [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
            [1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
            [2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   /* 1951 */
            [1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
            [2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
            [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   /* 1961 */
            [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
            [1, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
            [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
            [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
            [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
            [2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
            [2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
            [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
            [2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
            [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
            [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
            [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
            [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
            [2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
            [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1],
            [2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
            [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
            [2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
            [2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
            [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
            [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
            [1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
            [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
            [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
            [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
            [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
            [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
            [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
            [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2]];

        // 음력 계산을 위한 객체
        const myDate = (year, month, day, leapMonth) => {
            this.year = year;
            this.month = month;
            this.day = day;
            this.leapMonth = leapMonth;
        }

        // 양력을 음력으로 계산
        const lunarCalc = (year, month, day, type, leapmonth) => {
            let solYear, solMonth, solDay;
            let lunYear, lunMonth, lunDay;
            // lunLeapMonth는 음력의 윤달인지 아닌지를 확인하기위한 변수
            // 1일 경우 윤달이고 0일 경우 음달
            let lunLeapMonth, lunMonthDay;
            let i, lunIndex;
            let solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            /* range check */
            if (year < 1940 || year > 2040) {
                alert('1940년부터 2040년까지만 지원합니다');
                return;
            }

            /* 속도 개선을 위해 기준 일자를 여러개로 한다 */
            if (year >= 2000) {
                /* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
                solYear = 2000;
                solMonth = 1;
                solDay = 1;
                lunYear = 1999;
                lunMonth = 11;
                lunDay = 25;
                lunLeapMonth = 0;
                solMonthDay[1] = 29;    /* 2000 년 2월 28일 */
                lunMonthDay = 30;   /* 1999년 11월 */
            }
            else if (year >= 1970) {
                /* 기준일자 양력 1970년 1월 1일 (음력 1969년 11월 24일) */
                solYear = 1970;
                solMonth = 1;
                solDay = 1;
                lunYear = 1969;
                lunMonth = 11;
                lunDay = 24;
                lunLeapMonth = 0;
                solMonthDay[1] = 28;    /* 1970 년 2월 28일 */
                lunMonthDay = 30;   /* 1969년 11월 */
            }
            else {
                /* 기준일자 양력 1940년 1월 1일 (음력 1939년 11월 22일) */
                solYear = 1940;
                solMonth = 1;
                solDay = 1;
                lunYear = 1939;
                lunMonth = 11;
                lunDay = 22;
                lunLeapMonth = 0;
                solMonthDay[1] = 29;    /* 1940 년 2월 28일 */
                lunMonthDay = 29;   /* 1939년 11월 */
            }

            lunIndex = lunYear - LUNAR_LAST_YEAR;

            // type이 1일때는 입력받은 양력 값에 대한 음력값을 반환
            // 2일 때는 입력받은 음력 값에 대한 양력값을 반환
            // 반복문이 돌면서 양력 값들과 음력 값들을 1일 씩 증가시키고
            // 입력받은 날짜값과 양력 값이 일치할 때 음력값을 반환함
            while (true) {
                if (type == 1 &&
                    year == solYear &&
                    month == solMonth &&
                    day == solDay) {
                    return new myDate(lunYear, lunMonth, lunDay, lunLeapMonth);
                }
                else if (type == 2 &&
                    year == lunYear &&
                    month == lunMonth &&
                    day == lunDay &&
                    leapmonth == lunLeapMonth) {
                    return new myDate(solYear, solMonth, solDay, 0);
                }

                // 양력의 마지막 날일 경우 년도를 증가시키고 나머지 초기화
                if (solMonth == 12 && solDay == 31) {
                    solYear++;
                    solMonth = 1;
                    solDay = 1;

                    // 윤년일 시 2월달의 총 일수를 1일 증가
                    if (solYear % 400 == 0) solMonthDay[1] = 29;
                    else if (solYear % 100 == 0) solMonthDay[1] = 28;
                    else if (solYear % 4 == 0) solMonthDay[1] = 29;
                    else solMonthDay[1] = 28;
                }
                // 현재 날짜가 달의 마지막 날짜를 가리키고 있을 시 달을 증가시키고 날짜 1로 초기화
                else if (solMonthDay[solMonth - 1] == solDay) {
                    solMonth++;
                    solDay = 1;
                }
                else {
                    solDay++;
                }

                // 음력의 마지막 날인 경우 년도를 증가시키고 달과 일수를 초기화
                if (lunMonth == 12 &&
                    ((lunarMonthTable[lunIndex][lunMonth - 1] == 1 && lunDay == 29) ||
                        (lunarMonthTable[lunIndex][lunMonth - 1] == 2 && lunDay == 30))) {
                    lunYear++;
                    lunMonth = 1;
                    lunDay = 1;

                    if (lunYear > 2043) {
                        alert("입력하신 달은 없습니다.");
                        break;
                    }

                    // 년도가 바꼈으니 index값 수정
                    lunIndex = lunYear - LUNAR_LAST_YEAR;

                    // 음력의 1월에는 1 or 2만 있으므로 1과 2만 비교하면됨
                    if (lunarMonthTable[lunIndex][lunMonth - 1] == 1) lunMonthDay = 29;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2) lunMonthDay = 30;
                }
                // 현재날짜가 이번달의 마지막날짜와 일치할 경우
                else if (lunDay == lunMonthDay) {

                    // 윤달인데 윤달계산을 안했을 경우 달의 숫자는 증가시키면 안됨
                    if (lunarMonthTable[lunIndex][lunMonth - 1] >= 3
                        && lunLeapMonth == 0) {
                        lunDay = 1;
                        lunLeapMonth = 1;
                    }
                    // 음달이거나 윤달을 계산 했을 겨우 달을 증가시키고 lunLeapMonth값 초기화
                    else {
                        lunMonth++;
                        lunDay = 1;
                        lunLeapMonth = 0;
                    }

                    // 음력의 달에 맞는 마지막날짜 초기화
                    if (lunarMonthTable[lunIndex][lunMonth - 1] == 1)
                        lunMonthDay = 29;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2)
                        lunMonthDay = 30;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 3)
                        lunMonthDay = 29;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
                        lunLeapMonth == 0)
                        lunMonthDay = 29;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
                        lunLeapMonth == 1)
                        lunMonthDay = 30;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
                        lunLeapMonth == 0)
                        lunMonthDay = 30;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
                        lunLeapMonth == 1)
                        lunMonthDay = 29;
                    else if (lunarMonthTable[lunIndex][lunMonth - 1] == 6)
                        lunMonthDay = 30;
                }
                else
                    lunDay++;
            }
        }
        // 날짜 형식이 안맞을 경우 공백 반환
        if (!solYear || solYear == 0 ||
            !solMonth || solMonth == 0 ||
            !solDay || solDay == 0) {
            return "";
        }

        // 양력의 달마다의 일수
        const solMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // 윤년일 시 2월에 1일 추가
        if (solYear % 400 == 0 || (solYear % 4 == 0 && solYear % 100 != 0)) solMonthDays[1] += 1;
        if (solMonth < 1 || solMonth > 12 ||
            solDay < 1 || solDay > solMonthDays[solMonth - 1]) {

            return "";
        }

        /* 양력/음력 변환 */
        const date = lunarCalc(solYear, solMonth, solDay, 1);
        //(date.leapMonth ? "(윤)" : "") + 
        return date.month + "-" + date.day;
    }
    set = () => {
        let html_datepicker = `
        <section class="mdl-layer" data-id="${ this.id }" data-state="" role="dialog">
            <div class="mdl-layer-wrap">
                <div class="mdl-layer-header">
                    <h1>${ this.id }</h1>
                    <div class="mdl-datepicker-header">
                        <div>
                            <button type="button" class="mdl-datepicker-prev-y" aria-label="지난 해"></button>
                            <div>${ this.todayDate.yyyy }</div>
                            <button type="button" class="mdl-datepicker-next-y" aria-label="다음 해"></button>
                        </div>
                        <div>
                            <button type="button" class="mdl-datepicker-prev-m" aria-label="지난 달"></button>
                            <div>${ this.todayDate.mm }</div>
                            <button type="button" class="mdl-datepicker-next-m" aria-label="다음 달"></button>
                        </div>
                        <button type="button" class="mdl-datepicker-today" aria-label="오늘"></button>
                    </div>
                    <button type="button" class="mdl-layer-close" data-material="close" aria-label="닫기"></button>
                </div>
                <div class="mdl-layer-body">
                    <div class="mdl-datepicker-body">
                        <table>
                            <caption>${ this.id }</caption>
                            <colgroup>
                                <col span="7">
                            </colgroup>
                            <thead>
                                <tr>
                                <th scope="col">${ this.opt.week[0] }</th>
                                <th scope="col">${ this.opt.week[1] }</th>
                                <th scope="col">${ this.opt.week[2] }</th>
                                <th scope="col">${ this.opt.week[3] }</th>
                                <th scope="col">${ this.opt.week[4] }</th>
                                <th scope="col">${ this.opt.week[5] }</th>
                                <th scope="col">${ this.opt.week[6] }</th>
                                </tr>
                            </thead>
                            <tbody class="mdl-datepicker-date"></tbody>
                        </table>
                    </div>
                </div>
                <div class="mdl-layer-footer">
                    <button type="button" class="mdl-button">
                        <span>확인</span>
                    </button>
                </div>
            </div>
            <div class="mdl-layer-dim"></div>
        </section>`;
        document.querySelector('body').insertAdjacentHTML('beforeend', html_datepicker);
        html_datepicker = null;

        this.modal = new Layer({
            id : this.id,
            type: 'modal',
        });
        
    }

}