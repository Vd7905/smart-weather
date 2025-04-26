const input = document.querySelector('.search-bar')
const City = document.querySelector('.city')
const wind = document.querySelector('.wind-speed')
const day = document.querySelector('.day')
const weather = document.querySelector('.weather')
const card =  document.querySelector('.weather-card')
const filter = document.querySelector(".weather-filter");
const image = document.querySelector(".image");
const weatherContainer = document.querySelector('.weather-card-container');
const themeToggleButton = document.querySelector('.theme-toggle');


// Check if the user has a preferred theme in localStorage
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
} else {
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
}

themeToggleButton.addEventListener('click', () => {
  // Toggle theme
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  
  // Save the selected theme in localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

function saveCity(cityName) {
  let cities = JSON.parse(localStorage.getItem('cities')) || [];

  // Remove if already present to avoid duplicates
  cities = cities.filter(city => city !== cityName);

  // Add new city at the beginning
  cities.unshift(cityName);

  // Limit to 8 recent cities
  if (cities.length > 8) {
    cities.pop(); // Remove the last (oldest)
  }

  localStorage.setItem('cities', JSON.stringify(cities));
}


function loadSavedCities() {
  let cities = JSON.parse(localStorage.getItem('cities')) || [];

  // Only take up to 8 cities even if somehow more are saved
  cities.slice(0, 8).forEach(city => {
    getWeather(city); // Your existing function to fetch weather
  });
}



let cities = [];

async function loadCities() {
  const res = await fetch('cities.json');
  const data = await res.json();
  cities = data.cities;
}

var imageNumber = 2;

const apiKey = "ea7344a0af339968d7cfd74ef38df117";




function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  }
  
  const handleSearch = debounce((e) => {
    getWeather(e.target.value,null);
  }, 1000);
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
 
  async function getWeather(city, conditionFromFilter = null) {
    saveCity(city);
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    const condition = conditionFromFilter || data.weather?.[0]?.main;

    if (condition === "Clear") {
      imageNumber = 1;
    } else if (condition === "Rain") {
      imageNumber = 3;
    } else {
      imageNumber = 2;
    }

    var imageUrl = `./assets/${imageNumber}.svg`;
    const newDiv = document.createElement("div");
    newDiv.classList.add("weather-card");

    let now = new Date(); 
    let content = `
     <img src="${imageUrl}" alt="Weather Icon" />
     City:  ${data.name} <br>
     Day:  ${days[now.getDay()]} <br>
     Wind Speed:  ${data.wind.speed} m/s <br>
     Weather:  ${data.main.temp} °C
    `;

    newDiv.innerHTML = content;

    weatherContainer.appendChild(newDiv);

    console.log(data)

   

  }


async function filterCities() {
  await loadCities();
  weatherContainer.innerHTML = "";
  const tempFilter = document.querySelector(".temp-filter").value;
  const weatherFilter = document.querySelector(".weather-filter").value;

  console.log(tempFilter);
  console.log(weatherFilter);

  
  const results = await Promise.all(
    cities.map(city =>
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
    )
  );

  const filtered = results.filter(data => {
    if (!data.main && !data.weather) return false;

    const temp = data.main.temp;
    const condition = data.weather[0].main;

    const matchesTemp =
      (tempFilter === "cold" && temp < 10) ||
      (tempFilter === "mild" && temp >= 10 && temp <= 30) ||
      (tempFilter === "hot" && temp > 30);

    const matchesWeather = condition === weatherFilter;
    if(data.main && data.weather){
      return  matchesWeather && matchesTemp;
    }
    else if(data.main) return matchesTemp;
    else matchesWeather;
   

  });

  console.log("Filtered Cities:", filtered.map(c => c.name));
  filtered.forEach(data => {
    getWeather(data.name, data.weather[0].main);
  });
  
  
}

 

filter.addEventListener("change", () => {
  const selected = filter.value;
  console.log("Selected filter:", selected);
});



document.querySelector(".temp-filter").addEventListener("change", filterCities);
document.querySelector(".weather-filter").addEventListener("change", filterCities);
window.addEventListener('load', function() {
  loadSavedCities();
});
input.addEventListener('input', handleSearch);


    