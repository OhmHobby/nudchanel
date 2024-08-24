export enum RabbitRoutingKey {
  EmailConfirmationMessageCreated = 'email_confirmation_message_created',
  RequestProfileSync = 'request_profile_sync',
  DiscordProfileUpdated = 'discord_profile_updated',
  GetMetadata = 'get_metadata',
  RequestProcess = 'request_process',
  Processed = 'processed',
  Metadata = 'metadata',
}
