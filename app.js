require("dotenv").config();

const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  const { API_URL } = process.env;
  const DEFAULT_COUNTRY = req.body.countryName || process.env.DEFAULT_COUNTRY;
  const DEFAULT_CITY = req.body.cityName || process.env.DEFAULT_CITY;
  const { API_TOKEN } = process.env;
  const url = `${API_URL}?city=${DEFAULT_CITY}&country=${DEFAULT_COUNTRY}&key=${API_TOKEN}`;

  https.get(url, (response) => {
    const chunks = [];

    response.on("data", (data) => {
      chunks.push(data);
    }).on("end", () => {
      const data = Buffer.concat(chunks);

      if (!data.length) {
        res.redirect("/");
      } else {
        const weatherData = JSON.parse(data);

        const currentTemp = weatherData.data[0].temp;
        const cityName = weatherData.data[0].city_name;
        const weatherIconLink = `${process.env.ICON_URL}${weatherData.data[0].weather.icon}.png`;

        res.render("result", {
          currentTemp,
          cityName,
          weatherIconLink,
        });
      }
    });
  }).on("error", (e) => {
    console.error(e); // eslint-disable-line no-console
  });
});

app.listen(3000);
