rtz2fix
=======

Временное исправление некорректной работы объекта Date в браузерах (fix Microsoft update KB2998527 for Browsers).

[Проверить свой браузер](https://rawgit.com/yuriy-sedinkin/rtz2fix/master/test_browser.html)

# Краткое описание проблемы #

После выпуска упомянутого выше обновления я столкнулся со следующими проблемами:

В IE (Browser Mode = "Internet Explorer 10 Compat View", Document Mode = "IE8 standarts" ):
```js
new Date(2014, 0, 1).toString() == "Tue Dec 31 23:00:00 UTC+0300 2013";
new Date(2015, 0, 7).toString() == "Tue Jan 6 23:00:00 UTC+0300 2015";
```
В Chrome 38.0.2125.122 m:
```js
new Date(2014, 0, 1).toString() == "Wed Jan 01 2014 01:00:00 GMT+0400 (Russia TZ 2 Daylight Time)"
```
### Вследствие этого перестала работать библиотека momentjs ###
В IE (Browser Mode = "Internet Explorer 10 Compat View", Document Mode = "IE8 standarts" ):
```js
  moment().startOf('year').toString() == "Tue Dec 31 2013 23:00:00 GMT+0300";
  moment().endOf('year').toString() == "Wed Dec 31 2014 22:59:59 GMT+0300";
```  
В Chrome 38.0.2125.122 m:
```js
  moment().startOf('year').toString() == "Wed Jan 01 2014 01:00:00 GMT+0400"
  moment().endOf('year').toString() == "Thu Jan 01 2015 00:59:59 GMT+0300"
```
# Решение проблемы #
Вместо того, чтобы дорабатывать библиотеки и надеясь на то, что рано или поздно проблема будет решена во всех браузерах (например, в IE Browser Mode = "Internet Explorer 10", Document Mode = "IE10 standarts" проблемы нет), решил доработать объект Date.

Принцип такой - время в UTC+0000 непрерывно, поэтому все манипуляции с датой происходят в UTC, а timezonе добавляется в последний момент.

Буду рад, если кто-то обнаружит проблемы в данном решении и сообщит о них мне.

# Использование #
Ограничения на использование совместно с es5-shim.js и requirejs начиная с v0.4 сняты.

# Благодарности #
Спасибо тем, кто участвовал в разработке и помог обнаружить ошибки:

- [Dmitrii Pakhtinov] (https://github.com/devote "https://github.com/devote")- метод getTimezoneOffset использующий свою таблицу сдвигов для проблемных таймзон!
- [Serg Rogovtsev](https://github.com/srogovtsev "https://github.com/srogovtsev") - критическая ошибка в конструкторе
- [moongrate](https://github.com/moongrate "https://github.com/moongrate") - ошибка в методе Date.parse (http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.4.2)
- [A community host for shims and polyfills that are compliant to the EcmaScript specs](https://github.com/es-shims/es5-shim "es5-shim") - способ переопределения Date позаимствован из es5-shim.js
