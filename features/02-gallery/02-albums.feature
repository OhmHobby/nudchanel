@gallery_albums
Feature: Gallery albums

  @query
  Scenario: Query albums by activity
    Given activity id "AINfyH5"
    When GET /api/v1/gallery/albums
    Then HTTP response status should be OK
    And albums should be
      | id      | title                | cover                                | coverUrl                                                                            |
      | 0AZ7iw6 | Cover Dance Audition | 1e83a073-3709-4051-93fc-e92184739208 | https://photos.nudchannel.com/photos/cover/1e83a073-3709-4051-93fc-e92184739208.jpg |
      | PNBwEli | Music Band Audition  | d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819 | https://photos.nudchannel.com/photos/cover/d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819.jpg |

  @query
  Scenario: Query album by id
    When GET /api/v1/gallery/albums/0AZ7iw6
    Then HTTP response status should be OK
    And albums should be
      | id      | title                | cover                                | coverUrl                                                                            | uploadDirectory |
      | 0AZ7iw6 | Cover Dance Audition | 1e83a073-3709-4051-93fc-e92184739208 | https://photos.nudchannel.com/photos/cover/1e83a073-3709-4051-93fc-e92184739208.jpg | undefined       |
    And album activity should be
      | id      | title                                         | time                     | cover                                | coverUrl                                                                            |
      | AINfyH5 | Audition Christmas Night Art & Music Festival | 2020-12-07T09:10:01.618Z | dd9d66ec-52db-4479-9149-fb0c3883bbce | https://photos.nudchannel.com/photos/cover/dd9d66ec-52db-4479-9149-fb0c3883bbce.jpg |

  @query
  Scenario: Query album by id when signed in
    Given user profileId 5b794c41fd533e3b2f61cf05
    When GET /api/v1/gallery/albums/obo2m_X
    Then HTTP response status should be OK
    And albums should be
      | id      | title              | uploadDirectory                                       | watermarkPreset | takenAfter               | takenBefore              |
      | obo2m_X | Full Band Audition | /2023/[2023.12.04] Christmas Night Audition/Full Band | 01              | 2023-12-01T17:00:00.000Z | 2023-12-06T16:59:00.000Z |

  @create
  Scenario: Create album
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E"
    When POST /api/v1/gallery/albums?activityId=Ap1BSmg
    Then HTTP response status should be CREATED
    And albums should be
      | title    | cover     | coverUrl                                                                            | published | publishedAt | uploadDirectory | watermarkPreset | takenAfter | takenBefore |
      | Test E2E | undefined | https://photos.nudchannel.com/photos/cover/00000000-0000-0000-0000-000000000000.jpg | false     | undefined   | undefined       | undefined       | undefined  | undefined   |

  @create
  Scenario: Create album with upload info
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E (with upload)"
    And album upload directory "/2023/test"
    And album takenAfter "2023-12-01T17:00:00.000Z"
    And album takenBefore "2023-12-02T17:00:00.000Z"
    When POST /api/v1/gallery/albums?activityId=Ap1BSmg
    Then HTTP response status should be CREATED
    And albums should be
      | title                  | cover     | published | publishedAt | uploadDirectory | watermarkPreset | takenAfter               | takenBefore              |
      | Test E2E (with upload) | undefined | false     | undefined   | /2023/test      | undefined       | 2023-12-01T17:00:00.000Z | 2023-12-02T17:00:00.000Z |

  @create
  @error
  Scenario: Create album - missing activity id
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E"
    When POST /api/v1/gallery/albums
    Then HTTP response status should be BAD_REQUEST

  @create
  @error
  Scenario: Create album - malform directory
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E"
    And album upload directory "/test"
    When POST /api/v1/gallery/albums?activityId=Ap1BSmg
    Then HTTP response status should be BAD_REQUEST

  @create
  @error
  Scenario: Create album - too large upload range
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E"
    And album upload directory "/2023/test"
    And album takenAfter "2023-12-01T17:00:00.000Z"
    And album takenBefore "2023-12-02T18:00:00.000Z"
    When POST /api/v1/gallery/albums?activityId=Ap1BSmg
    Then HTTP response status should be BAD_REQUEST

  @create
  @error
  Scenario: Create album - unauthorized
    Given album title "Test E2E"
    When POST /api/v1/gallery/albums?activityId=Ap1BSmg
    Then HTTP response status should be UNAUTHORIZED

  @edit
  Scenario: Edit album
    Given user profileId 5b794c41fd533e3b2f61cf05
    And user groups nudch, pr
    And album title "Test E2E (edited)"
    When PUT /api/v1/gallery/albums/BaVRIkb
    Then HTTP response status should be NO_CONTENT
    When GET /api/v1/gallery/albums/BaVRIkb
    Then HTTP response status should be OK
    And albums should be
      | id      | title             | cover     | coverUrl                                                                            | published | uploadDirectory |
      | BaVRIkb | Test E2E (edited) | undefined | https://photos.nudchannel.com/photos/cover/00000000-0000-0000-0000-000000000000.jpg | false     | /webdev         |
