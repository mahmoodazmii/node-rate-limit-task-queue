// queueProcessor.js
const Queue = require("bull");
const queue = new Queue("tasks", "redis://localhost:6379");
const api = require("./api");

queue.process((job, done) => {
  console.log(`Processing task for user ${job.data.userId}`);
  api.task(job.data.userId);
  done();
});
