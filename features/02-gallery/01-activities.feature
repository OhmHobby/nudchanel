@gallery_activities
Feature: Gallery activities

  @query
  Scenario: Query activities
    Given activities before "2020-07-01T08:00:00.000Z"
    And activities limit to 1
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                               | time                     | cover                                | coverUrl                                                                            |
      | xir-try | บรรยากาศ​วันเปิดหอพักนักเรียน​ ปีการศึกษาที่ 1/2563 | 2020-06-28T01:00:21.133Z | 779d2ab1-96e2-4a1b-81f3-1833440fee26 | https://photos.nudchannel.com/photos/cover/779d2ab1-96e2-4a1b-81f3-1833440fee26.jpg |

  @query
  Scenario: Query all activities
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And activities before "2020-07-01T08:00:00.000Z"
    And activities limit to 2
    And activities include unpublished
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | published | title                                               | time                     | cover                                | coverUrl                                                                            |
      | Ap1BSmg | false     | เปิดเรียนวันแรก                                     | 2020-07-01T00:00:54.817Z | c3d40b23-339a-4213-9cbd-c23dc8f8c08a | https://photos.nudchannel.com/photos/cover/c3d40b23-339a-4213-9cbd-c23dc8f8c08a.jpg |
      | xir-try | true      | บรรยากาศ​วันเปิดหอพักนักเรียน​ ปีการศึกษาที่ 1/2563 | 2020-06-28T01:00:21.133Z | 779d2ab1-96e2-4a1b-81f3-1833440fee26 | https://photos.nudchannel.com/photos/cover/779d2ab1-96e2-4a1b-81f3-1833440fee26.jpg |

  @query
  Scenario: Search all activities (unauthorized)
    Given activities before "2020-07-01T08:00:00.000Z"
    And activities limit to 2
    And activities include unpublished
    When GET /api/v1/gallery/activities
    Then HTTP response status should be BAD_REQUEST

  @query
  Scenario: Search activities
    Given activities before "2021-11-02T00:00:04.682Z"
    And activities limit to 2
    And activities search "ปัจฉิม"
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                    | time                     | cover                                | coverUrl                                                                            |
      | EiFyGSO | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2563 | 2021-03-03T06:00:20.675Z | 37d38066-12a1-44cb-af35-a55a36580157 | https://photos.nudchannel.com/photos/cover/37d38066-12a1-44cb-af35-a55a36580157.jpg |
      | a0iSxyq | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2562 | 2020-02-19T13:00:00.000Z | c04a84ce-9f33-467a-9f9f-f29fe5e76829 | https://photos.nudchannel.com/photos/cover/c04a84ce-9f33-467a-9f9f-f29fe5e76829.jpg |

  @query
  Scenario: Search activities with academic year
    Given activities before "2021-11-02T00:00:04.682Z"
    And activities limit to 10
    And activities year 2020
    And activities search "ปัจฉิม"
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                    | time                     | cover                                | coverUrl                                                                            |
      | EiFyGSO | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2563 | 2021-03-03T06:00:20.675Z | 37d38066-12a1-44cb-af35-a55a36580157 | https://photos.nudchannel.com/photos/cover/37d38066-12a1-44cb-af35-a55a36580157.jpg |

  @query
  Scenario: Search activities with album keyword
    Given activities before "2022-08-12T00:00:22.263Z"
    And activities limit to 10
    And activities search "บาสเกตบอล"
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                              | time                     | cover                                | coverUrl                                                                            |
      | KsUYTdP | กล้าเสลาเกมส์ ประจำปีการศึกษา 2565 | 2022-08-11T00:00:22.263Z | ccb3f745-c7a9-4803-ae83-9c375f183a65 | https://photos.nudchannel.com/photos/cover/ccb3f745-c7a9-4803-ae83-9c375f183a65.jpg |

  @query
  Scenario: Search activities with short keyword
    Given activities before "2021-11-02T00:00:04.682Z"
    And activities limit to 1
    And activities search "xy"
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                    | time                     | cover                                | coverUrl                                                                            |
      | EiFyGSO | โครงการปัจฉิมนิเทศ​ ประจำปีการศึกษา 2563 | 2021-03-03T06:00:20.675Z | 37d38066-12a1-44cb-af35-a55a36580157 | https://photos.nudchannel.com/photos/cover/37d38066-12a1-44cb-af35-a55a36580157.jpg |

  @query
  Scenario: Search activities large limit size
    Given activities before "2021-11-02T00:00:04.682Z"
    And activities limit to 1000
    When GET /api/v1/gallery/activities
    Then HTTP response status should be BAD_REQUEST

  @query
  Scenario: Get activity
    When GET /api/v1/gallery/activities/AINfyH5
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                         | time                     | cover                                | coverUrl                                                                            |
      | AINfyH5 | Audition Christmas Night Art & Music Festival | 2020-12-07T09:10:01.618Z | dd9d66ec-52db-4479-9149-fb0c3883bbce | https://photos.nudchannel.com/photos/cover/dd9d66ec-52db-4479-9149-fb0c3883bbce.jpg |
    And activity albums should be
      | id      | title                | cover                                | coverUrl                                                                            |
      | 0AZ7iw6 | Cover Dance Audition | 1e83a073-3709-4051-93fc-e92184739208 | https://photos.nudchannel.com/photos/cover/1e83a073-3709-4051-93fc-e92184739208.jpg |
      | PNBwEli | Music Band Audition  | d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819 | https://photos.nudchannel.com/photos/cover/d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819.jpg |
    And activity videos should be
      | title                          | url                          | cover                                                |
      | Cover Dance Audition 2020      | https://youtu.be/iAV_ID03AIk | https://i.ytimg.com/vi/iAV_ID03AIk/maxresdefault.jpg |
      | Music Band Audition 2020 (1/3) | https://youtu.be/7vW7wHDfAis | https://i.ytimg.com/vi/7vW7wHDfAis/maxresdefault.jpg |
      | Music Band Audition 2020 (2/3) | https://youtu.be/zVuMxpJPMFw | https://i.ytimg.com/vi/zVuMxpJPMFw/maxresdefault.jpg |
      | Music Band Audition 2020 (3/3) | https://youtu.be/Lm4iOuDAubs | https://i.ytimg.com/vi/Lm4iOuDAubs/maxresdefault.jpg |

  @query
  Scenario: Get academic year paginated activities (Date between)
    Given activities before "2022-08-11T00:00:22.263Z"
    And activities limit to 1
    And activities year 2022
    When GET /api/v1/gallery/activities
    Then HTTP response status should be OK
    And activities should be
      | id      | title                                                   | time                     | cover                                | coverUrl                                                                            |
      | 2oq_D97 | โครงการ 12 สิงหา พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง | 2022-08-08T00:00:39.500Z | 7b759c07-b51e-47bf-b0a4-23d8dd80c03f | https://photos.nudchannel.com/photos/cover/7b759c07-b51e-47bf-b0a4-23d8dd80c03f.jpg |

  @create
  Scenario: Create activity
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And activity title "Test E2E"
    And activity time "2025-01-15T17:00:00.000Z"
    And activity tags ["test", "created"]
    When POST /api/v1/gallery/activities
    Then HTTP response status should be CREATED
    And activities should be
      | title    | time                     | cover     | coverUrl                                                                            | published | publishedAt |
      | Test E2E | 2025-01-15T17:00:00.000Z | undefined | https://photos.nudchannel.com/photos/cover/00000000-0000-0000-0000-000000000000.jpg | false     | undefined   |

  @create
  @error
  Scenario: Create activity - Unauthorized
    Given activity title "Test E2E"
    And activity time "2025-01-15T17:00:00.000Z"
    And activity tags ["test", "created"]
    When POST /api/v1/gallery/activities
    Then HTTP response status should be UNAUTHORIZED

  @edit
  Scenario: Edit album - remove tags
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And activity title "February Februalove <3"
    And activity time "2020-02-11T19:00:00.000Z"
    And activity cover "e76d44e6-425e-4c2a-b817-eca25c54df6c"
    And activity published true
    When PUT /api/v1/gallery/activities/eriEKsP
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/gallery/activities/eriEKsP
    Then HTTP response status should be OK
    And activities should be
      | id      | title                  | time                     | cover                                | coverUrl                                                                            | published | tags |
      | eriEKsP | February Februalove <3 | 2020-02-11T19:00:00.000Z | e76d44e6-425e-4c2a-b817-eca25c54df6c | https://photos.nudchannel.com/photos/cover/e76d44e6-425e-4c2a-b817-eca25c54df6c.jpg | true      |      |

  @edit
  Scenario: Edit album - unpublished
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And activity title "February Februalove <3"
    And activity time "2020-02-11T19:00:00.000Z"
    And activity cover "e76d44e6-425e-4c2a-b817-eca25c54df6c"
    And activity tags ["วาเลนไทน์", "valentine"]
    And activity published false
    When PUT /api/v1/gallery/activities/eriEKsP
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/gallery/activities/eriEKsP
    Then HTTP response status should be OK
    And activities should be
      | id      | title                  | time                     | cover                                | coverUrl                                                                            | published | tags                |
      | eriEKsP | February Februalove <3 | 2020-02-11T19:00:00.000Z | e76d44e6-425e-4c2a-b817-eca25c54df6c | https://photos.nudchannel.com/photos/cover/e76d44e6-425e-4c2a-b817-eca25c54df6c.jpg | false     | วาเลนไทน์,valentine |
