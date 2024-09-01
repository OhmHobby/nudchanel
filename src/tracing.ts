import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib'
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb'
import { MongooseInstrumentation } from '@opentelemetry/instrumentation-mongoose'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { Resource } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_HOST_NAME,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import config from 'config'
import process from 'process'
import { Config } from './enums/config.enum'

const traceExporter = new OTLPTraceExporter({
  url: config.get<string>(Config.OTLP_TRACE_URL),
})

const otelSDK = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'webservice',
    [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
    [SEMRESATTRS_HOST_NAME]: process.env.HOSTNAME,
  }),
  spanProcessor:
    process.env.NODE_ENV === `development`
      ? new SimpleSpanProcessor(traceExporter)
      : new BatchSpanProcessor(traceExporter),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: config.get<string>(Config.OTLP_METRIC_URL),
    }),
    exportIntervalMillis: config.get<number>(Config.OTLP_METRIC_INTERVAL),
  }),
  contextManager: new AsyncLocalStorageContextManager(),
  instrumentations: [
    new DnsInstrumentation(),
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => !!req?.url?.startsWith('/ping'),
    }),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new MongoDBInstrumentation(),
    new MongooseInstrumentation(),
    new IORedisInstrumentation(),
    new AmqplibInstrumentation(),
    new WinstonInstrumentation(),
  ],
})

export default otelSDK
