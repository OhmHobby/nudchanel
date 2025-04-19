@recruit
@recruit_form
Feature: Recruit forms

  Scenario: Get form collection
    Given user profileId 61e308efa4d9680019bc343c
    When GET /api/v1/recruit/forms/collections/018ff83a-ef38-71b9-a31e-31d1369d8c89
    Then HTTP response status should be OK
    And recruit collection title should be "คำถามส่วนกลาง (stg)"
    And recruit collection isCompleted should be "true"
    And recruit collection questions should be
      | id                                   | input    | rank | answer | question                                                |
      | 0190f4b3-51d8-70be-a31c-321ce2abe712 | textarea | 0    | xxx    | รู้จักฝ่ายโสตได้อย่างไร                                 |
      | 0190f4b3-51d8-7cf1-95d7-f4bd57904e27 | textarea | 1    | xxx    | อยากเข้าฝ่ายโสตเพราะอะไร                                |
      | 0190f4b3-51d8-7da6-94a5-bd14183b242d | textarea | 2    | xxx    | เลือกวิจารณ์ผลงานของฝ่ายโสตมา 1 อย่าง                   |
      | 0190f4b3-51d8-7e79-83b8-26d1b934f5ea | textarea | 3    | xxx    | อะไรคือสิ่งที่คาดหวังว่าจะได้รับเมื่อเข้ามาทำงานฝ่ายโสต |
      | 0190f4b3-51d8-7270-bada-b0c2de2e806b | textarea | 4    | xxx    | คิดว่าจะนำประสบการณ์ที่ได้ไปต่อยอดอย่างไร               |
      | 0190f4b3-51d8-74e8-b28b-2727036de226 | textarea | 5    | xxx    | มีอะไรอยากพี่ๆ                                          |

  Scenario: Get form collection - without answer
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/recruit/forms/collections/018ff83a-ef38-71b9-a31e-31d1369d8c89
    Then HTTP response status should be OK
    And recruit collection title should be "คำถามส่วนกลาง (stg)"
    And recruit collection isCompleted should be "false"
    And recruit collection questions should be
      | id                                   | input    | rank | answer | question                                                |
      | 0190f4b3-51d8-70be-a31c-321ce2abe712 | textarea | 0    | null   | รู้จักฝ่ายโสตได้อย่างไร                                 |
      | 0190f4b3-51d8-7cf1-95d7-f4bd57904e27 | textarea | 1    | null   | อยากเข้าฝ่ายโสตเพราะอะไร                                |
      | 0190f4b3-51d8-7da6-94a5-bd14183b242d | textarea | 2    | null   | เลือกวิจารณ์ผลงานของฝ่ายโสตมา 1 อย่าง                   |
      | 0190f4b3-51d8-7e79-83b8-26d1b934f5ea | textarea | 3    | null   | อะไรคือสิ่งที่คาดหวังว่าจะได้รับเมื่อเข้ามาทำงานฝ่ายโสต |
      | 0190f4b3-51d8-7270-bada-b0c2de2e806b | textarea | 4    | null   | คิดว่าจะนำประสบการณ์ที่ได้ไปต่อยอดอย่างไร               |
      | 0190f4b3-51d8-74e8-b28b-2727036de226 | textarea | 5    | null   | มีอะไรอยากพี่ๆ                                          |

  Scenario: Get form collection - peak other applicant response
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/recruit/forms/collections/018ff83a-ef38-71b9-a31e-31d1369d8c89?applicantId=0190f4a5-76f8-7328-9b2d-769e7cc88bbe
    Then HTTP response status should be BAD_REQUEST

  Scenario: Get form collection - see applicant response
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch
    When GET /api/v1/recruit/forms/collections/018ff83a-ef38-71b9-a31e-31d1369d8c89?applicantId=0190f4a5-76f8-7328-9b2d-769e7cc88bbe
    Then HTTP response status should be OK
    And recruit collection questions should be
      | id                                   | input    | rank | answer | question                                                |
      | 0190f4b3-51d8-70be-a31c-321ce2abe712 | textarea | 0    | xxx    | รู้จักฝ่ายโสตได้อย่างไร                                 |
      | 0190f4b3-51d8-7cf1-95d7-f4bd57904e27 | textarea | 1    | xxx    | อยากเข้าฝ่ายโสตเพราะอะไร                                |
      | 0190f4b3-51d8-7da6-94a5-bd14183b242d | textarea | 2    | xxx    | เลือกวิจารณ์ผลงานของฝ่ายโสตมา 1 อย่าง                   |
      | 0190f4b3-51d8-7e79-83b8-26d1b934f5ea | textarea | 3    | xxx    | อะไรคือสิ่งที่คาดหวังว่าจะได้รับเมื่อเข้ามาทำงานฝ่ายโสต |
      | 0190f4b3-51d8-7270-bada-b0c2de2e806b | textarea | 4    | xxx    | คิดว่าจะนำประสบการณ์ที่ได้ไปต่อยอดอย่างไร               |
      | 0190f4b3-51d8-74e8-b28b-2727036de226 | textarea | 5    | xxx    | มีอะไรอยากพี่ๆ                                          |

  Scenario: Get form collection - no permission to see applicant response
    Given user profileId 61e308efa4d9680019bc343c
    And user groups nudch
    When GET /api/v1/recruit/forms/collections/018ff83a-ef38-71b9-a31e-31d1369d8c89?applicantId=0190f4a5-76f8-7328-9b2d-769e7cc88bbe
    Then HTTP response status should be FORBIDDEN
