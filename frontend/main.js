let map = L.map("map").setView([-38.4192641, -63.5989206], 4);
L.tileLayer("https://tiles.stadiamaps.com/data/satellite/{z}/{x}/{y}.jpg", {
  minZoom: 4,
  maxZoom: 10,
  attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
}).addTo(map);

fetchData("limites", ({ nacional, provincial }) => {
  L.geoJSON(nacional, (style = { color: "black", weight: 2 })).addTo(map);
  L.geoJSON(
    provincial,
    (style = { color: "black", weight: 1, dashArray: "4" })
  ).addTo(map);
});

let dias = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
let meses = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

let ciudades;
const loader = document.querySelector(".loader");
const nombreCiudad = document.getElementById("nombreCiudad");
const pronostico = document.getElementById("pronostico");

const displayForecast = (data) => {
  for (let i = 0; i < data.time.length; i++) {
    let dia = `${dias[data.time[i].getDay()]} ${data.time[i].getDate()} ${
      meses[data.time[i].getMonth()]
    }`;
    let tempMax = data.temperature_2m_max[i];
    let tempMin = data.temperature_2m_min[i];
    let probPrec = data.precipitation_probability_max[i];
    let sunshine_duration = data.sunshine_duration[i];
    let snowfall_sum = data.snowfall_sum[i];
    let rain_sum = data.rain_sum[i] + data.showers_sum[i];
    let status = "";
    if (probPrec > 30) {
      if (snowfall_sum > 0) {
        status = "snow";
      } else {
        status = "rain";
      }
    } else {
      if (sunshine_duration > 38) {
        status = "sun";
      } else {
        status = "cloud";
      }
    }
    let divPronostico = document.createElement("div");
    divPronostico.className = "pronostico";
    divPronostico.innerHTML = `<h2 class="outfit-bold">${dia}</h2>
<div class="data">
  <div class="icon ${status}">
  </div>
  <div class="numbers outfit-regular">
      <div><svg viewBox="0 0 16 16" fill="var(--coral)"><use width="100%" height="100%" x=0 href="#thermometer"/> </svg><span>${Math.round(
        tempMax
      )}°C/${Math.round(tempMin)}°C</span></div>
      <div>
      <svg viewBox="0 0 100 100" >
        <clipPath id="percentageClip${i}">
          <rect x="0" y="${
            100 - Math.round(probPrec * 100) / 100
          }" width="100" height="100" />
        </clipPath>
        <use width="100%" height="100%" x=0 href="#droplet" fill="var(--taupe-gray)"/>
        <use width="100%" height="100%" x=0 href="#droplet" fill="var(--federal-blue)" clip-path="url(#percentageClip${i})"/>  
      </svg><span>${Math.round(probPrec)}%</span></div>
  </div>
</div>`;
    pronostico.appendChild(divPronostico);
  }
};

fetchData("ciudades", (data) => {
  ciudades = data;
  ciudades.forEach((city) => {
    let marker = L.marker([city.lat, city.lng]).addTo(map);
    marker.on("click", () => {
      loader.style.display = "block";
      nombreCiudad.innerHTML = city.city;
      pronostico.innerHTML = "";
      postData(
        "pronostico",
        { latitud: city.lat, longitud: city.lng },
        (data) => {
          loader.style.display = "none";
          data.time = data.time.map((t) => new Date(t));
          displayForecast(data);
        }
      );
    });
  });
});
