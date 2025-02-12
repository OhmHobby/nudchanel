@gallery_photos
@upload_photos
Feature: Gallery album photo upload

  Scenario: Prepare album
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E (upload)"
    And album upload directory "/2023/test"
    And album takenAfter "2022-05-29T00:00:00.000+0700"
    And album takenBefore "2022-05-30T00:00:00.000+0700"
    And album watermarkPreset "01"
    When PUT /api/v1/gallery/albums/obo2m_X
    Then HTTP response status should be NO_CONTENT

  @success
  Scenario: Upload album photo
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    And upload file from "/2022/[2022.02.02] WebDev CI/IMG_2669.jpg"
    When upload gallery album "obo2m_X" photo
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | state   | width     | height    | timestamp | color     | md5                              | takenBy.profileId        | directory                  | filename     |
      | created | undefined | undefined | undefined | undefined | 5be8733fe975ea3ac49a81c37460ab9f | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_2669.jpg |
    And upload file "/2023/test/(Erk) AnanyochS/IMG_2669.jpg" should be existed
    When wait for current gallery upload photo to be "processed" state
    Then gallery album photos should contain
      | state     | width | height | timestamp                | color   | md5                              | takenBy.profileId        | directory                  | filename     |
      | processed | 6000  | 4000   | 2022-05-29T01:29:51.000Z | #9f5827 | 5be8733fe975ea3ac49a81c37460ab9f | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_2669.jpg |
    And uploaded gallery photo photo processed size "preview" should have md5 "378f197b08d9980e1763000fbb77baf0"
    And uploaded gallery photo photo processed size "thumbnail" should have md5 "41cf2f2f1dc5c4ab2babcdeb930d7f97"

  @success
  Scenario: Upload duplicated album photo (accept recent upload)
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    And upload file from "/2022/[2022.02.02] WebDev CI/IMG_2669.jpg"
    When upload gallery album "obo2m_X" photo
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | width     | height    | timestamp | color     | state   | md5                              | takenBy.profileId        | directory                  | filename     |
      | undefined | undefined | undefined | undefined | created | 5be8733fe975ea3ac49a81c37460ab9f | 5b794c41fd533e3b2f61cf05 | /2023/test/(Arm) NattawatJ | IMG_2669.jpg |
    And upload file "/2023/test/(Arm) NattawatJ/IMG_2669.jpg" should be existed
    When wait for current gallery upload photo to be "processed" state
    Then gallery album photos should contain
      | state     | width | height | timestamp                | color   | md5                              | takenBy.profileId        | directory                  | filename     |
      | processed | 6000  | 4000   | 2022-05-29T01:29:51.000Z | #9f5827 | 5be8733fe975ea3ac49a81c37460ab9f | 5b794c41fd533e3b2f61cf05 | /2023/test/(Arm) NattawatJ | IMG_2669.jpg |
    And uploaded gallery photo photo processed size "preview" should have md5 "378f197b08d9980e1763000fbb77baf0"
    And uploaded gallery photo photo processed size "thumbnail" should have md5 "41cf2f2f1dc5c4ab2babcdeb930d7f97"

  @success
  Scenario: Get photo contributors
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    When GET /api/v1/gallery/albums/obo2m_X/photos/uploads?takenBy=5b794c41fd533e3b2f61cf05
    Then HTTP response status should be OK
    And gallery album photo contributors should contain
      | profileId                | firstname | lastname      |
      | 5f26d84604f18f00186e4101 | Ananyoch  | Sinananwanich |
      | 5b794c41fd533e3b2f61cf05 | Nattawat  | Jamlongrad    |

  @reject
  Scenario: Early duplicated upload should be rejected
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    When GET /api/v1/gallery/albums/obo2m_X/photos/uploads
    Then HTTP response status should be OK
    And gallery album photos should contain
      | state    | rejectReason | width | height | timestamp                | md5                              | takenBy.profileId        | directory                  | filename     |
      | rejected | duplicated   | 6000  | 4000   | 2022-05-29T01:29:51.000Z | 5be8733fe975ea3ac49a81c37460ab9f | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_2669.jpg |

  @reject
  Scenario: Upload album photo - low resolution
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    And upload file from "/2022/[2022.01.31] WebDev TEST/Photo/JPEG/Watermark/P8020704.jpg"
    When upload gallery album "obo2m_X" photo
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | state   | width     | height    | timestamp | color     | md5                              | takenBy.profileId        | directory                  | filename     |
      | created | undefined | undefined | undefined | undefined | 82c86348eefafbaf6979058edeb6a0d7 | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | P8020704.jpg |
    And upload file "/2023/test/(Erk) AnanyochS/P8020704.jpg" should be existed
    When wait for current gallery upload photo to be "rejected" state
    Then gallery album photos should contain
      | state    | rejectReason | width | height | timestamp                | md5                              | takenBy.profileId        | directory                  | filename     |
      | rejected | resolution   | 884   | 2048   | 1970-01-01T00:00:00.000Z | 82c86348eefafbaf6979058edeb6a0d7 | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | P8020704.jpg |

  @reject
  Scenario: Upload album photo - invalid timestamp
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    And upload file from "/2022/[2022.02.02] WebDev CI/P1448472.jpeg"
    When upload gallery album "obo2m_X" photo
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | state   | width     | height    | timestamp | color     | md5                              | takenBy.profileId        | directory                  | filename      |
      | created | undefined | undefined | undefined | undefined | c31b2a0100848dd00755378c5622520d | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | P1448472.jpeg |
    And upload file "/2023/test/(Erk) AnanyochS/P1448472.jpeg" should be existed
    When wait for current gallery upload photo to be "rejected" state
    Then gallery album photos should contain
      | state    | rejectReason | width | height | timestamp                | md5                              | takenBy.profileId        | directory                  | filename      |
      | rejected | timestamp    | 8368  | 5584   | 2022-06-05T10:39:35.000Z | c31b2a0100848dd00755378c5622520d | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | P1448472.jpeg |

  @error
  Scenario: Upload album photo - corrupt file
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    And upload file from "/2022/[2022.02.04] Error/IMG_6490.jpg"
    When upload gallery album "obo2m_X" photo
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | state   | width     | height    | timestamp | color     | md5                              | takenBy.profileId        | directory                  | filename     |
      | created | undefined | undefined | undefined | undefined | ae63b21eef85f6a315fbd284134d095e | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_6490.jpg |
    And upload file "/2023/test/(Erk) AnanyochS/IMG_6490.jpg" should be existed
    When wait for current gallery upload photo to be "failed" state
    Then gallery album photos should contain
      | state  | errorMessage                          | width     | height    | timestamp | md5                              | takenBy.profileId        | directory                  | filename     |
      | failed | VipsJpeg: Premature end of input file | undefined | undefined | undefined | ae63b21eef85f6a315fbd284134d095e | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_6490.jpg |

  @error
  Scenario: Upload album photo - 0 bytes file
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    And upload file from "/2022/[2022.02.04] Error/IMG_2001.jpg"
    When upload gallery album "obo2m_X" photo
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | state   | width     | height    | timestamp | color     | md5                              | takenBy.profileId        | directory                  | filename     |
      | created | undefined | undefined | undefined | undefined | d41d8cd98f00b204e9800998ecf8427e | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_2001.jpg |
    And upload file "/2023/test/(Erk) AnanyochS/IMG_2001.jpg" should be existed
    When wait for current gallery upload photo to be "failed" state
    Then gallery album photos should contain
      | state  | errorMessage | width     | height    | timestamp | md5                              | takenBy.profileId        | directory                  | filename     |
      | failed | No data      | undefined | undefined | undefined | d41d8cd98f00b204e9800998ecf8427e | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_2001.jpg |
