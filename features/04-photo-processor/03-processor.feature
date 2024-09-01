@photo_processor
Feature: Photo processor

  Background:
    Given request to worker url

  Scenario Outline: Etag <path> to <format>
    Given process photo path "<path>"
    And process photo format "<format>"
    And If none match <etag>
    And HTTP response type "blob"
    When GET /photo-processor/process
    Then ETag should be <etag>
    And HTTP response status should be <status>
    And HTTP response size should be 0
    Examples:
      | format | path                                              | status       | etag                                 |
      | jpeg   | webdav://2022/[2022.02.02] WebDev CI/IMG_2669.jpg | NOT_MODIFIED | "741a13-7+KjvuwsjMuTx4/k7euzjmm/eO4" |
      | jpeg   | minio://original/IMG_2669.jpg                     | NOT_MODIFIED | "741a13-7+KjvuwsjMuTx4/k7euzjmm/eO4" |

  Scenario Outline: Resize <path> to <format>
    Given process photo path "<path>"
    And process photo format "<format>"
    And process photo width "<width>"
    And process photo height "<height>"
    And process photo quality "<quality>"
    And process photo fit "<fit>"
    And HTTP response type "blob"
    When GET /photo-processor/process
    Then HTTP response status should be <status>
    And HTTP response size should be <size>
    And ETag should be <etag>
    Examples:
      | format | path                                              | width | height | quality | fit    | status | size  | etag                               |
      | jpeg   | webdav://2022/[2022.02.02] WebDev CI/IMG_2669.jpg | 800   | 600    | 80      | inside | OK     | 47430 | "b946-ACXjNdy0khu/KHu/+eKLlzJZg50" |
      | jpeg   | minio://original/IMG_2669.jpg                     | 800   | 600    | 80      | inside | OK     | 47430 | "b946-ACXjNdy0khu/KHu/+eKLlzJZg50" |

  Scenario: Watermark <path> to <format>
    Given process photo path "<path>"
    And process photo format "<format>"
    And process photo width "<width>"
    And process photo height "<height>"
    And process photo quality "<quality>"
    And process photo fit "<fit>"
    And process photo watermark "<watermark>"
    And HTTP response type "blob"
    When GET /photo-processor/process
    Then HTTP response status should be <status>
    And HTTP response size should be <size>
    And ETag should be <etag>
    Examples:
      | format | path                                               | width | height | quality | fit    | watermark | status | size   | etag                                |
      | webp   | webdav://2022/[2022.02.02] WebDev CI/P1448472.jpeg | 800   | 600    | 80      | inside | 01        | OK     | 116688 | "1c7d0-NVwY6NKqmib7RqiWcgssydd6zaE" |
      | webp   | webdav://2022/[2022.02.03] Rotation/IMG_4432.JPG   | 800   | 600    | 80      | inside | 01        | OK     | 21490  | "53f2-YEpEI9Sd1+Rht7bwt1En+dhUhvM"  |

  Scenario Outline: Resize profile (cover) <path>
    Given process photo path "<path>"
    And process photo format "webp"
    And process photo width "256"
    And process photo height "256"
    And process photo fit "cover"
    And process photo height ratio "0.1"
    And HTTP response type "blob"
    When GET /photo-processor/process
    Then HTTP response status should be OK
    And photo imageSize should be 256x256
    And ETag should be <etag>
    Examples:
      | path                                              | etag                              |
      | webdav://2022/[2022.03.01] Team/IMG_8800_Khim.jpg | "ee0-HtAxiGI1seSfYdwMX9luItUCOvw" |
      | webdav://2022/[2022.03.01] Team/TOPP-0746.jpg     | "dda-lpg3hje9jyQQBhxnEOvsRf2byp8" |

  Scenario: Error <description> - <status> <path>
    Given process photo path "<path>"
    And process photo format "<format>"
    And HTTP response type "blob"
    When GET /photo-processor/process
    Then HTTP response status should be <status>
    Examples:
      | path                                              | status                | format | description     |
      | webdav://2022/null.jpg                            | NOT_FOUND             | jpeg   | File not found  |
      | minio://original/null.jpg                         | NOT_FOUND             | jpeg   | File not found  |
      | webdav://2022/[2022.02.04] Error                  | NOT_FOUND             | jpeg   | Not a file      |
      | minio://original                                  | NOT_FOUND             | jpeg   | Not a file      |
      | webdav://2022/[2022.02.04] Error/IMG_2001.jpg     | BAD_REQUEST           | jpeg   | Zero bytes      |
      | minio://original/IMG_2001.jpg                     | BAD_REQUEST           | jpeg   | Zero bytes      |
      | webdav://2022/[2022.02.04] Error/IMG_6490.jpg     | INTERNAL_SERVER_ERROR | jpeg   | File corrupts   |
      | minio://original/IMG_6490.jpg                     | INTERNAL_SERVER_ERROR | jpeg   | File corrupts   |
      | webdav://2022/[2022.02.02] WebDev CI/IMG_2669.jpg | BAD_REQUEST           |        | Invalid request |
      | minio://original/IMG_6490.jpg                     | BAD_REQUEST           |        | Invalid request |
