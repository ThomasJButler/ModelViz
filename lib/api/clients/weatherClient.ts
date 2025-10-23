/**
 * @author Tom Butler
 * @date 2025-10-23
 * @description Weather API client for Open-Meteo with forecast, current conditions, and geocoding support
 */

import { ApiClient } from '../apiClient';
import * as WeatherTypes from '../types/weather';

export class WeatherClient extends ApiClient {
  constructor() {
    super('https://api.open-meteo.com/v1');
  }
  
  /**
   * Gets detailed weather forecast for geographical coordinates
   * @param params - Query parameters including location and desired data
   * @return Complete weather forecast with hourly and daily data
   */
  async getForecast(params: WeatherTypes.WeatherQueryParams): Promise<WeatherTypes.WeatherForecastResponse> {
    const queryParams = new URLSearchParams();
    
    // Add required parameters
    queryParams.append('latitude', params.latitude.toString());
    queryParams.append('longitude', params.longitude.toString());
    
    // Add optional parameters if provided
    if (params.current_weather !== undefined) {
      queryParams.append('current_weather', params.current_weather.toString());
    }
    if (params.temperature_unit) {
      queryParams.append('temperature_unit', params.temperature_unit);
    }
    if (params.windspeed_unit) {
      queryParams.append('windspeed_unit', params.windspeed_unit);
    }
    if (params.precipitation_unit) {
      queryParams.append('precipitation_unit', params.precipitation_unit);
    }
    if (params.timeformat) {
      queryParams.append('timeformat', params.timeformat);
    }
    if (params.timezone) {
      queryParams.append('timezone', params.timezone);
    }
    if (params.past_days !== undefined) {
      queryParams.append('past_days', params.past_days.toString());
    }
    if (params.forecast_days !== undefined) {
      queryParams.append('forecast_days', params.forecast_days.toString());
    }
    if (params.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date);
    }
    if (params.hourly) {
      queryParams.append('hourly', params.hourly);
    }
    if (params.daily) {
      queryParams.append('daily', params.daily);
    }
    
    return this.get<WeatherTypes.WeatherForecastResponse>(`forecast?${queryParams.toString()}`);
  }
  
  /**
   * Gets current weather conditions for a location
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param temperatureUnit - Temperature unit preference
   * @param timezone - Timezone for time values
   * @return Current weather conditions
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number,
    temperatureUnit: 'celsius' | 'fahrenheit' = 'celsius',
    timezone: string = 'auto'
  ): Promise<WeatherTypes.CurrentWeather> {
    const response = await this.getForecast({
      latitude,
      longitude,
      current_weather: true,
      temperature_unit: temperatureUnit,
      timezone
    });
    
    if (!response.current_weather) {
      throw new Error('Current weather data not available');
    }
    
    return response.current_weather;
  }
  
  /**
   * Gets daily weather forecast with temperature ranges and precipitation
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param days - Number of forecast days
   * @param temperatureUnit - Temperature unit preference
   * @param timezone - Timezone for time values
   * @return Daily forecast data with min/max temperatures
   */
  async getDailyForecast(
    latitude: number,
    longitude: number,
    days: number = 7,
    temperatureUnit: 'celsius' | 'fahrenheit' = 'celsius',
    timezone: string = 'auto'
  ): Promise<{
    time: string[];
    weathercode: number[];
    temperature_max: number[];
    temperature_min: number[];
    precipitation_sum: number[];
    units: Partial<WeatherTypes.WeatherUnits>;
  }> {
    const response = await this.getForecast({
      latitude,
      longitude,
      temperature_unit: temperatureUnit,
      timezone,
      forecast_days: days,
      daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum'
    });
    
    if (!response.daily) {
      throw new Error('Daily forecast data not available');
    }
    
    return {
      time: response.daily.time,
      weathercode: response.daily.weathercode,
      temperature_max: response.daily.temperature_2m_max,
      temperature_min: response.daily.temperature_2m_min,
      precipitation_sum: response.daily.precipitation_sum,
      units: response.daily_units || {}
    };
  }
  
  /**
   * Gets hourly weather forecast with detailed conditions
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param hours - Number of forecast hours
   * @param temperatureUnit - Temperature unit preference
   * @param timezone - Timezone for time values
   * @return Hourly forecast data
   */
  async getHourlyForecast(
    latitude: number,
    longitude: number,
    hours: number = 24,
    temperatureUnit: 'celsius' | 'fahrenheit' = 'celsius',
    timezone: string = 'auto'
  ): Promise<{
    time: string[];
    temperature: number[];
    precipitation: number[];
    weathercode: number[];
    units: Partial<WeatherTypes.WeatherUnits>;
  }> {
    const forecastDays = Math.ceil(hours / 24);
    
    const response = await this.getForecast({
      latitude,
      longitude,
      temperature_unit: temperatureUnit,
      timezone,
      forecast_days: forecastDays,
      hourly: 'temperature_2m,precipitation,weathercode'
    });
    
    if (!response.hourly) {
      throw new Error('Hourly forecast data not available');
    }
    
    // Limit to requested number of hours
    const limitedData = {
      time: response.hourly.time.slice(0, hours),
      temperature: response.hourly.temperature_2m.slice(0, hours),
      precipitation: response.hourly.precipitation.slice(0, hours),
      weathercode: response.hourly.weathercode.slice(0, hours),
      units: response.hourly_units || {}
    };
    
    return limitedData;
  }
  
  /**
   * Searches for locations by name using geocoding API
   * @param query - Location name to search for
   * @param count - Maximum number of results
   * @return Geocoding results with coordinates
   */
  async searchLocation(query: string, count: number = 5): Promise<WeatherTypes.GeocodingResponse> {
    const geocodingClient = new ApiClient('https://geocoding-api.open-meteo.com/v1');
    
    const queryParams = new URLSearchParams();
    queryParams.append('name', query);
    queryParams.append('count', count.toString());
    
    return geocodingClient.get<WeatherTypes.GeocodingResponse>(`search?${queryParams.toString()}`);
  }
  
  /**
   * Converts numeric weather code to human-readable description
   * @param code - WMO weather code
   * @return Weather condition description
   */
  getWeatherDescription(code: number): string {
    const weatherCodes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    
    return weatherCodes[code] || 'Unknown';
  }
}
