export enum RabbitQueue {
  EmailConfirmationMessageCreated = 'mailer.accounts.topic.email_confirmation_message_created.queue',
  DiscordProfileSync = 'accounts.discord_bot.topic.request_profile_sync.queue',
  PhotoMetadataQueue = 'photo_processor.photo_metadata.queue',
  ProcessPhotoQueue = 'photo_processor.process_photo.queue',
}
