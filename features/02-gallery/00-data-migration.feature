@data_migration_gallery
Feature: Data migration - Gallery

  Scenario: Migrate gallery activity data
    Given request to worker url
    And user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, it
    When migrate data "GalleryActivity"
    Then data migration "GalleryActivity" should be success
