@gallery_albums
Feature: Gallery albums

  Scenario: Query albums by activity
    Given activity id "AINfyH5"
    When GET /api/v1/gallery/albums
    Then HTTP response status should be OK
    And albums should be
      | id      | title                | cover                                | coverUrl                                                                            |
      | 0AZ7iw6 | Cover Dance Audition | 1e83a073-3709-4051-93fc-e92184739208 | https://photos.nudchannel.com/photos/cover/1e83a073-3709-4051-93fc-e92184739208.jpg |
      | PNBwEli | Music Band Audition  | d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819 | https://photos.nudchannel.com/photos/cover/d98a9bb3-2895-4f2f-9c3d-f39a1f2c8819.jpg |

  Scenario: Query album by id
    When GET /api/v1/gallery/albums/0AZ7iw6
    Then HTTP response status should be OK
    And albums should be
      | id      | title                | cover                                | coverUrl                                                                            |
      | 0AZ7iw6 | Cover Dance Audition | 1e83a073-3709-4051-93fc-e92184739208 | https://photos.nudchannel.com/photos/cover/1e83a073-3709-4051-93fc-e92184739208.jpg |
    And album activity should be
      | id      | title                                         | time          | cover                                | coverUrl                                                                            |
      | AINfyH5 | Audition Christmas Night Art & Music Festival | 1607332201618 | dd9d66ec-52db-4479-9149-fb0c3883bbce | https://photos.nudchannel.com/photos/cover/dd9d66ec-52db-4479-9149-fb0c3883bbce.jpg |
