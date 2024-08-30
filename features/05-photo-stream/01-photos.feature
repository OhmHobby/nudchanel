@photo_stream
Feature: Photo stream

  Background:
    Given request to worker url
    And HTTP response type "blob"

  Scenario Outline: GET <photoSize> <fileName>
    When GET /photos/<photoSize>/<fileName>
    Then HTTP response status should be OK
    And HTTP response header "cache-control" should be "public, max-age=2592000, s-maxage=3600, stale-while-revalidate=86400"
    And HTTP response header "content-disposition" should be "inline;filename=<fileName>"
    And HTTP response header "content-type" should be "<contentType>"
    And photo imageSize should be <imageSize>
    Examples:
      | photoSize | fileName                                  | imageSize | contentType |
      | preview   | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.webp | 1440x2160 | image/webp  |
      | preview   | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg  | 1440x2160 | image/jpeg  |
      | card      | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg  | 320x480   | image/jpeg  |
      | cover     | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg  | 800x1200  | image/jpeg  |
      | thumbnail | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.webp | 147x220   | image/webp  |
      | thumbnail | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg  | 147x220   | image/jpeg  |

  Scenario Outline: GET <photoSize> <fileName> with etag <status>
    Given If none match "<requestEtag>"
    When GET /photos/<photoSize>/<fileName>
    Then HTTP response header "etag" should be "\"<responseEtag>\""
    And HTTP response status should be <status>
    And HTTP response size should be <fileSize>
    Examples:
      | photoSize | status       | fileName                                  | requestEtag                       | responseEtag                      | fileSize |
      | preview   | NOT_MODIFIED | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.webp | 1409e-qmwQLs/+3XoYGAupRefMLrTFNtM | 1409e-qmwQLs/+3XoYGAupRefMLrTFNtM | 0        |
      | preview   | NOT_MODIFIED | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg  | 3290b-nG1mEDF5E4qWJpSCcGlOdDWXPOo | 3290b-nG1mEDF5E4qWJpSCcGlOdDWXPOo | 0        |
      | preview   | OK           | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.webp |                                   | 1409e-qmwQLs/+3XoYGAupRefMLrTFNtM | 82078    |
      | preview   | OK           | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg  |                                   | 3290b-nG1mEDF5E4qWJpSCcGlOdDWXPOo | 207115   |

  Scenario: Download
    When GET /photos/download/0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg
    Then HTTP response status should be OK
    And HTTP response header "content-disposition" should be "attachment;filename=0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpg"
    And HTTP response header "content-type" should be "image/jpeg"
    And photo imageSize should be 1440x2160

  Scenario: GET <photoSize> <fileName>
    When GET /photos/<photoSize>/<fileName>
    Then HTTP response status should be <status>
    Examples:
      | photoSize | fileName                                  | status      |
      | preview   | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a6.webp | NOT_FOUND   |
      | preview   | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.jpeg | BAD_REQUEST |
      | download  | 0fbc4fe4-2a89-41c0-a7ba-4b231290e1a5.webp | BAD_REQUEST |
