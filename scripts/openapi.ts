import * as request from 'supertest'
import { TestData } from '../test/test-data'
;(async () => {
  const app = await TestData.aValidApp().build()
  request(app.getHttpServer()).get('/swagger')
  app.close()
})()
