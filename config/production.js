module.exports = {
  dbConfig: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: "device-integration_nokia_mariadb_1",
    dialect: "mysql"
  },
  sensor_to_fhir: {
    URL: "http://sensor-fhir-converter_webapp-queue_1:3002"
  },
  message_queue: {
    ACTIVE: true,
    HOST: "sensor-fhir-converter_rabbit_1",
    NAME: "device-integration_nokia-sensor-fhir-converter"
  }
}
