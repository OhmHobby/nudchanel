@profile_photo
Feature: Profile photo

  Scenario: Import from NAS
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups head
    And profile photo directory "/2022/[2022.02.01] WebDev CI/Photo/JPEG"
    And profile photo filename "IMG_3806.JPG"
    When PUT /api/v1/accounts/profiles/5b794c41fd533e3b2f61cf05/photos
    Then HTTP response status should be OK
    And profile photo id should be "c3b39436-926a-577e-a549-f9161e11c9d9"
