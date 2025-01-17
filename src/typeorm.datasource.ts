import config from 'config'
import { Config } from 'src/enums/config.enum'
import { DataSource } from 'typeorm'
import { TypeormConfigService } from './configs/typeorm.config'

export default new DataSource({
  type: 'postgres',
  host: config.get<string>(Config.PG_HOST),
  port: config.get<number>(Config.PG_PORT),
  username: config.get<string>(Config.PG_USER),
  password: config.get<string>(Config.PG_PASS),
  database: config.get<string>(Config.PG_DB),
  entities: TypeormConfigService.entities,
  migrations: TypeormConfigService.migrations,
})
