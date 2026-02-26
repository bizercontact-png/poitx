import { Plugin } from '../../types/plugin'

export const weatherPlugin: Plugin = {
  manifest: {
    id: 'poitx.weather',
    name: 'Weather Pro',
    version: '1.0.0',
    description: 'اطلاعات آب و هوای لحظه‌ای با پیش‌بینی ۷ روزه',
    author: 'POITX Team',
    icon: '🌤️',
    category: 'utility',
    permissions: ['network'],
    apiVersion: '1.0.0'
  },

  async activate(api) {
    console.log('Weather plugin activated')
  },

  commands: {
    getWeather: async ({ city, country }: { city: string; country?: string }) => {
      const apiKey = process.env.WEATHER_API_KEY
      const location = country ? `${city},${country}` : city
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
        )
        const data = await response.json()

        return {
          city: data.name,
          country: data.sys.country,
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          wind: data.wind.speed
        }
      } catch (error) {
        return { error: 'Could not fetch weather data' }
      }
    },

    getForecast: async ({ city, days = 7 }: { city: string; days?: number }) => {
      const apiKey = process.env.WEATHER_API_KEY
      
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=${days}&appid=${apiKey}`
        )
        const data = await response.json()

        return {
          city: data.city.name,
          country: data.city.country,
          forecast: data.list.map((item: any) => ({
            date: item.dt_txt,
            temperature: item.main.temp,
            description: item.weather[0].description,
            icon: item.weather[0].icon
          }))
        }
      } catch (error) {
        return { error: 'Could not fetch forecast' }
      }
    }
  }
}
