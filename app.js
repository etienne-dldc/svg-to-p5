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

  function SvgToP5(path, beforeEach) {
    if (beforeEach == undefined) { beforeEach = ''; }
    var parsed = parse(path);
    var result = ['beginShape()'];
    var currentPos = [0, 0];
    for (var i = 0; i < parsed.length; i++) {
      var elem = parsed[i];
      switch (elem[0]) {
        case 'M':
          result.push('vertex(' + elem[1] + ', ' + elem[2] + ')');
          currentPos = [elem[1], elem[2]];
          break;
        case 'L':
          result.push('vertex(' + elem[1] + ', ' + elem[2] + ')');
          currentPos = [elem[1], elem[2]];
          break;
        case 'C':
          result.push('bezierVertex(' + elem[1] + ',' + elem[2] + ',' + elem[3] + ',' + elem[4] + ',' + elem[5] + ',' + elem[6] + ')');
          currentPos = [elem[5], elem[6]];
          break;
        case 'Z':
          result.push('endShape()');
          currentPos = [elem[1], elem[2]];
      }
    }
    for (var i = 0; i < result.length; i++) {
      result[i] = beforeEach + result[i] + ';';
    }
    return result.join('\n');
  }

  $('.validate').click(function(event) {
    var result = SvgToP5($('.txt-in').val(), 'p.');
    $('.txt-out').html(result);
  });

});
