export class Saiko {
  private readonly DAYS = [
    {
      name: 'Saiko 罪子',
      img0: 'https://i.imgur.com/WqVJdDM.png',
      img1: 'https://i.imgur.com/Z4LODkU.jpg',
      color: 9964065,
    },
    {
      name: 'Nana 七七',
      img0: 'https://i.imgur.com/bgC47hT.png',
      img1: 'https://i.imgur.com/lHQESiF.png',
      color: 16775274,
    },
    {
      name: 'Saiko 災子',
      img0: 'https://i.imgur.com/P7Hvrq4.png',
      img1: 'https://i.imgur.com/sCtsmWc.jpg',
      color: 16214930,
    },
    {
      name: 'Saiko 骰子',
      img0: 'https://i.imgur.com/ltPgOgn.png',
      img1: 'https://i.imgur.com/69sib8R.jpg',
      color: 9688981,
    },
    {
      name: 'Saiko 祭子',
      img0: 'https://i.imgur.com/xrMWXD6.png',
      img1: 'https://i.imgur.com/nE2kFdW.jpg',
      color: 16744483,
    },
    {
      name: 'Saiko 才子',
      img0: 'https://i.imgur.com/OpWEDWS.png',
      img1: 'https://i.imgur.com/Hn8dVO9.jpg',
      color: 3850469,
    },
    {
      name: 'Saiko 斉子',
      img0: 'https://i.imgur.com/H72LOY1.png',
      img1: 'https://i.imgur.com/mY4W2cX.jpg',
      color: 11617201,
    },
  ]

  constructor(private dayNumber = new Date().getDay()) {}

  get name() {
    return this.DAYS[this.dayNumber].name
  }

  get avatarUrl() {
    return this.DAYS[this.dayNumber].img0
  }

  get color() {
    return this.DAYS[this.dayNumber].color
  }
}
