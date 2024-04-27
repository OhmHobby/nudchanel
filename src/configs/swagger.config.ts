import { INestApplication, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, OpenAPIObject, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'
import { CookieToken } from 'src/auth/cookie-token'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class SwaggerConfigBuilder {
  private document: OpenAPIObject

  constructor(private readonly configService: ConfigService) {}

  build(app: INestApplication) {
    const path = this.configService.get<string>(Config.HTTP_SWAGGER_PATH)
    if (path) {
      this.document = SwaggerModule.createDocument(app, this.config, this.options)
      SwaggerModule.setup(path, app, this.document)
    }
  }

  private get config() {
    return new DocumentBuilder()
      .setTitle('NUD Channel web service')
      .setVersion(process.env.npm_package_version ?? '1.0')
      .addBearerAuth()
      .addCookieAuth(CookieToken.ACCESS_TOKEN_COOKIE_NAME)
      .build()
  }

  private get options(): SwaggerDocumentOptions {
    return {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    }
  }
}
