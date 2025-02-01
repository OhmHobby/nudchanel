@gallery_photos
@upload_photos
Feature: Gallery album photo upload

  Scenario: Prepare album
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E (upload)"
    And album upload directory "/2023/test"
    And album takenAfter "2023-12-01T17:00:00.000Z"
    And album takenBefore "2023-12-02T17:00:00.000Z"
    When PUT /api/v1/gallery/albums/obo2m_X
    Then HTTP response status should be NO_CONTENT

  Scenario: Upload album photo
    Given user profileId 5f26d84604f18f00186e4101
    And user groups nudch
    And upload file from "/2022/[2022.02.02] WebDev CI/IMG_2669.jpg"
    When POST /api/v1/gallery/albums/obo2m_X/photos/uploads
    Then HTTP response status should be CREATED
    And gallery album photos should contain
      | width     | height    | timestamp | color     | state   | md5                              | takenBy.profileId        | directory                  | filename     |
      | undefined | undefined | undefined | undefined | created | 5be8733fe975ea3ac49a81c37460ab9f | 5f26d84604f18f00186e4101 | /2023/test/(Erk) AnanyochS | IMG_2669.jpg |
    And upload file "/2023/test/(Erk) AnanyochS/IMG_2669.jpg" should be existed
