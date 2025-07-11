import config from 'config'

export const configuration = () => ({ ...config, isDevEnv: process.env.NODE_ENV === 'development' })
