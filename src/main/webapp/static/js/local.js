jQuery(function($) {
	$.validator.addMethod('verifyPassword', function(value, element) {
		var reg = /^(.){8,20}$/;
		return (this.optional(element) || reg.test(value));
	});
	
	$.validator.addMethod('verifyPhoneNo', function(value, element) {
		var reg = /^([0-9]{7,11})$/;
		return (this.optional(element) || reg.test(value));
	});
	
	$.validator.addMethod('verifyDOB', function(value, element) {
		// Check if the field is required.
		var optional = this.optional(element);
		if (optional) {
			return optional;
		}
		
		var
			valid = true,
			year = parseInt($('.selectdate-year option:selected').val(), 10),
			month = parseInt($('.selectdate-month option:selected').val(), 10),
			day = parseInt($('.selectdate-day option:selected').val(), 10)
		;
		
		if (isNaN(year) || isNaN(month) || isNaN(day)) {
			return false;
		}
		
		console.log('year: ', year);
		console.log('month: ', month);
		console.log('day: ', day);
		
		if (month < 1 || month > 12) {
			valid = false;
		}
		
		if (day < 1 || day > 31) {
			valid = false;
		}
		
		if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 31) {
			valid = false;
		}
		
		if (month == 2) {
			var isLeapYear = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
			if (day > 29 || (day == 29 && !isLeapYear)) {
				valid = false;
			}
		}
		
		return valid;
		
	}, 'Please enter a valid date.' );

});