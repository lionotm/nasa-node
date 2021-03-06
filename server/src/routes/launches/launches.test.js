const request = require('supertest')
const app = require('../../app')
const { loadPlanetsData } = require('../../models/planets.model')
const { mongoConnect, mongoDisconnect } = require('../../services/mongo')

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect()
    await loadPlanetsData()
  })

  afterAll(async () => {
    await mongoDisconnect()
  })

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200)
    })
  })

  describe('Test POST /launch', () => {
    const completeLaunchData = {
      mission: 'Enterprise',
      rocket: 'NCC 1431-A',
      target: 'Kepler-62 f',
      launchDate: 'March 12, 2030',
    }

    const LaunchDataWithoutDate = {
      mission: 'Enterprise',
      rocket: 'NCC 1431-A',
      target: 'Kepler-62 f',
    }
    const LaunchDataWithInvalidDate = {
      mission: 'Enterprise',
      rocket: 'NCC 1431-A',
      target: 'Kepler-62 f',
      launchDate: 'tucker',
    }

    test('It should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201)

      const requestDate = new Date(completeLaunchData.launchDate).valueOf()
      const responseDate = new Date(response.body.launchDate).valueOf()
      expect(responseDate).toBe(requestDate)

      expect(response.body).toMatchObject(LaunchDataWithoutDate)
    })

    test('It should catch missing required properties', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(LaunchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toStrictEqual({
        error: 'Missing required launch fields',
      })
    })

    test('It should catch invalid dates', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(LaunchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      })
    })
  })
})
