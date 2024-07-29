import { InjectModel } from '@m8a/nestjs-typegoose'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import Handlebars from 'handlebars'
import helperMarkdown from 'helper-markdown'
import { MailTemplateModel } from 'src/models/delivery/mail-template.model'

@Injectable()
export class MailTemplatingService {
  constructor(
    @InjectModel(MailTemplateModel)
    private readonly templateModel: ReturnModelType<typeof MailTemplateModel>,
  ) {
    Handlebars.registerHelper(
      'markdown',
      helperMarkdown({
        injected: true,
        preset: 'default',
        linkify: true,
        breaks: true,
      }),
    )
  }

  findByEvent(event: string) {
    return this.templateModel.findOne({ event }).exec()
  }

  async findByEventAndRenderBody(event: string, variables = {}) {
    const template = await this.findByEvent(event)
    if (!template) {
      return null
    }
    template.body = Handlebars.compile(template.body)(variables)
    return template
  }
}
