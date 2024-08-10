import { INestApplication, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, OpenAPIObject, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'
import { NextFunction } from 'express'
import { AuthMiddleware } from 'src/auth/auth.middleware'
import { CookieToken } from 'src/auth/cookie-token'
import { Request } from 'src/auth/request.interface'
import { Config } from 'src/enums/config.enum'

@Injectable()
export class SwaggerConfigBuilder {
  private document: OpenAPIObject

  constructor(
    private readonly configService: ConfigService,
    private readonly authMiddleware: AuthMiddleware,
  ) {}

  build(app: INestApplication) {
    const path = this.configService.get<string>(Config.HTTP_SWAGGER_PATH)
    const authGroups = this.configService.get<string[]>(Config.HTTP_SWAGGER_AUTH_GROUPS)

    if (path) {
      if (authGroups?.length) {
        this.setupAuth(app, path, authGroups)
      }
      this.document = SwaggerModule.createDocument(app, this.config, this.documentOptions)
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

  private get documentOptions(): SwaggerDocumentOptions {
    return {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    }
  }

  private setupAuth(app: INestApplication<any>, path: string, authGroups: string[]) {
    app.use(
      [`/${path}*`],
      this.authMiddleware.use.bind(this.authMiddleware),
      (req: Request, res, next: NextFunction) => {
        req.user.isAuthorizedOrThrow(...authGroups)
        next()
      },
    )
  }
}
