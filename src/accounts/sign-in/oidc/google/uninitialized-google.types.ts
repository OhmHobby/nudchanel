import { Auth, oauth2_v2 } from 'googleapis'

export type UnintializedGoogleOauth2Client = (redirectUri?: string) => Auth.OAuth2Client

export type UnintializedGoogleOauth2 = (oauth2Client: Auth.OAuth2Client) => oauth2_v2.Oauth2
