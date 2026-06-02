/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/today/mini", (e) => {
  const util = require(`${__hooks}/util.js`);

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", util.getTodayDateString());
    return e.json(200, record.get("mini"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
  }
});

routerAdd("GET", "/api/today/daily", (e) => {
  const util = require(`${__hooks}/util.js`);

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", util.getTodayDateString());
    return e.json(200, record.get("daily"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
  }
});

routerAdd("GET", "/api/today/midi", (e) => {
  const util = require(`${__hooks}/util.js`);

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", util.getTodayDateString());
    return e.json(200, record.get("midi"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
  }
});

routerAdd("GET", "/api/today/connections", (e) => {
  const util = require(`${__hooks}/util.js`);

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", util.getTodayDateString());
    return e.json(200, record.get("connections"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
  }
});

routerAdd("GET", "/api/today/wordle", (e) => {
  const util = require(`${__hooks}/util.js`);

  try {
    const record = $app.findFirstRecordByData("archive", "publication_date", util.getTodayDateString());
    return e.json(200, record.get("wordle"));
  } catch (err) {
    return e.json(404, { error: "Not Found" });
  }
});
