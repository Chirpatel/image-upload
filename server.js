const express = require("express");
const app = express();
const cors = require("cors")

app.use(cors({credentials: true, origin: true}));
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.json({ extend: false }));
app.get("/", function(req, res, next) {
  res.json({ message: "alive" });
});

app.use("/image", require("./routes/saveImage"));
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
