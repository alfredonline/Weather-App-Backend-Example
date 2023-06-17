const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const createError = require("http-errors");

const port = process.env.PORT || 3010;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const getWeather = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.log(error)
    throw createError(404, "Weather not found");
  }
};

const getCoordinates = async (location) => {
    try {
        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${process.env.API_KEY}`)
        return response.data
    } catch (error) {
        console.log(error)
        throw createError(404, "Coordinates not found")
    }
}

app.get('/api/weather/:location', async (req, res, next) => {

    console.log("hello world")

  try {
    const location = req.params.location;
    if (!location) {
      return next(createError(400, "Location is required"));
    } else {
      const coordinates = await getCoordinates(location);
      const weatherInformation = await getWeather(
        coordinates[0].lat,
        coordinates[0].lon
      );
      res.json(weatherInformation);
    }
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).json({
        error: {
            message: err.message || "Something went wrong on our end"
        }
    })
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})