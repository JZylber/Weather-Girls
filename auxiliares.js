const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

export const weatherResponse2Array = (responses, categories) => {
  const weatherData = [];
  for (const index in responses) {
    const response = responses[index];
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const daily = response.daily();
    const localWeatherData = {
      latitude: latitude,
      longitude: longitude,
      time: range(
        Number(daily.time()),
        Number(daily.timeEnd()),
        daily.interval()
      ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
    };
    categories.forEach((category, index) => {
      localWeatherData[category] = Array.from(
        daily.variables(index).valuesArray()
      );
    });
    weatherData.push(localWeatherData);
  }
  return weatherData[0];
};
