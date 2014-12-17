// RTZ 2 temporary fix
// Проверка наличия проблемы
if ((new Date(2014, 0, 1)).getHours() != 0 || new Date(2015, 0, 7).getHours() != 0) {
  // Переопределяем конструктор
  Date = (function (NativeDate) {
    var NewDate = function (Y, M, D, h, m, s, ms) {
      var length = arguments.length;
      var date = length === 1 && String(Y) === Y ? // isString(Y)
          new NativeDate(NewDate.parse(Y)) :
              length >= 7 ? new NativeDate(NativeDate.UTC(Y, M, D, h, m, s, ms)) :
              length >= 6 ? new NativeDate(NativeDate.UTC(Y, M, D, h, m, s)) :
              length >= 5 ? new NativeDate(NativeDate.UTC(Y, M, D, h, m)) :
              length >= 4 ? new NativeDate(NativeDate.UTC(Y, M, D, h)) :
              length >= 3 ? new NativeDate(NativeDate.UTC(Y, M, D)) :
              length >= 2 ? new NativeDate(NativeDate.UTC(Y, M)) :
              length >= 1 ? new NativeDate(+Y) :
          new NativeDate();
      if (length == 0) {
        date = new NativeDate(+date - date.getTimezoneOffset() * 60000);
      }
      date.constructor = NewDate;
      return this instanceof NativeDate ? date : date.toString();
    };

    if (NativeDate.now) {
      NewDate.now = function () {
        return new NewDate().getTime();
      };
    }
    if (NativeDate.UTC) {
      NewDate._UTC = NativeDate.UTC;
      NewDate.UTC = function (Y, M, D, h, m, s, ms) {
        var _date = new NewDate(NewDate._UTC.apply(this, arguments));
        return +_date - _date.getTimezoneOffset() * 60000;
      };
    }
    NewDate.prototype = NativeDate.prototype;
    NewDate.prototype.constructor = NewDate;

    // setTime, getTime и valueOf переопределять не нужно
    var _dateMethods = ['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds'];
    for (var i = 0; i < _dateMethods.length; i++) {
      (function (_name) {
        if (NewDate.prototype['get' + _name]) {
          NewDate.prototype['_get' + _name] = NewDate.prototype['get' + _name];
          NewDate.prototype['get' + _name] = NewDate.prototype['getUTC' + _name]
        }
        if (NewDate.prototype['set' + _name]) {
          NewDate.prototype['_set' + _name] = NewDate.prototype['set' + _name];
          NewDate.prototype['set' + _name] = NewDate.prototype['setUTC' + _name]
        }

        if (NewDate.prototype['getUTC' + _name]) {
          NewDate.prototype['_getUTC' + _name] = NewDate.prototype['getUTC' + _name];
          NewDate.prototype['getUTC' + _name] = function () {
            return NewDate.prototype['_getUTC' + _name].apply(new NativeDate(this.getTime() + this.getTimezoneOffset()
                * 60000));
          }
        }

        if (NewDate.prototype['setUTC' + _name]) {
          NewDate.prototype['_setUTC' + _name] = NewDate.prototype['setUTC' + _name];
          NewDate.prototype['setUTC' + _name] = function () {
            this.setTime(this.getTime() + this.getTimezoneOffset() * 60000);
            NewDate.prototype['_setUTC' + _name].apply(this, arguments);
            this.setTime(this.getTime() - this.getTimezoneOffset() * 60000);
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
      var dayFromMonth = function(year, month) {
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
        if (typeof _str !== "string" && _str.toString) {
          _str = _str.toString();
        }
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
            if (!isLocalTime) {
              var resDate = new NewDate(result);
              result = result - resDate.getTimezoneOffset()*60000;
            }
            if (-8.64e15 <= result && result <= 8.64e15) {
              return result;
            }
          }
          return NaN;
        } else {
          var _append = true,
              _realHour,
              _offset;
          _str = _str.replace(/([012]?\d|21|22|23)\s*[\:]+\s*(([0-5]?\d)\s*(([\:]+)\s*[0-5]?\d|)|)\s*(am|pm)?/i,
              function ($0, $1, $2, $3, $4, $5, $6) {
                _append = false;
                _realHour = +$1;
                if ($6 && $6.toLowerCase() == 'pm') {
                  _realHour += 12;
                }
                return $0.replace($1, '12').replace($6, '');
              });
          _str = _str.replace(/(UTC|GMT)\s*([+-]{1}\d*|)/, function ($0, $1, $2) {
            if ($2) {
              _offset = parseInt($2, 10);
              _offset = -(_offset / 100 * 60 + _offset % 100) * 60000;
            }
            return '';
          });
          if (_append) {
            _str += ' 12:00';
          }
          var resDate = new NewDate(NewDate._parse(_str));
          resDate.setHours(_append ? 0 : _realHour);
          return resDate.getTime() + (_offset == null ? 0 : _offset + -resDate.getTimezoneOffset() * 60000);
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
        return [_dayName[this.getDay()], _monthName[this.getMonth()], this.getDate(), this.getFullYear(),
          [leftZeroFill(this.getHours(), 2), leftZeroFill(this.getMinutes(), 2),
            leftZeroFill(this.getSeconds(), 2)].join(':'), 'UTC' + zoneString(this)].join(' ');
      }
    }
    // 01.01.2014, 00:00:00
    if (NewDate.prototype.toLocaleString) {
      NewDate.prototype.toLocaleString = function () {
        return [[leftZeroFill(this.getDate(), 2), leftZeroFill(this.getMonth(), 2),
          leftZeroFill(this.getFullYear(), 4)].join('.'), ', ',
          [leftZeroFill(this.getHours(), 2), leftZeroFill(this.getMinutes(), 2),
            leftZeroFill(this.getSeconds(), 2)].join(':')].join('');
      }
    }

    // 01.01.2014
    if (NewDate.prototype.toLocaleDateString) {
      NewDate.prototype.toLocaleDateString = function () {
        return [leftZeroFill(this.getDate(), 2), leftZeroFill(this.getMonth(), 2),
          leftZeroFill(this.getFullYear(), 4)].join('.');
      }
    }

    // 00:00:00
    if (NewDate.prototype.toLocaleTimeString) {
      NewDate.prototype.toLocaleTimeString = function () {
        return [leftZeroFill(this.getHours(), 2), leftZeroFill(this.getMinutes(), 2),
          leftZeroFill(this.getSeconds(), 2)].join(':');
      }
    }

    // Tue Dec 31 2013
    if (NewDate.prototype.toDateString) {
      NewDate.prototype.toDateString = function () {
        return [_dayName[this.getDay()], _monthName[this.getMonth()], this.getDate(), this.getFullYear()].join(' ');
      }
    }

    // 23:00:00 GMT+0300
    if (NewDate.prototype.toTimeString) {
      NewDate.prototype.toTimeString = function () {
        return [[leftZeroFill(this.getHours(), 2), leftZeroFill(this.getMinutes(), 2),
          leftZeroFill(this.getSeconds(), 2)].join(':'), 'UTC' + zoneString(this)].join(' ');
      }
    }

    // Tue, 31 Dec 2013 20:00:00 GMT
    if (NewDate.prototype.toGMTString) {
      NewDate.prototype.toGMTString = function () {
        return [_dayName[this.getUTCDay()], _monthName[this.getUTCMonth()], this.getUTCDate(), this.getUTCFullYear(),
          [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
            leftZeroFill(this.getUTCSeconds(), 2)].join(':'), 'UTC'].join(' ');
      }
    }
    // Tue, 31 Dec 2013 20:00:00 GMT
    if (NewDate.prototype.toUTCString) {
      NewDate.prototype.toUTCString = function () {
        return [_dayName[this.getUTCDay()], _monthName[this.getUTCMonth()], this.getUTCDate(), this.getUTCFullYear(),
          [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
            leftZeroFill(this.getUTCSeconds(), 2)].join(':'), 'UTC'].join(' ');
      }
    }
    // 2013-12-31T20:00:00.000Z
    if (NewDate.prototype.toISOString) {
      NewDate.prototype.toISOString = function () {
        return [[leftZeroFill(this.getUTCFullYear(), 4), leftZeroFill(this.getUTCMonth() + 1, 2),
          leftZeroFill(this.getUTCDate(), 2)].join('-'), 'T',
          [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
            leftZeroFill(this.getUTCSeconds(), 2)].join(':'), '.', this.getUTCMilliseconds(), 'Z'].join('');
      }
    }
    // 2013-12-31T20:00:00.000Z
    if (NewDate.prototype.toJSON) {
      NewDate.prototype.toJSON = function () {
        return [[leftZeroFill(this.getUTCFullYear(), 4), leftZeroFill(this.getUTCMonth() + 1, 2),
          leftZeroFill(this.getUTCDate(), 2)].join('-'), 'T',
          [leftZeroFill(this.getUTCHours(), 2), leftZeroFill(this.getUTCMinutes(), 2),
            leftZeroFill(this.getUTCSeconds(), 2)].join(':'), '.', this.getUTCMilliseconds(), 'Z'].join('');
      }
    }
    return NewDate;
  })(Date);
}
