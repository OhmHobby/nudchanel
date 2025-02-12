@gallery_photos
Feature: Gallery albums

  Scenario: Query albums photos
    When GET /api/v1/gallery/albums/GijdrhF/photos
    Then HTTP response status should be OK
    And gallery album photos should contain
      | id                       | uuid                                 | width | height | timestamp                | color   | takenBy.profileId        | takenBy.firstname | takenBy.lastname  | thumbnail                                                                                | preview                                                                                |
      | 623b40676d40de97482571b7 | b7aea6fc-6850-41b2-89c8-af2f743edebd | 5184  | 3456   | 2021-03-03T12:08:16.000Z | #736660 | 5f26d84604f18f00186e4101 | Ananyoch          | Sinananwanich     | https://photos.nudchannel.com/photos/thumbnail/b7aea6fc-6850-41b2-89c8-af2f743edebd.webp | https://photos.nudchannel.com/photos/preview/b7aea6fc-6850-41b2-89c8-af2f743edebd.webp |
      | 623b3fe06d40de97482555ab | a2414b10-ad74-4ad5-9300-c1eea0894f5b | 4608  | 3456   | 2021-03-03T15:26:02.000Z | #d0cac1 | 5c2a0b65fa752187529185e6 | Rattapong         | Pothirungsiyakorn | https://photos.nudchannel.com/photos/thumbnail/a2414b10-ad74-4ad5-9300-c1eea0894f5b.webp | https://photos.nudchannel.com/photos/preview/a2414b10-ad74-4ad5-9300-c1eea0894f5b.webp |
    And gallery album photo contributors should contain
      | profileId                | firstname | lastname          |
      | 5f26d84604f18f00186e4101 | Ananyoch  | Sinananwanich     |
      | 5c2a0b65fa752187529185e6 | Rattapong | Pothirungsiyakorn |
