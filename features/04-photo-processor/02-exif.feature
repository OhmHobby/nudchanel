@photo_exif
Feature: Photo Exif

  Scenario Outline: Exif <path>
    Given request to worker url
    And process photo path "<path>"
    When GET /photo-processor/exif
    Then HTTP response status should be OK
    And photo width should be <width>
    And photo height should be <height>
    And photo taken date should be <date>
    And photo orientation should be <orientation>
    Examples:
      | path                                                         | width | height | date                     | orientation |
      | webdav://2022/[2022.02.01] WebDev CI/Photo/JPEG/IMG_0399.jpg | 6000  | 4000   | 2022-05-16T02:24:24.000Z |             |
      | minio://original/IMG_0399.jpg                                | 6000  | 4000   | 2022-05-16T02:24:24.000Z |             |
      | webdav://2022/[2022.02.02] WebDev CI/P1448472.jpeg           | 8368  | 5584   | 2022-06-05T10:39:35.000Z |             |
      | webdav://2022/[2022.02.03] Rotation/IMG_3847.JPG             | 6000  | 4000   | 2018-04-20T01:45:03.000Z | 1           |
      | minio://original/IMG_3847.JPG                                | 6000  | 4000   | 2018-04-20T01:45:03.000Z | 1           |
      | webdav://2022/[2022.02.03] Rotation/IMG_4432.JPG             | 4000  | 6000   | 2018-04-20T01:45:02.000Z | 8           |
      | minio://original/IMG_4432.JPG                                | 4000  | 6000   | 2018-04-20T01:45:02.000Z | 8           |
      | webdav://2022/[2022.02.01] WebDev CI/Photo/JPEG/IMG_3806.JPG | 4822  | 3215   | 2022-06-12T05:55:30.000Z |             |

      # Scenario Outline: Error <description> - <path>
      #   Given request to worker url
      #   And process photo path "<path>"
      #   When GET /photo-processor/md5
      #   Then HTTP response status should be <status>
      #   Examples:
      #     | description    | path                                          | status      |
      #     | File not found | webdav://2022/null.jpg                        | NOT_FOUND   |
      #     | File not found | minio://original/null.jpg                     | NOT_FOUND   |
      #     | Not a file     | webdav://2022/[2022.02.04] Error              | NOT_FOUND   |
      #     | Not a file     | minio://original                              | NOT_FOUND   |
      #     | Zero bytes     | webdav://2022/[2022.02.04] Error/IMG_2001.jpg | BAD_REQUEST |
      #     | Zero bytes     | minio://original/IMG_2001.jpg                 | BAD_REQUEST |
      #     | File corrupts  | webdav://2022/[2022.02.04] Error/IMG_6490.jpg | OK          |
      #     | File corrupts  | minio://original/IMG_6490.jpg                 | OK          |
