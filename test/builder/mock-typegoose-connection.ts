export const mockTypegooseConnection = {
  collection: jest.fn().mockReturnValue({ insertOne: jest.fn() }),
  close: jest.fn(),
}
