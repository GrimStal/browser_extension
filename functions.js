'use strict';

function setSweetAlertDefaults() {
  if (swal && typeof swal === 'function') {
    swal.setDefaults({
      imageUrl: '/css/images/error.png',
      imageSize: '50x50',
      confirmButtonColor: '#91b247',
      allowEscapeKey: true,
      allowOutsideClick: true,
      customClass: 'alert-window',
      confirmButtonText: 'Закрыть',
    });
  }
}

function cloneObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function onEnter(func, event) {
  event = event || window.event;
  if (event.keyCode === 13) {
    return func();
  }
}

if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

if (!Array.prototype.first) {
    Array.prototype.first = function() {
        return this[0];
    }
}

function XMLtoJson(xml) {
  return x2js.xml_str2json(xml);
}

function createSortedObjectsArray(data) {
    var arr = [];
    for (var key in data) {
        arr.push({id: key, type: data[key]});
    }

    arr.sort(sortByAlphabet);
    return arr;
}

function removeDuplicates(array, duplicates) {

    function checkDuplicates(el) {
        for (var i = 0; i < duplicates.length; i++) {
            if (String(duplicates[i].id) && String(duplicates[i].id) === String(el.id)) {
                return false;
            }
        }

        return true;
    }

    return array.filter(checkDuplicates);
}

function concatArraysInArray(array) {
    var result = [];

    array.forEach(function(item) {
        result = result.concat(item);
    });

    return result;
}

function insertCheckbox() {
    var $select = $('.trailer-type-select');
    var $currentSelect = $select.find(':selected');
    var element;
    var container = $select.closest('.checkbox');
    var len = 100;
    var $target;

    /** Get elements with label elements and search wich element contains
  * the least of elements to add checkbox there.
  */
    container.children().find('label').parent().each(function(i, el) {
        var length = $(el).children().length;
        if (length < len) {
            $target = $(el);
            len = length++;
        } else {
            len = length;
        }
    });

    if ($currentSelect && $currentSelect.val() !== '') {
        element = _.templates.trailerCheckbox({value: $currentSelect.val(), type: $currentSelect.text()});

        if ($target.get(0) === $select.parent().get(0)) {
            $(element).insertBefore($select);
        } else {
            $target.append(element);
        }

        $currentSelect.remove();
    }
}

function setCargoDependencies() {
    function setCheckbox(val) {
        var $checkbox = $('.trailer-type-checkbox[value="' + val + '"]');
        var $select = $('.trailer-type-select').find('option[value=' + val + ']');
        if ($checkbox[0]) {
            $checkbox.prop('checked', true);
        } else {
            $select.prop('selected', true).trigger('change');
        }
    }

    function setInput(selector, val) {
        var $el = $(selector);
        if (!$el.val()) {
            $el.val(val);
        }
    }

    var cargoType = parseInt($(this).val());

    switch (cargoType) {
        case 56:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setCheckbox(18);
            setCheckbox(6);
            setCheckbox(15);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', true);
            break;
        case 2:
        case 5:
        case 7:
        case 11:
        case 15:
        case 16:
        case 17:
        case 19:
        case 21:
        case 22:
        case 24:
        case 25:
        case 26:
        case 32:
        case 37:
        case 41:
        case 45:
        case 46:
        case 47:
        case 54:
        case 55:
        case 57:
        case 58:
        case 60:
        case 61:
        case 62:
        case 65:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', true);
            break;
        case 6:
        case 8:
        case 9:
        case 10:
        case 12:
        case 13:
        case 20:
        case 23:
        case 28:
        case 31:
        case 40:
        case 43:
        case 48:
        case 49:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            break;
        case 1:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#adr').val(1);
            $('#temperature').prop('disabled', false);
            break;
        case 27:
        case 59:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(16);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', true);
            break;
        case 30:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(1);
            setCheckbox(3);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', true);
            break;
        case 18:
        case 39:
        case 64:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(1);
            setCheckbox(3);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            break;
        case 36:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(1);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            break;
        case 33:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(1);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            $('#temperatureMin').val(0);
            $('#temperatureMax').val(2);
            break;
        case 35:
        case 38:
        case 44:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(1);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            $('#temperatureMin').val(-18);
            $('#temperatureMax').val(-18);
            break;
        case 3:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            $('#temperatureMin').val(4);
            $('#temperatureMax').val(7);
            break;
        case 4:
        case 34:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(1);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            $('#temperatureMin').val(4);
            $('#temperatureMax').val(7);
            break;
        case 50:
            setInput('#volume', 82);
            setInput('#weight', 20);
            setInput('#palets', 33);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            $('#temperatureMin').val(2);
            $('#temperatureMax').val(8);
            break;
        case 42:
            setInput('#volume', 0);
            setInput('#weight', 20);
            setInput('#palets', 0);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#adr').val(1);
            $('#temperature').prop('disabled', true);
            break;
        case 29:
            setInput('#volume', 0);
            setInput('#weight', 20);
            setInput('#palets', 0);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            break;
        case 66:
        case 67:
            setInput('#volume', 60);
            setInput('#weight', 20);
            setInput('#palets', 0);
            setCheckbox(7);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', true);
            break;
        case 14:
            setInput('#volume', 60);
            setInput('#weight', 20);
            setInput('#palets', 0);
            setCheckbox(7);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', false);
            $('#adr').val(1);
            break;
        case 53:
            setInput('#volume', 0);
            setInput('#weight', 0);
            setInput('#palets', 33);
            setCheckbox(2);
            setCheckbox(13);
            setCheckbox(8);
            $('.load-type[value="full"]').prop('checked', true);
            $('#temperature').prop('disabled', true);
            break;
        default:
            console.log(cargoType);
            break;
    }
}

function checkTemperature() {
    var $ref = $('.trailer-type-checkbox[value=1]');
    var $isoterm = $('.trailer-type-checkbox[value=3]');
    var $temp = $('#temperature');

    if ($ref.prop('checked') || $isoterm.prop('checked')) {
        $temp.prop('disabled', false);
    } else {
        $temp.prop('disabled', true);
        $('#temperatureMin, #temperatureMax').val(18);
    }
}

function setParam(param, defaultVal) {
    return parseInt(param)
        ? parseInt(param)
        : defaultVal;
}

/**
 * Function to get id of current set Payment moment supported by Lardi
 * @param  {Array.<Object>} array        Array of payment moment Objects supported by Lardi
 * @param  {number} defaultID   Default ID of selected payment moment
 * @return {(number|null)}      Lardi payment moment ID or null
 */
function getPaymentMomentID(array, defaultID) {
    if (!defaultID || array.length === 0) {
        return undefined;
    }

    switch (defaultID) {
        case 1: //Fixed, on unload
            for (var i in array) {
                if (array[i].name === 'на выгрузке') {
                    return Number(array[i].id);
                }
            }
            break;
        default:
            return undefined;
    }

    return undefined;
}

/**
 * Return string of mnemos of selected loadTypes, supported by lardi
 * @param  {Array.<Object>} array         Array of objects of supported loadTypes
 * @param  {Array}          selectedArray Array of selected loadTypes
 * @return {string}                       Mnemos of loadTypes supported by Lardi, with comma delimiter without spaces
 */
function getLoadTypesMnemos(array, selectedArray) {
    var mnemos = [];
    if ($(selectedArray).length === 0 || array.length === 0) {
        return '';
    }

    $(selectedArray).each(function(index, el) {
        if ($.inArray($(el).val(), ['top', 'side', 'back'] !== -1)) {
            for (var i in array) {
                if (array[i].mnemo === $(el).val()) {
                    mnemos.push(array[i].mnemo);
                }
            }
        }
    });

    return mnemos.join(',');
}

/**
 * Return string of names of selected loadTypes, not supported by lardi
 * @param  {Array.<Object>} array         Array of objects of supported loadTypes
 * @param  {Array}          selectedArray Array of selected loadTypes
 * @return {string}                       Names of loadTypes not supported by Lardi to add to additional info
 */
function getAdditionalLoadTypes(array, selectedArray) {
    var names = [];
    if ($(selectedArray).length === 0 || array.length === 0) {
        return '';
    }

    $(selectedArray).each(function(i, el) {
        if ($.inArray($(el).val(), ['top', 'side', 'back']) === -1) {
            names.push($(el).parent().text().trim());
        }
    });

    return names.join(', ');
}

function getCurrencyID(cargoCurrencyID) {
    if (!cargoCurrencyID) {
        return null;
    }

    switch (cargoCurrencyID) {
        case 2: //EURO
            return 6;
        case 6: //RUB
            return 8;
        case 7: //USD
            return 4;
        case 15: //UAH
            return 2;
        case 18: //BYN
            return 10;
        default:
            return null;
    }
}

/**
 * Returns object set by param object with set body_type_id or body_type_group_id
 * @param {LardiTransCargoObject}   object
 * @param {number}                  cargoType   Cargo.lt ID of selected cargo type
 * @param {Array}                   trailers    Array of cargo.lt IDs of selected trailers
 * @param {Array.<Object>}          object      Lardi supported trailer types with groups
 * @return {LardiTransCargoObject}  object
 */
function setBodyType(object, cargoType, trailers, bodyTypes) {
    function setTrailer(id) {
        $(bodyTypes).each(function(index, group) {
            if (group.id == defaultGroup) {
                $(group.bodyTypes.item).each(function(index, body) {
                    if (body.id == id) {
                        object.body_type_id = id;
                        return false;
                    }
                });
            }
        });
    }

    var defaultGroup = 1;

    if (!trailers || trailers.length === 0 || !cargoType) {
        return object;
    }

    switch (cargoType) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 23:
        case 24:
        case 25:
        case 26:
        case 28:
        case 29:
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
        case 41:
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
        case 48:
        case 49:
        case 50:
        case 53:
        case 54:
        case 55:
        case 57:
        case 58:
        case 60:
        case 61:
        case 62:
        case 64:
        case 65:
            defaultGroup = 1;
            break;
        case 27:
        case 30:
        case 59:
            defaultGroup = 2;
            break;
        case 14:
        case 66:
        case 67:
            defaultGroup = 3;
            break;
        case 56:
            defaultGroup = 4;
            break;
        default:
            console.log(cargoType);
    }

    if (trailers.length === 1) {
        switch (trailers[0]) {
            case 2:
            case 5:
            case 8:
            case 13:
                setTrailer(34);
                break;
            case 9:
            case 10:
            case 17:
                setTrailer(23);
                break;
            case 3:
                setTrailer(25);
                break;
            case 1:
                setTrailer(32);
                break;
            case 4:
                setTrailer(28);
                break;
            case 6:
                setTrailer(20);
                break;
            case 7:
                setTrailer(37);
                break;
            case 15:
                setTrailer(30);
                break;
            case 16:
                setTrailer(33);
                break;
            case 18:
            case 20:
                setTrailer(64);
                break;
            case 21:
                setTrailer(48);
                break;
            case 22:
                setTrailer(26);
                break;
            case 23:
                setTrailer(63);
                break;
            case 19:
                setTrailer(46);
                break;
            default:
                console.log(trailers[0]);
        }
    } else {
        if (trailers.length <= 4 && trailers.every(function(el) {
            return [2, 5, 8, 13].indexOf(el) !== -1;
        })) { //if Selected trailers are tents
            object.body_type_id = 34;
        } else if (trailers.length <= 3 && trailers.every(function(el) {
            return [9, 10, 17].indexOf(el) !== -1;
        })) { //if selected trailers are buses
            object.body_type_id = 23;
        }
    };

    object.body_type_group_id = defaultGroup;

    return object;
}

function getLardiCountryID(code, countries) {
    var id = null;

    if (code && countries && Array.isArray(countries) && countries.length !== 0) {
        $(countries).each(function(index, el) {
            if (el.sign === code) {
                id = Number(el.id);
                return false;
            }
        });
    }

    return id;
}

function getLardiAreaID(code, area, countries) {
    var id;
    var countriesWithAreas = ['PL', 'BY', 'RU', 'KZ', 'UA'];
    var area;
    var rusName;

    if ((code && area && countries) && (Array.isArray(countries) && countries.length !== 0) && (countriesWithAreas.indexOf(code) !== -1)) {

        if (code !== 'PL') {
            rusName = regions[code][area];
        } else {
            rusName = setPLArea(area.slice(area.indexOf(' ') + 1));
        }

        $(countries).each(function(index, el) {
            if (el.sign === code) {
                $(el.areas.area).each(function(indexArea, larea) {
                    if (larea.name === rusName) {
                        id = Number(larea.id);
                        return false;
                    }
                });
                return false;
            }
        });
    }

    return id;
}

function splitAddress(address) {
    var country;
    var area;
    var city;
    var addressArr = address.name.split(', ');
    var countriesWithAreas = ['Poland', 'Belarus', 'Russia', 'Kazakhstan', 'Ukraine'];

    switch (addressArr.length) {
        case 3:
            country = addressArr.last().trim();
            area = addressArr[1].trim();
            city = address.ruName ? address.ruName.trim() : addressArr.first().trim();

            switch (city) {
                case 'Gorno-Altaysk':
                    area = 'Altay';
                    break;
                case 'Chita':
                    area = 'Zabaykalie reg.';
                    break;
                default:
                    break;
            }
            break;
        case 2:
            country = addressArr.last().trim();
            if (countriesWithAreas.indexOf(country) !== -1) {
              area = addressArr.first().trim();
            }
            city = address.ruName ? address.ruName.trim() : addressArr.first().trim();
            break;
        case 1:
            if (addressArr.last().trim() === 'Russia Kaliningrad') {
                country = 'Russia';
                area = 'Kaliningrad reg.';
                city = 'Калининград';
            } else {
                country = addressArr.last().trim();
            }
            break;
    }

    return [country, area, city];
}

function setPLArea(area) {
    if (!area) {
        return;
    }

    switch (area) {
        case 'Warsaw':
        case 'Minsk Mazowiecki':
        case 'Mlawa':
        case 'Ostrow Mazowiecka':
        case 'Siedlce':
        case 'Radom':
        case 'Plock':
        case 'Zyrardow':
            return 'Мазовецкое';
        case 'Olsztyn':
        case 'Ketrzyn':
        case 'Szczytno':
        case 'Nidzica':
        case 'Ilawa':
        case 'Elk':
        case 'Elblag':
            return 'Варминско-Мазурское';
        case 'Bialystok':
        case 'Suwalki':
        case 'Bielsk Podlaski':
        case 'Lomza':
            return 'Подляское';
        case 'Lublin':
        case 'Radzyn Podlaski':
        case 'Zamosc':
        case 'Bilgoraj':
        case 'Pulawy':
            return 'Любельское';
        case 'Kielce':
        case 'Ostrowiec Swietokrzyski':
        case 'Pinczow':
        case 'Wloszczowa':
            return 'Свентокшишское';
        case 'Krakow':
        case 'Chrzanow':
        case 'Tarnow':
        case 'Zakopane':
            return 'Малопольское';
        case 'Rzeszow':
        case 'Hyzne':
        case 'Przemysl':
        case 'Krosno':
        case 'Tarnobrzeg':
            return 'Подкарпатское';
        case 'Katowice':
        case 'Sosnowiec':
        case 'Czestochowa':
        case 'Bielsko-Biala':
        case 'Gliwice':
        case 'Raciborz':
            return 'Силезское';
        case 'Opole':
        case 'Kluczbork':
        case 'Nysa':
        case 'Brzeg':
            return 'Опольское';
        case 'Wroclaw':
        case 'Olawa':
        case 'Wolow':
        case 'Klodzko':
        case 'Walbrzych':
        case 'Legnica':
        case 'Glogow':
            return 'Нижнесилезское';
        case 'Poznan':
        case 'Konin':
        case 'Kepno':
        case 'Leszno':
            return 'Велькопольское';
        case 'Zielona Gora':
        case 'Gorzow Wielkopolski':
        case 'Zary':
        case 'Slubice':
            return 'Любушское';
        case 'Szczecin':
        case 'Swinoujscie':
        case 'Choszczno':
        case 'Barlinek':
        case 'Koszalin':
        case 'Kolobrzeg':
        case 'Walcz':
            return 'Западнопоморское';
        case 'Slupsk':
        case 'Bytow':
        case 'Gdansk':
        case 'Gdynia':
        case 'Tczew':
        case 'Wejherowo':
        case 'Chojnice':
            return 'Поморское';
        case 'Bydgoszcz':
        case 'Grudziadz':
        case 'Torun':
        case 'Inowroclaw':
            return 'Куявско-Поморское';
        case 'Lodz':
        case 'Zgierz':
        case 'Piotrkow Trybunalski':
        case 'Sieradz':
        case 'Kutno':
            return 'Лодзинское';
    }
}

function checkEmpty(input) {
  if ($(input).val().length === 0) {
    return true;
  }
  return false;
}

function toggleClear() {
  if (checkEmpty(this)) {
    return $(this).next('.form-control-feedback').hide();
  }
  return $(this).next('.form-control-feedback').show();
}

function getID(object, name) {
  var result = -1;
  name = name.trim().toLowerCase();
  _.forEach(object, function(objName, key){
    if (name === objName.trim().toLowerCase()) {
      result = Number(key);
    }
  });

  return result;
}

var x2js = new X2JS();
