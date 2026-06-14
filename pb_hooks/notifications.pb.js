/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/notifications/list", (e) => {
  let user = e.auth;
  if (!user) {
    return e.json(401, { error: "Unauthorized" });
  }

  var notifications = $app.findRecordsByFilter("notifications", `(recipients ?~ "${user.id}" || global = true) && cleared ?!~ "${user.id}"`, "-created", 20);
  var response = notifications.map((notification) => {
    return {
      global: notification.get("global"),
      id: notification.get("id"),
      title: notification.get("title"),
      body: notification.get("body"),
      unread: !(notification.get("viewed") || []).includes(user.id),
      created: notification.get("created")
    }
  })
  response = response.filter(n => {
    if (!n.global) return true;
    return new Date(n.created).getTime() > new Date(user.get("created")).getTime()
  })

  notifications.forEach((notification) => {
    notification.set("viewed", [...(notification.get("viewed") || []), user.id]);
    $app.save(notification);
  })

  return e.json(200, response);
});

routerAdd("GET", "/api/notifications/unread", (e) => {
  let user = e.auth;
  if (!user) {
    return e.json(401, { error: "Unauthorized" });
  }

  var notifications = $app.findRecordsByFilter("notifications", `(recipients ?~ "${user.id}" || global = true) && viewed ?!~ "${user.id}"`, "-created", 10);
  notifications = notifications.filter(n => !(n.get("global") && new Date(n.get("created")).getTime() < new Date(user.get("created")).getTime()))
  var response = notifications.length
  return e.json(200, response);
});

routerAdd("POST", "/api/notifications/{id}/clear", (e) => {
  let user = e.auth;
  if (!user) {
    return e.json(401, { error: "Unauthorized" });
  }

  const id = e.request.pathValue("id");
  var notification = $app.findRecordById("notifications", id);
  if (!notification) {
    return e.json(404, { error: "Notification not found" });
  }

  if (!notification.get("global")) {
    var recipients = notification.get("recipients") || [];
    if (!recipients.includes(user.id)) {
      return e.json(403, { error: "Forbidden" });
    }
  }

  var cleared = notification.get("cleared") || [];
  if (!cleared.includes(user.id)) {
    cleared.push(user.id);
    notification.set("cleared", cleared);
    $app.save(notification);
  }

  return e.json(200, { success: true });
})

cronAdd("clean_notifications", "0 * * * *", () => {
  // remove non-global notifications seen by all recipients

  var notifications = $app.findRecordsByFilter("notifications", "global = false && cleared != null && recipients != null && cleared:length >= recipients:length");
  notifications.forEach((notification) => {
    $app.delete(notification);
  });
});

onRecordAfterCreateSuccess((e) => {
  const record = e.record;
  if (!record) return;

  const util = require(`${__hooks}/util.js`);
  const notifications = $app.findCollectionByNameOrId("notifications");

  const userId = record.get("user");
  const type = record.get("type");
  const user = $app.findRecordById("users", userId);

  if (type === "custom") {
    // Custom crossword completed, notify author if completing user is the author's friend
    const puzzleId = record.get("puzzle_id");
    const puzzleData = $app.findRecordById("custom_puzzles", puzzleId);
    const author = $app.findRecordById("users", puzzleData.get("author"));
    const authorFriends = author.get("friends") ?? [];

    if (userId !== author.id && authorFriends.includes(userId)) {
      const notification = new Record(notifications);
      notification.set("title", `${user.get("username")} completed ${puzzleData.get("title")}`);
      notification.set("body", `in ${util.formatDuration(record.get("time"))}${record.get("hardcore") ? " (Hardcore)" : ""}${record.get("cheated") ? " (Autocheck)" : ""}`);
      notification.set("recipients", [author.id]);
      $app.save(notification);
    }
  }
}, "leaderboard");

onRecordAfterCreateSuccess((e) => {
  const record = e.record;
  if (!record) return;

  const util = require(`${__hooks}/util.js`);
  const notifications = $app.findCollectionByNameOrId("notifications");

  const userId = record.get("user");
  const user = $app.findRecordById("users", userId);
  const puzzleId = record.get("puzzle_id");

  if (puzzleId >= 100000000000000) { // custom puzzle IDs are 15 digits
    // Custom connections completed, notify author if completing user is the author's friend
    const puzzleData = $app.findRecordById("custom_puzzles", puzzleId);
    const author = $app.findRecordById("users", puzzleData.get("author"));
    const authorFriends = author.get("friends") ?? [];

    if (userId !== author.id && authorFriends.includes(userId)) {
      const notification = new Record(notifications);
      notification.set("title", `${user.get("username")} completed ${puzzleData.get("title")}`);
      notification.set("recipients", [author.id]);
      $app.save(notification);
    }
  }
}, "connections_leaderboard");
