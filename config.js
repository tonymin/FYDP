/* Magic Mirror Config Sample
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address : '0.0.0.0',
    ipWhitelist: [], // We allow all IP addresses to access the control for now. TODO: this is not secure.

	//address: "localhost", 	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/", 	// The URL path where MagicMirror is hosted. If you are using a Reverse proxy
					// you must set the sub path here. basePath must end with a /
	//ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], 	// Set [] to allow all IP addresses
															// or add a specific IPv4 of 192.168.1.5 :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
															// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, 		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", 	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", 	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"],
	timeFormat: 24,
	units: "metric",
	// serverOnly:  true/false/"local" ,
	// local for armv6l processors, default
	//   starts serveronly and then starts chrome browser
	// false, default for all NON-armv6l devices
	// true, force serveronly mode, because you want to.. no UI on this device

	modules: [
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "calendar",
			header: "US Holidays",
			position: "top_left",
			config: {
				calendars: [
					{
						symbol: "calendar-check",
						url: "webcal://www.calendarlabs.com/ical-calendar/ics/76/US_Holidays.ics"					}
				]
			}
		},
		{
			module: "compliments",
			position: "lower_third"
		},
		{
			module: "currentweather",
			position: "bottom_left",
			config: {
				location: "Toronto",
				locationID: "", //ID from http://bulk.openweathermap.org/sample/city.list.json.gz; unzip the gz file and find your city
				appid: "9834f0adef3873a6447fcfb12f0a5788"
			}
		},
		{
			module: "weatherforecast",
			position: "bottom_left",
			header: "Weather Forecast",
			config: {
				location: "Toronto",
				locationID: "5128581", //ID from http://bulk.openweathermap.org/sample/city.list.json.gz; unzip the gz file and find your city
				appid: "9834f0adef3873a6447fcfb12f0a5788"
			}
		},
		{
			module: "newsfeed",
			position: "bottom_bar",
			config: {
				feeds: [
					{
						title: "New York Times",
						url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
					}
				],
				showSourceTitle: true,
				showPublishDate: true,
				broadcastNewsFeeds: true,
				broadcastNewsUpdates: true
			}
		},
		{
			module: 'MMM-SensorControl',
			position: "top_right",
			config: {
				text: "Hello",
				idle_timer: 20
			}
		},
		{
			module: 'MMM-pages',
			config: {
					modules:
						[[ "newsfeed"],
						 [ "calendar", "compliments" ],
						 [ "compliments", "MMM-Remote-Control"],
						 [ "currentweather"]],
					fixed: ["clock", "MMM-page-indicator", , "MMM-NearCompliments","MMM-SensorControl", "MMM-network-signal"],
					rotationTime : 10000, // auto-rotate time in ms (NOTE: timing is quite off ...)
					/*
					hiddenPages: {
						"screenSaver": [ "clock", "MMM-SomeBackgroundImageModule" ],
						"admin": [ "MMM-ShowMeSystemStatsModule", "MMM-AnOnScreenMenuModule" ],
					},
					*/
			}
		},
		{
			module: 'MMM-page-indicator',
			position: 'bottom_bar',
			config: {
				pages: 3,
			}
		},
		{
			module: 'MMM-Remote-Control',
			position: 'bottom_left',
			config: {
				customMenu: "custom_menu_remote_control.json",
			}
		},
		{
			module: "MMM-Remote-Control-Repository"
		},
		{
			module: "MMM-network-signal",
			position: "bottom_right",
			config: {
				// Configuration of the module goes here
			}

		}
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
