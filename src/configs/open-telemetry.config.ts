import { Injectable } from '@nestjs/common'
import { OpenTelemetryModuleOptions, OpenTelemetryOptionsFactory } from 'nestjs-otel/lib/interfaces'

@Injectable()
export class OpenTelemetryConfigService implements OpenTelemetryOptionsFactory {
  createOpenTelemetryOptions(): OpenTelemetryModuleOptions {
    return {
      metrics: {
        hostMetrics: true,
        apiMetrics: {
          enable: true,
          defaultAttributes: {
            app: 'webservice',
            service_name: process.env.npm_package_name,
            service_version: process.env.npm_package_version,
            deployment_environment: process.env.NODE_ENV,
            hostname: process.env.HOSTNAME,
          },
          ignoreRoutes: ['/ping'],
          ignoreUndefinedRoutes: false, // Records metrics for all URLs, even undefined ones
        },
      },
    }
  }
}
