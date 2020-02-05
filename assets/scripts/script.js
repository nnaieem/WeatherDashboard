const appId = 'b5549a686c6b529bb09daf56625f3809';

const alertUserFailedAPI = function() {
	$("#error").show();
}

$("#search-btn").click(function() {
	$("#error").hide();
	const searchValue = $("#city-search-input").val();

	$("#main-content").fadeOut(400, function() {
		$(".city-name").text(searchValue);

		$.ajax({
			url: `https://api.openweathermap.org/data/2.5/weather?q=${searchValue}&appid=${appId}&units=metric`,
			method: 'GET'
		}).then(function(response) {
			console.log(response);

			const {
				main: {
					temp,
					humidity,
				},
				wind: {
					speed,
				},
				coord: {
					lat,
					lon,
				}
			} = response;

			$(".current-temper").text(temp);
			$(".current-humidity").text(humidity);
			$(".current-wind-speed").text(speed);

			let completedAPI = 0;
			const totalAPI = 2;
			const checkForFadeIn = function() {
				if (completedAPI === totalAPI) {
					$("#main-content").fadeIn();
				}
			};

			$.ajax({
				url: `http://api.openweathermap.org/data/2.5/uvi?appid=${appId}&lat=${lat}&lon=${lon}`,
				method: 'GET',
			}).then(function(response) {
				const { value: uvValue } = response;

				$(".current-uv-index").text(uvValue);

				completedAPI++;
				checkForFadeIn();
			}, alertUserFailedAPI);

			$.ajax({
				url: `http://api.openweathermap.org/data/2.5/forecast?appid=${appId}&lat=${lat}&lon=${lon}&units=metric`,
				method: 'GET',
			}).then(function(response) {
				const { list: forecastArray } = response;

				const endOfToday = moment().utc().endOf('day');

				const forecastContainer = $("#forecast-container");

				forecastContainer.empty();

				for (let index = 0; index < forecastArray.length; index++) {
					const {
						dt: timestamp,
						main: {
							temp,
							humidity,
						}
					} = forecastArray[index];

					const date = moment(timestamp * 1000).utc();

					if (date.isSameOrBefore(endOfToday) || date.hour() !== 0) {
						continue;
					}

					// Clone the item
					const forecastElem = $("#forecast-to-be-cloned").clone();
					forecastElem.removeAttr("id");

					// Update information
					forecastElem.find(".forecast-date").text(date.format('DD MMM YYYY'));
					forecastElem.find(".forecast-temp").text(temp);
					forecastElem.find(".forecast-humidity").text(humidity);

					// Append item
					forecastContainer.append(forecastElem);
				}

				completedAPI++;
				checkForFadeIn();
			}, alertUserFailedAPI);
		}, alertUserFailedAPI);
	});
});

$("#city-search-input").keydown(function(event) {
	// Ref: https://stackoverflow.com/a/979686/4103909
	// 13 is enter keycode
	if (event.which === 13) {
		$("#search-btn").trigger("click");
	}
});