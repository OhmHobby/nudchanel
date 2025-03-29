@gallery_reports
Feature: gallery report

  Scenario: create gallery report from user
    Given user profileId 5b794c41fd533e3b2f61cf05
    And create gallery report with reason "Photo included me"
    And create gallery report with photoId "4e29faae-be60-437e-aac5-b312ba9fdd7e"
    And create gallery report with albumId "cc7600d9-e2f2-4f6f-bad1-ff51fabe70b3"
    And create gallery report with email "1@nudch.com"
    When POST /api/v1/gallery/reports
    Then HTTP response status should be CREATED
    And gallery report must contain
      | reason            | photoId                              | albumId                              |
      | Photo included me | 4e29faae-be60-437e-aac5-b312ba9fdd7e | cc7600d9-e2f2-4f6f-bad1-ff51fabe70b3 |
