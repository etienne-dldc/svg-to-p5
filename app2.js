'use strict';

$(function () {

  /**
   * expected argument lengths
   * @type {Object}
   */
  var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0}
  /**
   * segment pattern
   * @type {RegExp}
   */
  var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig
  /**
   * parse an svg path data string. Generates an Array
   * of commands where each command is an Array of the
   * form `[command, arg1, arg2, ...]`
   *
   * @param {String} path
   * @return {Array}
   */
  function parse(path) {
  	var data = []
  	path.replace(segment, function(_, command, args){
  		var type = command.toLowerCase()
  		args = parseValues(args)

  		// overloaded moveTo
  		if (type == 'm' && args.length > 2) {
  			data.push([command].concat(args.splice(0, 2)))
  			type = 'l'
  			command = command == 'm' ? 'l' : 'L'
  		}

  		while (true) {
  			if (args.length == length[type]) {
  				args.unshift(command)
  				return data.push(args)
  			}
  			if (args.length < length[type]) throw new Error('malformed path data')
  			data.push([command].concat(args.splice(0, length[type])))
  		}
  	})
  	return data
  }
  function parseValues(args){
  	args = args.match(/-?[.0-9]+(?:e[-+]?\d+)?/ig)
  	return args ? args.map(Number) : []
  }

  function SvgToP5(path, beforeEach, move) {
    if (beforeEach == undefined) { beforeEach = ''; }
    if (move == undefined) { move = [0, 0]; }
    var parsed = parse(path);
    console.log(parsed);
    var result = [];
    var currentPos = [0, 0];
    for (var i = 0; i < parsed.length; i++) {
      var elem = parsed[i];
      switch (elem[0]) {
        case 'M':
          break;
        case 'L':
          break;
        case 'l':
          elem[1] = currentPos[0] + elem[1];
          elem[2] = currentPos[1] + elem[2];
          break;
        default:
          console.log(elem);
      }
      if (elem.length == 3) {
        var x = elem[1] + move[0];
        var y = elem[2] + move[1];
        result.push('cc.p(' + x + ', ' + y + ')');
        currentPos = [elem[1], elem[2]];
      }
    }
    for (var i = 0; i < result.length; i++) {
      result[i] = beforeEach + result[i] + ',';
    }
    return result.join('\n');
  }

  $('.validate').click(function(event) {
    var result = SvgToP5($('.txt-in').val(), '', [500, -300]);
    $('.txt-out').html(result);
  });

});
