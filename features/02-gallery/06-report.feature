@gallery_reports
Feature: gallery report
    Scenario: create gallery report from user
        Given user profileId 5b794c41fd533e3b2f61cf05
        And create gallery report with title "Test report"
        And create gallery report with description "Test report description"
        And create gallery report with photoId "4e29faae-be60-437e-aac5-b312ba9fdd7e"
        When POST /api/v1/gallery/reports
        Then HTTP response status should be CREATED
        And gallery report must contain
            | title       | description             | photoId                              | reportById                           |
            | Test report | Test report description | 4e29faae-be60-437e-aac5-b312ba9fdd7e | 5b794c41-fd53-8000-803e-3b2f61cf0500 |