@data_migration
Feature: Data migration

  Scenario: Migrate data
    Given request to worker url
    And user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, it
    When migrate data "ProfilePhoto"
    Then data migration "GalleryActivity" should be success
    And data migration "GalleryAlbum" should be success
    And data migration "GalleryYouTube" should be success
    And data migration "ProfilePhoto" should be success
