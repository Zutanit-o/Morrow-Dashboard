# MORROW WEATHER DASHBOARD

A small retro inspired weather dashboard. Made with the NWS API.

## Description

The dashboard has sections for hourly and daily forecast, including a small graph for each day or night you choose. It automatically detects your location through the JavaScript geolocation api tho you can input another one in the map section at the bottom.

Since this project uses the National Weather Service api, weather is only available for US locations. Fun fact: I dont live in the US! So there may be a couple of bugs regarding the location of the user.

## Running Locally

You can compile the scss with Dart Sass by running:
```
sass sass/styles.scss css/styles.css
```