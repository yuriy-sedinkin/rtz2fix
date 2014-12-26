/**
 * Временное исправление некорректной работы объекта Date в браузерах (fix Microsoft update KB2998527 for Browsers).
 * @version 0.5
 * @copyright 2014 Юрий Сединкин
 * @license MIT (http://www.opensource.org/licenses/mit-license.php)
 * Update: 25-12-2014
 *
 * В данной версии:
 * 1. Исправлена ошибка обнаруженная при тестировании setHours вблизи перевода времени с +0400 -> +0300 ( new Date(2014, 9, 26).setHours(0) )
 *
 * Спасибо тем, кто участвовал в разработке и помог обнаружить ошибки:
 * Dmitrii Pakhtinov (https://github.com/devote) - метод getTimezoneOffset использующий свою таблицу сдвигов для проблемных таймзон!
 * Serg Rogovtsev (https://github.com/srogovtsev) - критическая ошибка в конструкторе
 * moongrate (https://github.com/moongrate) - ошибка в методе Date.parse
 * https://github.com/es-shims/es5-shim - способ переопределения Date позаимствован из es5-shim.js
 */
// Проверка наличия проблемы
if ((new Date(2014, 0, 1)).getHours() != 0 || new Date(2015, 0, 7).getHours() != 0) {
  // Переопределяем конструктор, если есть соответствующая таблица перевода времени
  Date = (function (NativeDate) {

    /**
     * Возвращает объект содержащий информацию по локальной временной зоны
     * @returns {Object|null} Вернет null если не удалось найти подходящюю зону
     */
    function getLocaleTimezone() {
      var result = null;
      /**
       * Данные по временным зонам взяты на http://timezonedb.com/download
       * Формат массива zone состоит из пар, каждая пара состоит из:
       *  - дата в минутах с которой происходит сдвиг времени
       *  - количество минут на которое произашел сдвиг
       * @type {{name: string, zone: *[]}[]}
       */
      var timezone = [
        {"name":"Kaliningrad (RTZ 1)","zone":[-35791394,-60,-35789954,-60,-28228440,-120,-28008060,-60,-27724260,-120,-27502500,-60,-27200100,-120,-26978340,-60,-15648420,-120,-14287620,-60,-14075940,-120,-13803780,-60,-13541700,-120,-13279620,-60,-13148700,-120,-12978840,-180,-12711060,-120,-12623160,-180,5915340,-240,6178800,-180,6440940,-240,6704400,-180,6966540,-240,7230000,-180,7493580,-240,7755780,-180,8017860,-240,8279940,-180,8542020,-240,8804100,-180,9066180,-240,9328260,-180,9590340,-240,9852420,-180,10114500,-240,10376580,-180,10638660,-240,10910820,-180,11172900,-180,11435040,-120,11696940,-180,11958960,-120,12221280,-180,12483360,-120,12745440,-180,13007520,-120,13269600,-180,13531680,-120,13803840,-180,14106240,-120,14328000,-180,14630400,-120,14852160,-180,15154560,-120,15376320,-180,15688800,-120,15900480,-180,16212960,-120,16424640,-180,16737120,-120,16958880,-180,17261280,-120,17483040,-180,17785440,-120,18007200,-180,18319680,-120,18531360,-180,18843840,-120,19055520,-180,19368000,-120,19579680,-180,19892160,-120,20113920,-180,20416320,-120,20638080,-180,20940480,-120,21162240,-180,21474720,-120,21686400,-180,23571300,-120]},
        {"name":"Moscow, St. Petersburg, Volgograd (RTZ 2)","zone":[-35791394,-150,-35789954,-150,-28137750,-151,-27613651,-211,-27355891,-151,-27132751,-271,-26978611,-211,-26607151,-271,-26563831,-240,-26497680,-180,-25707120,-240,-25658220,-300,-25422060,-240,-25378800,-180,-24853140,-120,-20792280,-180,5915340,-240,6178800,-180,6440940,-240,6704400,-180,6966540,-240,7230000,-180,7493580,-240,7755780,-180,8017860,-240,8279940,-180,8542020,-240,8804100,-180,9066180,-240,9328260,-180,9590340,-240,9852420,-180,10114500,-240,10376580,-180,10638660,-240,10910820,-180,11172900,-180,11435040,-120,11596320,-180,11696880,-240,11958900,-180,12221220,-240,12483300,-180,12745380,-240,13007460,-180,13269540,-240,13531620,-180,13803780,-240,14106180,-180,14327940,-240,14630340,-180,14852100,-240,15154500,-180,15376260,-240,15688740,-180,15900420,-240,16212900,-180,16424580,-240,16737060,-180,16958820,-240,17261220,-180,17482980,-240,17785380,-180,18007140,-240,18319620,-180,18531300,-240,18843780,-180,19055460,-240,19367940,-180,19579620,-240,19892100,-180,20113860,-240,20416260,-180,20638020,-240,20940420,-180,21162180,-240,21474660,-180,21686340,-240,23571240,-180]},
        {"name":"Izhevsk, Samara (RTZ 3)","zone":[-35791394,-200,-35789954,-200,-26563760,-180,-20792340,-240,-18371760,-240,5915280,-300,6178740,-240,6440880,-300,6704340,-240,6966480,-300,7229940,-240,7493520,-300,7755720,-240,8017800,-300,8279880,-240,8541960,-300,8804040,-240,9066120,-300,9328200,-240,9590280,-300,9852360,-240,10114440,-240,10376580,-180,10638660,-240,10910820,-180,11172900,-180,11435040,-180,11465280,-240,11696820,-300,11958840,-240,12221160,-300,12483240,-240,12745320,-300,13007400,-240,13269480,-300,13531560,-240,13803720,-300,14106120,-240,14327880,-300,14630280,-240,14852040,-300,15154440,-240,15376200,-300,15688680,-240,15900360,-300,16212840,-240,16424520,-300,16737000,-240,16958760,-300,17261160,-240,17482920,-300,17785320,-240,18007080,-300,18319560,-240,18531240,-300,18843720,-240,19055400,-300,19367880,-240,19579560,-300,19892040,-240,20113800,-300,20416200,-240,20637960,-300,20940360,-240,21162120,-240,21474660,-180,21686340,-240]},
        {"name":"Ekaterinburg (RTZ 4)","zone":[-35791394,-242,-35789954,-242,-28137842,-225,-26543505,-240,-20792400,-300,5915220,-360,6178680,-300,6440820,-360,6704280,-300,6966420,-360,7229880,-300,7493460,-360,7755660,-300,8017740,-360,8279820,-300,8541900,-360,8803980,-300,9066060,-360,9328140,-300,9590220,-360,9852300,-300,10114380,-360,10376460,-300,10638540,-360,10910700,-300,11172780,-300,11434920,-240,11596200,-300,11696760,-360,11958780,-300,12221100,-360,12483180,-300,12745260,-360,13007340,-300,13269420,-360,13531500,-300,13803660,-360,14106060,-300,14327820,-360,14630220,-300,14851980,-360,15154380,-300,15376140,-360,15688620,-300,15900300,-360,16212780,-300,16424460,-360,16736940,-300,16958700,-360,17261100,-300,17482860,-360,17785260,-300,18007020,-360,18319500,-300,18531180,-360,18843660,-300,19055340,-360,19367820,-300,19579500,-360,19891980,-300,20113740,-360,20416140,-300,20637900,-360,20940300,-300,21162060,-360,21474540,-300,21686220,-360,23571120,-300]},
        {"name":"Novosibirsk (RTZ 5)","zone":[-35791394,-331,-35789954,-331,-26324611,-360,-20792520,-420,5915100,-480,6178560,-420,6440700,-480,6704160,-420,6966300,-480,7229760,-420,7493340,-480,7755540,-420,8017620,-480,8279700,-420,8541780,-480,8803860,-420,9065940,-480,9328020,-420,9590100,-480,9852180,-420,10114260,-480,10376340,-420,10638420,-480,10910580,-420,11172660,-420,11434800,-360,11596080,-420,11696640,-480,11958660,-420,12220980,-480,12301440,-420,12483120,-360,12745200,-420,13007280,-360,13269360,-420,13531440,-360,13803600,-420,14106000,-360,14327760,-420,14630160,-360,14851920,-420,15154320,-360,15376080,-420,15688560,-360,15900240,-420,16212720,-360,16424400,-420,16736880,-360,16958640,-420,17261040,-360,17482800,-420,17785200,-360,18006960,-420,18319440,-360,18531120,-420,18843600,-360,19055280,-420,19367760,-360,19579440,-420,19891920,-360,20113680,-420,20416080,-360,20637840,-420,20940240,-360,21162000,-420,21474480,-360,21686160,-420,23571060,-360]},
        {"name":"Krasnoyarsk (RTZ 6)","zone":[-35791394,-371,-35789954,-371,-26291891,-360,-20792520,-420,5915100,-480,6178560,-420,6440700,-480,6704160,-420,6966300,-480,7229760,-420,7493340,-480,7755540,-420,8017620,-480,8279700,-420,8541780,-480,8803860,-420,9065940,-480,9328020,-420,9590100,-480,9852180,-420,10114260,-480,10376340,-420,10638420,-480,10910580,-420,11172660,-420,11434800,-360,11596080,-420,11696640,-480,11958660,-420,12220980,-480,12483060,-420,12745140,-480,13007220,-420,13269300,-480,13531380,-420,13803540,-480,14105940,-420,14327700,-480,14630100,-420,14851860,-480,15154260,-420,15376020,-480,15688500,-420,15900180,-480,16212660,-420,16424340,-480,16736820,-420,16958580,-480,17260980,-420,17482740,-480,17785140,-420,18006900,-480,18319380,-420,18531060,-480,18843540,-420,19055220,-480,19367700,-420,19579380,-480,19891860,-420,20113620,-480,20416020,-420,20637780,-480,20940180,-420,21161940,-480,21474420,-420,21686100,-480,23571000,-420]},
        {"name":"Irkutsk (RTZ 7)","zone":[-35791394,-417,-35789954,-417,-26264577,-420,-20792580,-480,5915040,-540,6178500,-480,6440640,-540,6704100,-480,6966240,-540,7229700,-480,7493280,-540,7755480,-480,8017560,-540,8279640,-480,8541720,-540,8803800,-480,9065880,-540,9327960,-480,9590040,-540,9852120,-480,10114200,-540,10376280,-480,10638360,-540,10910520,-480,11172600,-480,11434740,-420,11596020,-480,11696580,-540,11958600,-480,12220920,-540,12483000,-480,12745080,-540,13007160,-480,13269240,-540,13531320,-480,13803480,-540,14105880,-480,14327640,-540,14630040,-480,14851800,-540,15154200,-480,15375960,-540,15688440,-480,15900120,-540,16212600,-480,16424280,-540,16736760,-480,16958520,-540,17260920,-480,17482680,-540,17785080,-480,18006840,-540,18319320,-480,18531000,-540,18843480,-480,19055160,-540,19367640,-480,19579320,-540,19891800,-480,20113560,-540,20415960,-480,20637720,-540,20940120,-480,21161880,-540,21474360,-480,21686040,-540,23570940,-480]},
        {"name":"Yakutsk (RTZ 8)","zone":[-35791394,-518,-35789954,-518,-26323718,-480,-20792640,-540,5914980,-600,6178440,-540,6440580,-600,6704040,-540,6966180,-600,7229640,-540,7493220,-600,7755420,-540,8017500,-600,8279580,-540,8541660,-600,8803740,-540,9065820,-600,9327900,-540,9589980,-600,9852060,-540,10114140,-600,10376220,-540,10638300,-600,10910460,-540,11172540,-540,11434680,-480,11595960,-540,11696520,-600,11958540,-540,12220860,-600,12482940,-540,12745020,-600,13007100,-540,13269180,-600,13531260,-540,13803420,-600,14105820,-540,14327580,-600,14629980,-540,14851740,-600,15154140,-540,15375900,-600,15688380,-540,15900060,-600,16212540,-540,16424220,-600,16736700,-540,16958460,-600,17260860,-540,17482620,-600,17785020,-540,18006780,-600,18319260,-540,18530940,-600,18843420,-540,19055100,-600,19367580,-540,19579260,-600,19891740,-540,20113500,-600,20415900,-540,20637660,-600,20940060,-540,21161820,-600,21474300,-540,21685980,-600,23570880,-540]},
        {"name":"Vladivostok, Magadan (RTZ 9)","zone":[-35791394,-527,-35789954,-527,-24788687,-540,-20792700,-600,5914920,-660,6178380,-600,6440520,-660,6703980,-600,6966120,-660,7229580,-600,7493160,-660,7755360,-600,8017440,-660,8279520,-600,8541600,-660,8803680,-600,9065760,-660,9327840,-600,9589920,-660,9852000,-600,10114080,-660,10376160,-600,10638240,-660,10910400,-600,11172480,-600,11434620,-540,11595900,-600,11696460,-660,11958480,-600,12220800,-660,12482880,-600,12744960,-660,13007040,-600,13269120,-660,13531200,-600,13803360,-660,14105760,-600,14327520,-660,14629920,-600,14851680,-660,15154080,-600,15375840,-660,15688320,-600,15900000,-660,16212480,-600,16424160,-660,16736640,-600,16958400,-660,17260800,-600,17482560,-660,17784960,-600,18006720,-660,18319200,-600,18530880,-660,18843360,-600,19055040,-660,19367520,-600,19579200,-660,19891680,-600,20113440,-660,20415840,-600,20637600,-660,20940000,-600,21161760,-660,21474240,-600,21685920,-660,23570820,-600]},
        {"name":"Chokurdakh (RTZ 10)","zone":[-35791394,-614,-35789954,-614,-24019814,-600,-20792760,-660,5914860,-720,6178320,-660,6440460,-720,6703920,-660,6966060,-720,7229520,-660,7493100,-720,7755300,-660,8017380,-720,8279460,-660,8541540,-720,8803620,-660,9065700,-720,9327780,-660,9589860,-720,9851940,-660,10114020,-720,10376100,-660,10638180,-720,10910340,-660,11172420,-660,11434560,-600,11595840,-660,11696400,-720,11958420,-660,12220740,-720,12482820,-660,12744900,-720,13006980,-660,13269060,-720,13531140,-660,13803300,-720,14105700,-660,14327460,-720,14629860,-660,14851620,-720,15154020,-660,15375780,-720,15688260,-660,15899940,-720,16212420,-660,16424100,-720,16736580,-660,16958340,-720,17260740,-660,17482500,-720,17784900,-660,18006660,-720,18319140,-660,18530820,-720,18843300,-660,19054980,-720,19367460,-660,19579140,-720,19891620,-660,20113380,-720,20415780,-660,20637540,-720,20939940,-660,21161700,-720,21474180,-660,21685860,-720,23570760,-660]},
        {"name":"Anadyr, Petropavlovsk-Kamchatsky (RTZ 11)","zone":[-35791394,-634,-35789954,-634,-24795994,-660,-20792820,-720,5914800,-780,6178260,-720,6440400,-780,6703860,-720,6966000,-780,7229460,-720,7493040,-780,7755240,-720,8017320,-780,8279400,-720,8541480,-780,8803560,-720,9065640,-780,9327720,-720,9589800,-780,9851880,-720,10113960,-780,10376040,-720,10638120,-780,10910280,-720,11172360,-720,11434500,-660,11595780,-720,11696340,-780,11958360,-720,12220680,-780,12482760,-720,12744840,-780,13006920,-720,13269000,-780,13531080,-720,13803240,-780,14105640,-720,14327400,-780,14629800,-720,14851560,-780,15153960,-720,15375720,-780,15688200,-720,15899880,-780,16212360,-720,16424040,-780,16736520,-720,16958280,-780,17260680,-720,17482440,-780,17784840,-720,18006600,-780,18319080,-720,18530760,-780,18843240,-720,19054920,-780,19367400,-720,19579080,-780,19891560,-720,20113320,-780,20415720,-720,20637480,-780,20939880,-720,21161640,-720,21474180,-660,21685860,-720]}];
      /**
       * Текущий локальный сдвиг времени (текущая временная зона)
       * @type {number}
       */
      var currentOffsetSeconds = new NativeDate().getTimezoneOffset();
      /**
       * Будет иметь true если пользователь находится в России
       * @type {boolean}
       */
      var isRussian = window.navigator.language === 'ru'
        || window.navigator.systemLanguage === 'ru'
        || /(russia|[а-яёЁ])/i.test(new NativeDate().toString()+new NativeDate().toLocaleString());

      if (isRussian) {
        // ищет таблицу необходимых часовых поясов
        for(var length = timezone.length; length--;) {
          if (currentOffsetSeconds === timezone[length].zone[timezone[length].zone.length - 1]) {
            // ура, шашли подходящую зону
            result = timezone[length];
            break;
          }
        }
      }
      return result;
    }

    // ищем зону
    var timezoneList = getLocaleTimezone(),
        NewDate;

    if (timezoneList) {
      NativeDate.prototype._getTimezoneOffset = NativeDate.prototype.getTimezoneOffset;
      NativeDate.prototype.getTimezoneOffset = function() {
        if (!isNaN(this.getTime())) {
          // переводим миллисекунды в минуты
          var minutes = parseInt(this.getTime() / 1000 / 60, 10);
          // поиск с конца, так как она более частая
          for (var length = timezoneList.zone.length; length -= 2;) {
            if (timezoneList.zone[length] <= minutes) {
              // возвращаем временной сдвиг для указанного времени
              return timezoneList.zone[length + 1];
            }
          }
          // если зона не была найдена, значит Invalid Date:
          return timezoneList.zone[1];
        } else {
          return NaN;
        }
      };

      /**
       * Преобразование локального времени в UTC смещение
       * Параметры: Y, M[, D, h, m, s, ms]
       * @returns {number}
       */
      function toUTC() {
        var _offset = new NativeDate(NativeDate.UTC.apply(null,arguments)).getTimezoneOffset()*60000;
        var d = new NativeDate(NativeDate.UTC.apply(null,arguments)+_offset);
        var delta = d.getTimezoneOffset()*60000 - _offset;
        return new NativeDate(+d - 60000*60).getHours() == d.getHours() ? +d - 60000*60 : +d + delta;
      }

      var _sNaN = ''+new Date(Date.parse(null));
      NewDate = function (Y, M, D, h, m, s, ms) {
        if (this instanceof NativeDate) {
          var length = arguments.length;
          var date = length === 1 && String(Y) === Y ? // isString(Y)
              new NewDate(NewDate.parse(Y)) :
                  length >= 2 ? new NativeDate(toUTC.apply(null,arguments)) :
                  length >= 1 ? new NativeDate(+Y) :
              new NativeDate();
          date.constructor = NewDate;
          return date;
        } else {
          return new NewDate().toString();
        }
      };

      NewDate.getTimezoneName = function () {
        return timezoneList ? timezoneList.name : undefined;
      };
      NewDate.now = NativeDate.now;
      NewDate.UTC = NativeDate.UTC;
      NewDate.prototype = NativeDate.prototype;
      NewDate.prototype.constructor = NewDate;
      NewDate.prototype._getTime = NewDate.prototype.getTime;
      NewDate.prototype._setTime = NewDate.prototype.setTime;

      // setTime, getTime и valueOf переопределять не нужно
      var _dateMethods = ['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds'];
      for (var i = 0; i < _dateMethods.length; i++) {
        (function (_name) {
          if (NewDate.prototype['get' + _name]) {
            NewDate.prototype['get' + _name] = function () {
              return NewDate.prototype['getUTC' + _name].apply(new NativeDate(this.getTime() - this.getTimezoneOffset()
                  * 60000));
            }
          }

          if (NewDate.prototype['set' + _name]) {
            NewDate.prototype['set' + _name] = function () {
              this._setTime(this.getTime() - this.getTimezoneOffset() * 60000);
              NewDate.prototype['setUTC' + _name].apply(this, arguments);
              this._setTime(toUTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds()));
            }
          }
        })(_dateMethods[i]);
      }

      // Переопределяем метод parse, хотя мало кто его использует
      if (NativeDate.parse) {
        var isoDateExpression = new RegExp('^' +
            '(\\d{4}|[\+\-]\\d{6})' + // four-digit year capture or sign +
          // 6-digit extended year
            '(?:-(\\d{2})' + // optional month capture
            '(?:-(\\d{2})' + // optional day capture
            '(?:' + // capture hours:minutes:seconds.milliseconds
            'T(\\d{2})' + // hours capture
            ':(\\d{2})' + // minutes capture
            '(?:' + // optional :seconds.milliseconds
            ':(\\d{2})' + // seconds capture
            '(?:(\\.\\d{1,}))?' + // milliseconds capture
            ')?' +
            '(' + // capture UTC offset component
            'Z|' + // UTC capture
            '(?:' + // offset specifier +/-hours:minutes
            '([-+])' + // sign capture
            '(\\d{2})' + // hours offset capture
            ':(\\d{2})' + // minutes offset capture
            ')' +
            ')?)?)?)?' +
            '$');
        var months = [
            0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
        ];
        var dayFromMonth = function (year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        };

        NewDate._parse = NativeDate.parse;
        NewDate.parse = function (_str) {
          _str = _str+'';
          var match = isoDateExpression.exec(_str);
          if (match) {
            // parse months, days, hours, minutes, seconds, and milliseconds
            // provide default values if necessary
            // parse the UTC offset component
            var year = Number(match[1]),
                month = Number(match[2] || 1) - 1,
                day = Number(match[3] || 1) - 1,
  //              realhour = Number(match[4] || 0),
  //              hour = 12,
                hour = Number(match[4] || 0),
                minute = Number(match[5] || 0),
                second = Number(match[6] || 0),
                millisecond = Math.floor(Number(match[7] || 0) * 1000),
            // When time zone is missed, local offset should be used
            // (ES 5.1 bug)
            // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                isLocalTime = Boolean(match[4] && !match[8]),
                signOffset = match[9] === '-' ? 1 : -1,
                hourOffset = Number(match[10] || 0),
                minuteOffset = Number(match[11] || 0),
                result;
            if (
                hour < (
                    minute > 0 || second > 0 || millisecond > 0 ?
                24 : 25
                ) &&
                minute < 60 && second < 60 && millisecond < 1000 &&
                month > -1 && month < 12 && hourOffset < 24 &&
                minuteOffset < 60 && // detect invalid offsets
                day > -1 &&
                day < (
                dayFromMonth(year, month + 1) -
                dayFromMonth(year, month)
                )
                ) {
              result = (
                  (dayFromMonth(year, month) + day) * 24 +
                  hour +
                  hourOffset * signOffset
                  ) * 60;
              result = (
                  (result + minute + minuteOffset * signOffset) * 60 +
                  second
                  ) * 1000 + millisecond;
              if (isLocalTime) {
                  result =  toUTC(1970, 0, 1, 0, 0, 0, result);
              }
              if (-8.64e15 <= result && result <= 8.64e15) {
                return result;
              }
            }
            return NaN;
          } else {
            if (/(UTC|GMT)\s*([+-]{1}\d*|)/.test(_str)) {
              return Date._parse(_str);
            } else {
              var resDate = new NewDate(NewDate._parse(_str + ' UTC'));
              return toUTC(resDate.getUTCFullYear(), resDate.getUTCMonth(), resDate.getUTCDate(), resDate.getUTCHours(), resDate.getUTCMinutes(), resDate.getUTCSeconds(), resDate.getUTCMilliseconds());
            }
          }
        }
      }

      // Вспомогательные методы для преобразования даты-времени в строку
      var _monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          _dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
          output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
      }

      function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
          if (coercedNumber >= 0) {
            value = Math.floor(coercedNumber);
          } else {
            value = Math.ceil(coercedNumber);
          }
        }

        return value;
      }

      function zoneString(_date) {
        var a = -_date.getTimezoneOffset(),
            b = "+";
        if (a < 0) {
          a = -a;
          b = "-";
        }
        return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
      }

      // Переопределяем методы преобразования даты времени в строку
      // Tue Dec 31 2013 23:00:00 GMT+0300
      if (NewDate.prototype.toString) {
        NewDate.prototype.toString = function () {
          return isNaN(+this) ? _sNaN : [_dayName[this.getDay()], _monthName[this.getMonth()], this.getDate(), this.getFullYear(),
            [leftZeroFill(this.getHours(), 2), leftZeroFill(this.getMinutes(), 2),
              leftZeroFill(this.getSeconds(), 2)].join(':'), 'UTC' + zoneString(this)].join(' ');
        }
      }
      // 01.01.2014, 00:00:00
      if (NewDate.prototype.toLocaleString) {
        NewDate.prototype.toLocaleString = function () {
          return isNaN(+this) ? _sNaN : [[leftZeroFill(this.getDate(), 2), leftZeroFill(this.getMonth()+1, 2),
            leftZeroFill(this.getFullYear(), 4)].join('.'), ', ',
            [leftZeroFill(this.getHours(), 2), leftZeroFill(this.getMinutes(), 2),
              leftZeroFill(this.getSeconds(), 2)].join(':')].join('');
        }
      }

      // 01.01.2014
      if (NewDate.prototype.toLocaleDateString) {
        NewDate.prototype.toLocaleDateString = function () {
          return isNaN(+this) ? _sNaN : [leftZeroFill(this.getDate(), 2), leftZeroFill(this.getMonth()+1, 2),
            leftZeroFill(this.getFullYear(), 4)].join('.');
        }
      }

      // 00:00:00
      if (NewDate.prototype.toLocaleTimeString) {
        NewDate.prototype.toLocaleTimeString = function () {
          return isNaN(+this) ? _sNaN : [this.getHours(), leftZeroFill(this.getMinutes(), 2),
            leftZeroFill(this.getSeconds(), 2)].join(':');
        }
      }

      // Tue Dec 31 2013
      if (NewDate.prototype.toDateString) {
        NewDate.prototype.toDateString = function () {
          return isNaN(+this) ? _sNaN : [_dayName[this.getDay()], _monthName[this.getMonth()], this.getDate(), this.getFullYear()].join(' ');
        }
      }

      // 23:00:00 GMT+0300
      if (NewDate.prototype.toTimeString) {
        NewDate.prototype.toTimeString = function () {
          return isNaN(+this) ? _sNaN : [[leftZeroFill(this.getHours(), 2), leftZeroFill(this.getMinutes(), 2),
            leftZeroFill(this.getSeconds(), 2)].join(':'), 'UTC' + zoneString(this)].join(' ');
        }
      }

      // Tue, 31 Dec 2013 20:00:00 GMT
      if (NewDate.prototype.toGMTString) {
        NewDate.prototype.toGMTString = function () {
          return isNaN(+this) ? _sNaN : [_dayName[this.getUTCDay()], _monthName[this.getUTCMonth()], this.getUTCDate(), this.getUTCFullYear(),
            [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
              leftZeroFill(this.getUTCSeconds(), 2)].join(':'), 'UTC'].join(' ');
        }
      }
      // Tue, 31 Dec 2013 20:00:00 GMT
      if (NewDate.prototype.toUTCString) {
        NewDate.prototype.toUTCString = function () {
          return isNaN(+this) ? _sNaN : [_dayName[this.getUTCDay()], _monthName[this.getUTCMonth()], this.getUTCDate(), this.getUTCFullYear(),
            [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
              leftZeroFill(this.getUTCSeconds(), 2)].join(':'), 'UTC'].join(' ');
        }
      }
      // 2013-12-31T20:00:00.000Z
      if (NewDate.prototype.toISOString) {
        NewDate.prototype.toISOString = function () {
          return isNaN(+this) ? _sNaN : [[leftZeroFill(this.getUTCFullYear(), 4), leftZeroFill(this.getUTCMonth() + 1, 2),
            leftZeroFill(this.getUTCDate(), 2)].join('-'), 'T',
            [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
              leftZeroFill(this.getUTCSeconds(), 2)].join(':'), '.', this.getUTCMilliseconds(), 'Z'].join('');
        }
      }
      // 2013-12-31T20:00:00.000Z
      if (NewDate.prototype.toJSON) {
        NewDate.prototype.toJSON = function () {
          return isNaN(+this) ? _sNaN : [[leftZeroFill(this.getUTCFullYear(), 4), leftZeroFill(this.getUTCMonth() + 1, 2),
            leftZeroFill(this.getUTCDate(), 2)].join('-'), 'T',
            [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
              leftZeroFill(this.getUTCSeconds(), 2)].join(':'), '.', this.getUTCMilliseconds(), 'Z'].join('');
        }
      }
    }

    return NewDate || NativeDate;
  })(Date);
}
