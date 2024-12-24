import { APIUser, REST, RESTPostOAuth2AccessTokenResult, RouteLike } from 'discord.js'

export const mockDiscordRestClient: Partial<REST> = {
  get(fullRoute: RouteLike) {
    if (fullRoute === '/users/@me') {
      return Promise.resolve(<APIUser>{})
    } else {
      console.error('GET', fullRoute)
      return Promise.resolve()
    }
  },
  post(fullRoute: RouteLike) {
    if (fullRoute === '/oauth2/token') {
      return Promise.resolve(<RESTPostOAuth2AccessTokenResult>{})
    } else {
      console.error('POST', fullRoute)
      return Promise.resolve()
    }
  },
  setToken() {
    return this
  },
}
