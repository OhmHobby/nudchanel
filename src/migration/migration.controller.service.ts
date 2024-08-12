import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller({ path: 'migrate' })
@ApiTags('Migration')
export class MigrationController {
  constructor() {}
}
