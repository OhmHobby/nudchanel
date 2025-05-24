@gallery_photos
@import_photos
Feature: Gallery album photo import

  Background:
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E"
    And album upload directory "/2022/[2022.02.03] Rotation"
    When PUT /api/v1/gallery/albums/BaVRIkb
    Then HTTP response status should be NO_CONTENT

  @error
  Scenario: Non IT team should not able to import photos
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    And import album photos from directory "/2022/[2022.02.03] Rotation"
    And import album photos are taken by "5f26d84604f18f00186e4101"
    When POST /api/v1/gallery/albums/BaVRIkb/photos/imports
    Then HTTP response status should be FORBIDDEN

  Scenario: Import album photos to non existing album
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, it
    And import album photos from directory "/2022/[2022.02.03] Rotation"
    And import album photos are taken by "5f26d84604f18f00186e4101"
    When POST /api/v1/gallery/albums/BaV____/photos/imports
    Then HTTP response status should be NOT_FOUND

  Scenario: Import album photos directory doesn't match album setting
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, it
    And import album photos from directory "/2022/[2022.01.31] WebDev TEST/Photo/JPEG/Watermark"
    And import album photos are taken by "5f26d84604f18f00186e4101"
    When POST /api/v1/gallery/albums/BaVRIkb/photos/imports
    Then HTTP response status should be BAD_REQUEST

  Scenario: Import album photos
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, it
    And import album photos from directory "/2022/[2022.02.03] Rotation"
    And import album photos are taken by "5f26d84604f18f00186e4101"
    When POST /api/v1/gallery/albums/BaVRIkb/photos/imports
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | width     | height    | timestamp | color     | state   | md5       | takenBy.profileId        | directory                   | filename     |
      | undefined | undefined | undefined | undefined | created | undefined | 5f26d84604f18f00186e4101 | /2022/[2022.02.03] Rotation | IMG_3847.JPG |
      | undefined | undefined | undefined | undefined | created | undefined | 5f26d84604f18f00186e4101 | /2022/[2022.02.03] Rotation | IMG_4432.JPG |
