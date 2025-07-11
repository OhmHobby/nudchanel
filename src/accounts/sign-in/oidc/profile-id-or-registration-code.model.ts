import { ProfileId } from 'src/models/types'

export class ProfileIdOrRegistrationUrlModel {
  constructor(
    public readonly profileId?: ProfileId,
    public readonly registrationUrl?: string,
    public readonly isMfaEnabled?: boolean,
  ) {}
}
