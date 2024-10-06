// api.js
const express = require("express");
const app = express();
const Redis = require("ioredis");
const redis = new Redis();
const Queue = require("bull");
const queue = new Queue("tasks", "redis://localhost:6379");
const fs = require("fs");
const path = require("path");

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const userId = req.headers["user-id"];
  const key = `rate-limit:${userId}`;
  redis.get(key, (err, count) => {
    if (err) return next(err);
    if (count >= 20) {
      return res.status(429).send("Too many requests");
    }
    redis.incr(key);
    redis.expire(key, 60); // expire in 1 minute
    next();
  });
};

// Queueing middleware
const queueTask = (req, res, next) => {
  const userId = req.headers["user-id"];
  const key = `queue:${userId}`;
  redis.get(key, (err, count) => {
    if (err) return next(err);
    if (count >= 1) {
      return res.status(429).send("Task is already being processed");
    }
    redis.incr(key);
    redis.expire(key, 1); // expire in 1 second
    queue.add({ userId });
    res.send("Task added to queue");
  });
};

// Task function
const task = async (userId) => {
  console.log(`${userId}-task completed at-${Date.now()}`);
  const logFile = path.join(__dirname, "logs", `${userId}.log`);
  fs.appendFile(
    logFile,
    `${userId}-task completed at-${Date.now()}\n`,
    (err) => {
      if (err) console.error(err);
    }
  );
};

app.use(express.json());
app.post("/tasks", rateLimit, queueTask);

app.listen(3000, () => {
  console.log("API listening on port 3000");
});
