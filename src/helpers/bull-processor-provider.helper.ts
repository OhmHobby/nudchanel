import * as config from 'config'
import { Config } from 'src/enums/config.enum'

export class BullProcessorProviderHelper {
  private static readonly bullProcessorMetadataKey = 'bull:module_queue'

  private static get processorEnabled() {
    return config.get<boolean>(Config.PROCESSOR_ENABLED)
  }

  static filterEnabled(instance: any) {
    const hasProcessor = Reflect.getMetadataKeys(instance).includes(
      BullProcessorProviderHelper.bullProcessorMetadataKey,
    )
    return BullProcessorProviderHelper.processorEnabled || !hasProcessor
  }
}
