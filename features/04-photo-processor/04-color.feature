@photo_color
Feature: Photo color

  Background:
    Given request to worker url

  Scenario Outline: Color <path> (<scription>)
    Given process photo path "<path>"
    When GET /photo-processor/color
    Then HTTP response status should be OK
    And HTTP response text should be "<color>"
    Examples:
      | path                                               | color   | description    |
      | webdav://2022/[2022.02.02] WebDev CI/IMG_2669.jpg  | #9f5827 | dominant color |
      | minio://original/IMG_2669.jpg                      | #9f5827 | dominant color |
      | webdav://2022/[2022.02.02] WebDev CI/TOPP-9299.jpg | #938b82 | large file     |
      | minio://original/TOPP-9299.jpg                     | #938b82 | large file     |

  Scenario Outline: Error <description> - <path>
    Given process photo path "<path>"
    When GET /photo-processor/color
    Then HTTP response status should be <status>
    Examples:
      | description    | path                                          | status                |
      | File not found | webdav://2022/null.jpg                        | NOT_FOUND             |
      | File not found | minio://original/null.jpg                     | NOT_FOUND             |
      | Not a file     | webdav://2022/[2022.02.04] Error              | NOT_FOUND             |
      | Not a file     | minio://original                              | NOT_FOUND             |
      | Zero bytes     | webdav://2022/[2022.02.04] Error/IMG_2001.jpg | BAD_REQUEST           |
      | Zero bytes     | minio://original/IMG_2001.jpg                 | BAD_REQUEST           |
      | File corrupts  | webdav://2022/[2022.02.04] Error/IMG_6490.jpg | INTERNAL_SERVER_ERROR |
      | File corrupts  | minio://original/IMG_6490.jpg                 | INTERNAL_SERVER_ERROR |
