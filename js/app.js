
// ISO 8061 PARSER
function parse(string) {
    let date_time = string.split('T');
    let date = date_time[0].split('-').join('/');

    // YYYY-MM-DDThh:mm:ss+hh:mm
    let time = date_time[1].slice(0, 5).split(':');
    let zone = date_time[1].slice(9).split(':');

    let coefficient = (date_time[1][8] == '-') ? -1 : 1;
    coefficient = 0;

    let hour = parseInt(time[0], 10) + (coefficient * parseInt(zone[0], 10));
    let minute = parseInt(time[1], 10) + (coefficient * parseInt(zone[1], 10));

    let final_time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    let final_date = {
        date: date,
        time: final_time,
        date_time: `${date}  ${final_time}`
    };
    return final_date
}

let is_user_location = localStorage.getItem("location_on");
let current_latitude = 38.6362;
let current_longitude = -90.3093;
let default_coordinates = `${current_latitude},${current_longitude}`
const MORROW_HEADER = new Headers({"User-Agent": "Morrowbot/1.0 (+contactocarlose@gmail.com)"});

const MIN_GRAPH = 3;
const MAX_GRAPH = 105;


if (is_user_location === null) {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(update_location);
        console.log('test');
    }
    else {
        localStorage.setItem(location_key, default_coordinates);
    }
}
else {
    let user_latitude = localStorage.getItem("user_latitude");
    let user_longitude = localStorage.getItem("user_longitude");
    get_weather_data(user_latitude, user_longitude);
}

function update_location(position) {
    let user_latitude = position.coords.latitude;
    let user_longitude = position.coords.longitude;

    localStorage.setItem("user_latitude", user_latitude);
    localStorage.setItem("user_longitude", user_longitude);
    localStorage.setItem("location_on", "true");
    current_latitude = user_latitude;
    current_longitude = user_longitude;

    // May cause issues with asyc!
    get_weather_data(current_latitude, current_longitude);
}

function get_weather_data(latitude, longitude) {
    const NWS_URL = "https://api.weather.gov/points";

    fetch(`${NWS_URL}/${latitude},${longitude}`, {
        headers: MORROW_HEADER
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
        update_weather_information(data);


        var initialized = false;
        if (!initialized) {
            var map = L.map('map').setView([latitude, longitude], 13);
            map.on('click', onMapClick);
            var marker = L.marker([latitude, longitude]).addTo(map);
        }
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            referrerPolicy: 'no-referrer-when-downgrade'
        }).addTo(map);

        function onMapClick(e) {
            let location = e.latlng;
            marker.setLatLng(location);

            localStorage.setItem("user_latitude", location.lat);
            localStorage.setItem("user_longitude", location.lng);
            get_weather_data(location.lat, location.lng);
        }
        
    });
}

function update_weather_information(data) {
    let properties = data.properties;
    let relative_location = properties.relativeLocation.properties;
    let city_state = `${relative_location.city}, ${relative_location.state}`;

    document.getElementById("city-state").innerText = city_state;

    let forecast_url = properties.forecast;
    let hourly_url = properties.forecastHourly;

    fetch(forecast_url, {
        headers: MORROW_HEADER
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
        update_forecast_information(data);
    })

    fetch(hourly_url, {
        headers: MORROW_HEADER
    })
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
        update_hourly_information(data);
    })
}

function update_hourly_information(data) {
    let periods = data.properties.periods;

    document.getElementById("hourly-forecast").innerHTML = "";
    document.getElementById("hourly-graph").innerHTML = "";
    let max = -100;
    let min = 200;

    for(let i = 0; i < 12; i++) {
        period = periods[i];
        show_weather_snippet("hourly-forecast", 
                            period.temperature,
                            period.shortForecast,
                            period.icon,
                            parse(period.startTime).time
        );

        max = (period.temperature > max) ? period.temperature : max;
        min = (period.temperature < min) ? period.temperature : min;
    }

    for(let i = 0; i < 12; i++) {
        period = periods[i]
        show_column("hourly-graph", (period.temperature - min) * (MAX_GRAPH - MIN_GRAPH) / (max - min) + MIN_GRAPH);
    }
}

function update_forecast_information(data) {
    let periods = data.properties.periods;
    let current_weather = periods[0];

    document.getElementById("temperature").innerText = `${current_weather.temperature} ºF`;
    document.getElementById("short-forecast").innerText = current_weather.shortForecast;
    document.getElementById("main-image").src = current_weather.icon;
    document.getElementById("date").innerText = parse(current_weather.startTime).date_time;
    document.getElementById("precipitation").innerText = `Probability of Precipitation: ${current_weather.probabilityOfPrecipitation.value}%`;
    document.getElementById("wind").innerText = `Wind speed: ${current_weather.windSpeed}`;

    document.getElementById("daily-forecast").innerHTML = "";
    for(period of periods) {
        show_weather_snippet("daily-forecast", 
                            period.temperature, 
                            period.detailedForecast,
                            period.icon,
                            period.name);
    }

}

function show_column(location, value) {
    let template = document.getElementById("template-2");
    let clone = template.content.cloneNode(true);

    let square = clone.querySelector('.square');
    square.style.height = value + "px";

    let clone_location = document.getElementById(location);
    clone_location.appendChild(clone);
}

function show_weather_snippet(location, temperature_info, forecast_info, image, date) {
    let template = document.getElementById("template-1");
    let clone = template.content.cloneNode(true);
    let weather_window = clone.querySelector('.weather-info');
    weather_window.classList.replace("weather-info", location);
    let temperature = clone.querySelector('#temperature-info');
    let forecast = clone.querySelector('#forecast-info');
    let image_obj = clone.querySelector('#image');
    let date_obj = clone.querySelector('#date');
    let weather_button = clone.querySelector('#weather-button');
    let formated_forecast = forecast_info

    weather_button.addEventListener('click', () => {
        weather_window.classList.toggle('active');
    });

    temperature.innerText = temperature_info + ' ºF';
    forecast.innerText = formated_forecast;
    image_obj.src = image;
    date_obj.innerText = date;

    let clone_location = document.getElementById(location);
    clone_location.appendChild(clone);
}
