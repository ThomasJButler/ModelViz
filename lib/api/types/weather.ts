/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description TypeScript type definitions for Open-Meteo Weather API requests and responses
 */

// Current Weather Data
export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number; // 0 or 1
  time: string;
}

// Hourly Weather Data
export interface HourlyWeatherData {
  time: string[];
  temperature_2m: number[];
  relativehumidity_2m: number[];
  dewpoint_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  snow_depth: number[];
  weathercode: number[];
  pressure_msl: number[];
  surface_pressure: number[];
  cloudcover: number[];
  cloudcover_low: number[];
  cloudcover_mid: number[];
  cloudcover_high: number[];
  visibility: number[];
  evapotranspiration: number[];
  et0_fao_evapotranspiration: number[];
  vapor_pressure_deficit: number[];
  windspeed_10m: number[];
  windspeed_80m: number[];
  windspeed_120m: number[];
  windspeed_180m: number[];
  winddirection_10m: number[];
  winddirection_80m: number[];
  winddirection_120m: number[];
  winddirection_180m: number[];
  windgusts_10m: number[];
  temperature_80m: number[];
  temperature_120m: number[];
  temperature_180m: number[];
  soil_temperature_0cm: number[];
  soil_temperature_6cm: number[];
  soil_temperature_18cm: number[];
  soil_temperature_54cm: number[];
  soil_moisture_0_1cm: number[];
  soil_moisture_1_3cm: number[];
  soil_moisture_3_9cm: number[];
  soil_moisture_9_27cm: number[];
  soil_moisture_27_81cm: number[];
}

// Daily Weather Data
export interface DailyWeatherData {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  uv_index_clear_sky_max: number[];
  precipitation_sum: number[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum: number[];
  precipitation_hours: number[];
  precipitation_probability_max: number[];
  windspeed_10m_max: number[];
  windgusts_10m_max: number[];
  winddirection_10m_dominant: number[];
  shortwave_radiation_sum: number[];
  et0_fao_evapotranspiration: number[];
}

// Units for each variable
export interface WeatherUnits {
  time?: string;
  temperature_2m?: string;
  relativehumidity_2m?: string;
  dewpoint_2m?: string;
  apparent_temperature?: string;
  precipitation_probability?: string;
  precipitation?: string;
  rain?: string;
  showers?: string;
  snowfall?: string;
  snow_depth?: string;
  weathercode?: string;
  pressure_msl?: string;
  surface_pressure?: string;
  cloudcover?: string;
  cloudcover_low?: string;
  cloudcover_mid?: string;
  cloudcover_high?: string;
  visibility?: string;
  evapotranspiration?: string;
  et0_fao_evapotranspiration?: string;
  vapor_pressure_deficit?: string;
  windspeed_10m?: string;
  windspeed_80m?: string;
  windspeed_120m?: string;
  windspeed_180m?: string;
  winddirection_10m?: string;
  winddirection_80m?: string;
  winddirection_120m?: string;
  winddirection_180m?: string;
  windgusts_10m?: string;
  temperature_80m?: string;
  temperature_120m?: string;
  temperature_180m?: string;
  soil_temperature_0cm?: string;
  soil_temperature_6cm?: string;
  soil_temperature_18cm?: string;
  soil_temperature_54cm?: string;
  soil_moisture_0_1cm?: string;
  soil_moisture_1_3cm?: string;
  soil_moisture_3_9cm?: string;
  soil_moisture_9_27cm?: string;
  soil_moisture_27_81cm?: string;
  temperature_2m_max?: string;
  temperature_2m_min?: string;
  apparent_temperature_max?: string;
  apparent_temperature_min?: string;
  sunrise?: string;
  sunset?: string;
  uv_index_max?: string;
  uv_index_clear_sky_max?: string;
  precipitation_sum?: string;
  rain_sum?: string;
  showers_sum?: string;
  snowfall_sum?: string;
  precipitation_hours?: string;
  precipitation_probability_max?: string;
  windspeed_10m_max?: string;
  windgusts_10m_max?: string;
  winddirection_10m_dominant?: string;
  shortwave_radiation_sum?: string;
}

// Main forecast response structure
export interface WeatherForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather?: CurrentWeather;
  hourly_units?: WeatherUnits;
  hourly?: HourlyWeatherData;
  daily_units?: WeatherUnits;
  daily?: DailyWeatherData;
}

// Weather Query Parameters
export interface WeatherQueryParams {
  latitude: number;
  longitude: number;
  current_weather?: boolean;
  temperature_unit?: 'celsius' | 'fahrenheit';
  windspeed_unit?: 'kmh' | 'ms' | 'mph' | 'kn';
  precipitation_unit?: 'mm' | 'inch';
  timeformat?: 'iso8601' | 'unixtime';
  timezone?: string;
  past_days?: number;
  forecast_days?: number;
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string;   // Format: YYYY-MM-DD
  hourly?: string;     // Comma-separated list of hourly variables
  daily?: string;      // Comma-separated list of daily variables
}

// Geocoding response for location search
export interface GeocodingResponse {
  results: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    admin1_id: number;
    admin2_id: number;
    admin3_id: number;
    admin4_id: number;
    timezone: string;
    population: number;
    postcodes: string[];
    country_id: number;
    country: string;
    admin1: string;
    admin2: string;
    admin3: string;
    admin4: string;
  }>;
  generationtime_ms: number;
}
