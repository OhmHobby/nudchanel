import config from 'config'
import { Config } from 'src/enums/config.enum'

export const configuration = () => ({ ...config, [Config.IS_PROD_ENV]: process.env.NODE_ENV === 'production' })
