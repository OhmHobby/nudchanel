@photo_md5
Feature: Photo MD5

  Scenario Outline: MD5 <path>
    Given request to worker url
    And process photo path "<path>"
    When GET /photo-processor/md5
    Then HTTP response status should be OK
    And HTTP response text should be "<md5>"
    Examples:
      | path                                                         | md5                              |
      | webdav://2022/[2022.02.01] WebDev CI/Photo/JPEG/IMG_0399.jpg | 9c6f92dc3bfcb7e1a8b2cfc933558cf5 |
      | minio://original/IMG_0399.jpg                                | 9c6f92dc3bfcb7e1a8b2cfc933558cf5 |

  Scenario Outline: Error <description> - <path>
    Given request to worker url
    And process photo path "<path>"
    When GET /photo-processor/md5
    Then HTTP response status should be <status>
    Examples:
      | description    | path                                          | status      |
      | File not found | webdav://2022/null.jpg                        | NOT_FOUND   |
      | File not found | minio://original/null.jpg                     | NOT_FOUND   |
      | Not a file     | webdav://2022/[2022.02.04] Error              | NOT_FOUND   |
      | Not a file     | minio://original                              | NOT_FOUND   |
      | Zero bytes     | webdav://2022/[2022.02.04] Error/IMG_2001.jpg | BAD_REQUEST |
      | Zero bytes     | minio://original/IMG_2001.jpg                 | BAD_REQUEST |
      | File corrupts  | webdav://2022/[2022.02.04] Error/IMG_6490.jpg | OK          |
      | File corrupts  | minio://original/IMG_6490.jpg                 | OK          |
