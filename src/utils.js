const pkg = require('../package.json');

const nextWeekday = (weekday) => {
	// Returns date of next weekday - either in current week, or in next week if already passed.
	var date = new Date();

	days_ahead = weekday - date.getDay();

	// # Target day already happened this week
	if (days_ahead <= 0)
		days_ahead += 7

	return date.setDate(date.getDate() + days_ahead);
};


/* Port of strftime(). Compatibility notes:
 *
 * %c - formatted string is slightly different
 * %D - not implemented (use "%m/%d/%y" or "%d/%m/%y")
 * %e - space is not added
 * %E - not implemented
 * %h - not implemented (use "%b")
 * %k - space is not added
 * %n - not implemented (use "\n")
 * %O - not implemented
 * %r - not implemented (use "%I:%M:%S %p")
 * %R - not implemented (use "%H:%M")
 * %t - not implemented (use "\t")
 * %T - not implemented (use "%H:%M:%S")
 * %U - not implemented
 * %W - not implemented
 * %+ - not implemented
 * %% - not implemented (use "%")
 *
 * strftime() reference:
 * http://man7.org/linux/man-pages/man3/strftime.3.html
 *
 * Day of year (%j) code based on Joe Orost's answer:
 * http://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
 *
 * Week number (%V) code based on Taco van den Broek's prototype:
 * http://techblog.procurios.nl/k/news/view/33796/14863/calculate-iso-8601-week-and-year-in-javascript.html
 */
 const strftime = (sFormat, date) => {
 	if (!(date instanceof Date)) date = new Date();
 	var nDay = date.getDay(),
 	nDate = date.getDate(),
 	nMonth = date.getMonth(),
 	nYear = date.getFullYear(),
 	nHour = date.getHours(),
 	aDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
 	aMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
 	aDayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
 	isLeapYear = function() {
 		if ((nYear&3)!==0) return false;
 		return nYear%100!==0 || nYear%400===0;
 	},
 	getThursday = function() {
 		var target = new Date(date);
 		target.setDate(nDate - ((nDay+6)%7) + 3);
 		return target;
 	},
 	zeroPad = function(nNum, nPad) {
 		return ('' + (Math.pow(10, nPad) + nNum)).slice(1);
 	};
 	return sFormat.replace(/%[a-z]/gi, function(sMatch) {
 		return {
 			'%a': aDays[nDay].slice(0,3),
 			'%A': aDays[nDay],
 			'%b': aMonths[nMonth].slice(0,3),
 			'%B': aMonths[nMonth],
 			'%c': date.toUTCString(),
 			'%C': Math.floor(nYear/100),
 			'%d': zeroPad(nDate, 2),
 			'%e': nDate,
 			'%F': date.toISOString().slice(0,10),
 			'%G': getThursday().getFullYear(),
 			'%g': ('' + getThursday().getFullYear()).slice(2),
 			'%H': zeroPad(nHour, 2),
 			'%I': zeroPad((nHour+11)%12 + 1, 2),
 			'%j': zeroPad(aDayCount[nMonth] + nDate + ((nMonth>1 && isLeapYear()) ? 1 : 0), 3),
 			'%k': '' + nHour,
 			'%l': (nHour+11)%12 + 1,
 			'%m': zeroPad(nMonth + 1, 2),
 			'%M': zeroPad(date.getMinutes(), 2),
 			'%p': (nHour<12) ? 'AM' : 'PM',
 			'%P': (nHour<12) ? 'am' : 'pm',
 			'%s': Math.round(date.getTime()/1000),
 			'%S': zeroPad(date.getSeconds(), 2),
 			'%u': nDay || 7,
 			'%V': (function() {
 				var target = getThursday(),
 				n1stThu = target.valueOf();
 				target.setMonth(0, 1);
 				var nJan1 = target.getDay();
 				if (nJan1!==4) target.setMonth(0, 1 + ((4-nJan1)+7)%7);
 				return zeroPad(1 + Math.ceil((n1stThu-target)/604800000), 2);
 			})(),
 			'%w': '' + nDay,
 			'%x': date.toLocaleDateString(),
 			'%X': date.toLocaleTimeString(),
 			'%y': ('' + nYear).slice(2),
 			'%Y': nYear,
 			'%z': date.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1'),
 			'%Z': date.toTimeString().replace(/.+\((.+?)\)$/, '$1')
 		}[sMatch] || sMatch;
 	});
 }

 function isInt(value) {
 	return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
 }

 function timeToDecimal(t) {
 	var arr = t.split(':');
 	var dec = parseInt((arr[1]/6)*10, 10);

 	return parseFloat(parseInt(arr[0], 10) + '.' + (dec<10?'0':'') + dec);
 }

 module.exports = {

 	getTaskName(query) {
		// # If it cannot be split, first element will be complete string
		return query.split(":", 1)[0].split(" #", 1)[0].split(" @", 1)[0].split(" !", 1)[0].split(" +", 1)[0].trim();
	},

	getTaskDescription(query) {
		taskDescription = ''
		if (query.includes(' :')) {
			// # Avoid adding #myTag, @due, !priority to the content text
			taskDescription = query.split(' :', 2)[1].split(' #', 1)[0].split(' @', 1)[0].split(' !', 1)[0].split(" +", 1)[0].split(" _", 1)[0].trim();
		}
		return taskDescription;
	},

	getTaskPriority(query) {
		inputPriority = null;

		if (query.includes(' !')) {
			// # Priority is of only 1 character, so we can receive the 1st character of the second element. As such, any text after is ignored.
			inputPriority = Number(query.split(' !', 2)[1].slice(0,1).trim());

			if ( !Number.isInteger(inputPriority) || (inputPriority < 1 || inputPriority > 4))
				return null

			return inputPriority;
		}
	},

	getTaskDueDate(query) {
		naturalLanguageWeekdays = {'mon': 1, 'monday': 1, 'tue': 2, 'tuesday': 2, 'wed': 3, 'wednesday': 3, 'thu': 4, 'thursday': 4, 'fri': 5, 'friday': 5, 'sat': 6, 'saturday': 6, 'sun': 0, 'sunday': 0}
		naturalLanguageRelativeDays = {'now': 0, 'tod': 0, 'today': 0, 'tom': 1, 'tomorrow': 1}

		inputMinHourDayWeek = '';
		// passedDue = ''
		isUseDefault = true;
		isNoDueDate = false;
		hasTime = query.includes(' @');
		hasDefault = false;
		if('default_duedate' in pkg)
			hasDefault = pkg.default_duedate;
		naturalValue = '';

		if(hasTime || hasDefault){
			inputDue = 0

			if (hasTime) {
				// Ensure that first character is not a space, otherwise "cu Test @ someText" will be true
				hasValue = (query.includes(' @') && query.split(' @')[1][0] != ' ' ) ? true : false;
				// # cu Task @h2 some other text -> h2
				timeValue = query.split(' @')[1].slice(1).split(' ')[0];
			}
			if (hasTime && hasValue)
				isUseDefault = false;

			inputMinHourDayWeek = '';

			if (isUseDefault && 'default_duedate' in pkg) {
				inputMinHourDayWeek = pkg.default_duedate;
			}
			else if (query.split(' @', 2)[1]) {
				value = query.split(' @', 2)[1];

				// Get date of next x-day
				if(value.split(' ')[0] in naturalLanguageWeekdays){
					naturalValue = nextWeekday(naturalLanguageWeekdays[value.split(' ')[0]]);
				}
				// Get date of today/tomorrow
				else if(value.split(' ')[0] in naturalLanguageRelativeDays){
					var date = new Date();
					naturalValue = date.setDate(date.getDate() + naturalLanguageRelativeDays[value.split(' ')[0]]);
				}
				// Get date or date-time as specified
				else if( value.match(/\d{4}-\d?\d-\d?\d/) || value.match(/(:2[0-3]|[01]?[0-9])\:[0-5]?[0-9](\:[0-5]?[0-9])?/ )){
					date = (value.match(/\d{4}-\d?\d-\d?\d/)) ? value.match(/\d{4}-\d?\d-\d?\d/) : '';
					dateTime = (value.match(/(:2[0-3]|[01]?[0-9])\:[0-5]?[0-9](\:[0-5]?[0-9])?/)) ? value.match(/(:2[0-3]|[01]?[0-9])\:[0-5]?[0-9](\:[0-5]?[0-9])?/)[0] : '';

					if (date) {
						try {
							// Convert string 'date + current time' to dateTime.
							var today = new Date();
							naturalValue = new Date(date + 'T' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()).getTime();
						}
						catch(err) {
							naturalValue = err;
						}
					}

					if (dateTime) {
						theDate = (date == '') ? strftime('%Y-%m-%d') : date;

						// 12:00, 12:00:00
						if (dateTime.length == 5 || dateTime.length == 8 ){
							try {
								// Convert string 'date + current time' to dateTime.
								time = (dateTime.length == 8) ? dateTime : dateTime.slice(0, 5);
								naturalValue = new Date(theDate + 'T' + time).getTime();
							}
							catch(err) {
								naturalValue = err;
							}
						}
					}

				}

				else {
					// First character: m, h, d, w
					inputMinHourDayWeek = value[0]
				}
			}

			if (naturalValue == '') {
				isDefaultInteger = ('default_duedate' in pkg && isInt(pkg.default_duedate.slice(1)) ) ? true : false;

				if (isUseDefault && isDefaultInteger)
					inputDue = pkg.default_duedate.slice(1);
				else if (isInt(timeValue))
					inputDue = timeValue;
				else {
					// Invalid input
					inputDue = 0;
					isNoDueDate = true;
					inputMinHourDayWeek = 'h';
				}

				if (inputMinHourDayWeek == 'm')
					inputDue *= 1000 * 60;
				else if (inputMinHourDayWeek == 'h')
					inputDue *= 1000 * 60 * 60;
				else if (inputMinHourDayWeek == 'd')
					inputDue *= 1000 * 60 * 60 * 24;
				else if (inputMinHourDayWeek == 'w')
					inputDue *= 1000 * 60 * 60 * 24 * 7;

			}
		}
		else {
			// No longer default of 2h if no other value specified and no default context variable specified - can now be set via configuration if desired, if not no due date will be added
			inputDue = 0;
			isNoDueDate = true;
		}

		// Add to whatever buffer has been selected
		if (!naturalValue)
			inputDue = Date.now() + inputDue; // inputDue = strftime('%Y-%m-%dT%H:%M:%S', new Date(Date.now() + inputDue));
		else
			inputDue = naturalValue;

		if (isNoDueDate)
			return null;
		else
			return inputDue;
	},

	getTaskTimeEstimate(query) {
		naturalLanguageTimes = {'minute': 'm', 'minutes': 'm', 'min': 'm', 'm': 'm', 'hour': 'h', 'hours': 'h', 'h': 'h', 'day': 'd', 'days': 'd', 'd': 'd', 'week': 'w', 'weeks': 'w', 'w': 'w'};
		inputTimeEstimate = 0;

		if (query.includes(' _')) {
			time_unit = null;
			value = query.split(' _', 2)[1].split(' ')[0];
			inputTimeEstimate = value.replace(/[^0-9:.]/g,'');
			timeUnit_value = value.replace(/[0-9:.]/g, '');

			if (inputTimeEstimate.includes(':')) {
				inputTimeEstimate = timeToDecimal(inputTimeEstimate);
			}

			if(timeUnit_value in naturalLanguageTimes){
				time_unit = naturalLanguageTimes[timeUnit_value];
			}

			if (time_unit == 'm')
				inputTimeEstimate *= 1000 * 60;
			else if (time_unit == 'h')
				inputTimeEstimate *= 1000 * 60 * 60;
			else if (time_unit == 'd')
				inputTimeEstimate *= 1000 * 60 * 60 * 24;
			else if (time_unit == 'w')
				inputTimeEstimate *= 1000 * 60 * 60 * 24 * 7;
			else
				inputTimeEstimate = 0;

			// inputTimeEstimate = strftime('%Y-%m-%dT%H:%M:%S', new Date(Date.now() + inputTimeEstimate));

			return inputTimeEstimate;
		}

		return 0;
	},

};