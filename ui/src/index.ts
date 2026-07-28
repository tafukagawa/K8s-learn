import { createApp } from './app'

const PORT = Number(process.env.PORT ?? 3001)
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://k8s-learning-app-api'

const app = createApp(API_BASE_URL)

app.listen(PORT, () => {
  console.log(`k8s-learning-app-ui listening on port ${PORT}`)
})
