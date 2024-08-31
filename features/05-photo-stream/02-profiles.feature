@photo_stream_profile
Feature: Photo stream profiles

  Background:
    Given request to worker url
    And HTTP response type "blob"

  Scenario Outline: GET <fileName>
    When GET /photos/profiles/<fileName>
    Then HTTP response status should be OK
    And HTTP response header "cache-control" should be "public, max-age=2592000, s-maxage=3600, stale-while-revalidate=86400"
    And HTTP response header "content-disposition" should be "inline;filename=<fileName>"
    And HTTP response header "content-type" should be "<contentType>"
    And photo imageSize should be <imageSize>
    Examples:
      | fileName                                  | imageSize | contentType |
      | 00000000-0000-0000-0000-000000000000.webp | 256x256   | image/webp  |
      | 00000000-0000-0000-0000-000000000000.jpg  | 128x128   | image/jpeg  |
      | 00000000-0000-0000-0000-000000000000.png  | 512x512   | image/png   |

  Scenario: Get avatar
    When GET /photos/avatar/a8b057c25f8e34b2c5a371252b25411a75150992f76f62716b8b23ce00d852e3
    Then HTTP response status should be OK
    And HTTP response header "content-disposition" should be "inline;filename=a8b057c25f8e34b2c5a371252b25411a75150992f76f62716b8b23ce00d852e3.jpeg"
    And HTTP response header "content-type" should be "image/jpeg"
    And photo imageSize should be 80x80
