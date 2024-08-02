import { ApiProperty } from '@nestjs/swagger'

export enum SignInStatus {
  ok = 'ok',
  pending = 'pending',
}

export class SignInLocalUserResponseDto {
  @ApiProperty({ enum: SignInStatus })
  status: SignInStatus
}
