import { Injectable } from '@nestjs/common'
import { MetricService } from 'nestjs-otel'
import { OtelMetricAttribute } from 'src/enums/otel-metric-attribute.enum'
import { OtelMetricName } from 'src/enums/otel-metric-name.enum'
import { OtelMetricUnit } from 'src/enums/otel-metric-unit.enum'
import { LdapRequest } from './types/ldap-request.type'

@Injectable()
export class LdapMetricService {
  constructor(private readonly metricService: MetricService) {}

  searchMetric(req: LdapRequest, res, next) {
    this.metricService
      .getHistogram(OtelMetricName.LDAP_SERVER_DURATION, { unit: OtelMetricUnit.MILLISECONDS })
      .record(new Date().getTime() - req.startTime, {
        [OtelMetricAttribute.PROTOCOL_OP]: req.json.protocolOp,
        [OtelMetricAttribute.SCOPE]: req.json.scope,
        [OtelMetricAttribute.SUFFIX]: req.suffix.toString(),
      })
    next()
  }
}
