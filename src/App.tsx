import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
} from "lucide-react";

interface WeatherData {
  name: string;
  country: string;
  temperature: number;
  windspeed: number;
  weathercode: number;
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Detect system theme once on mount
  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    setTheme(systemTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Optionally remember it
    localStorage.setItem("theme", newTheme);
  };

  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Try another one.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        name,
        country,
        temperature: weatherData.current_weather.temperature,
        windspeed: weatherData.current_weather.windspeed,
        weathercode: weatherData.current_weather.weathercode,
      });
    } catch (err) {
      setError("Error fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const weatherDescriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Rain showers",
    95: "Thunderstorm",
  };

  const getIcon = (code: number) => {
    if ([0, 1].includes(code))
      return <Sun size={48} className="text-yellow-400" />;
    if ([2, 3].includes(code))
      return <Cloud size={48} className="text-gray-400" />;
    if ([61, 63, 65, 80].includes(code))
      return <CloudRain size={48} className="text-blue-500" />;
    if ([95].includes(code))
      return <CloudLightning size={48} className="text-purple-600" />;
    return <Wind size={48} className="text-sky-400" />;
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-700 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100"
          : "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full shadow-lg transition"
      >
        {isDark ? (
          <Sun size={24} className="text-yellow-300" />
        ) : (
          <Moon size={24} className="text-gray-800" />
        )}
      </button>

      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-lg animate-pulse">
        🌦️ Weather Now
      </h1>

      <div
        className={`shadow-xl rounded-3xl p-8 w-full max-w-md text-center border hover:scale-105 transition-all duration-300 backdrop-blur-md ${
          isDark ? "bg-white/10 border-gray-700" : "bg-white/20 border-white/30"
        }`}
      >
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg p-3 mb-4 text-gray-800 focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-inner"
        />
        <button
          onClick={getWeather}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-2 rounded-lg hover:from-yellow-500 hover:to-red-500 shadow-lg transition-all duration-300 disabled:opacity-60"
        >
          {loading ? "Fetching Weather..." : "Get Weather"}
        </button>

        {error && (
          <p className="text-red-300 mt-4 font-medium bg-red-500/20 rounded-lg p-2">
            {error}
          </p>
        )}

        {weather && (
          <div
            className={`mt-6 text-center p-6 rounded-2xl shadow-inner ${
              isDark ? "bg-white/5" : "bg-white/10"
            }`}
          >
            <div className="flex justify-center mb-4">
              {getIcon(weather.weathercode)}
            </div>
            <h2 className="text-2xl font-bold drop-shadow-md">
              {weather.name}, {weather.country}
            </h2>
            <p className="text-6xl font-extrabold text-yellow-300 mt-3 drop-shadow-lg">
              {weather.temperature}°C
            </p>
            <p className="text-lg mt-2 opacity-90">
              {weatherDescriptions[weather.weathercode] || "Unknown weather"}
            </p>
            <div className="flex justify-center items-center gap-3 text-sm mt-2 opacity-75">
              <Wind size={18} /> {weather.windspeed} km/h
              <Droplets size={18} /> Feels good
            </div>
          </div>
        )}
      </div>

      <footer
        className={`mt-8 text-sm transition ${
          isDark ? "text-gray-400" : "text-blue-100"
        }`}
      ></footer>
    </div>
  );
}
