/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/notifications/list", (e) => {
  let user = e.auth;
  if (!user) {
    return e.json(401, { error: "Unauthorized" });
  }

  var notifications = $app.findRecordsByFilter("notifications", "(recipients ?~ \"" + user.id + "\" || global = true) && seen ?!~ \"" + user.id + "\"", "-created", 20);
  var response = notifications.map((notification) => {
    return {
      id: notification.get("id"),
      title: notification.get("title"),
      body: notification.get("body"),
      created: notification.get("created")
    }
  })
  return e.json(200, response);
});

routerAdd("POST", "/api/notifications/{id}/read", (e) => {
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

  var seen = notification.get("seen") || [];
  if (!seen.includes(user.id)) {
    seen.push(user.id);
    notification.set("seen", seen);
    $app.save(notification);
  }

  return e.json(200, { success: true });
})

cronAdd("clean_notifications", "0 * * * *", () => {
  // remove non-global notifications seen by all recipients

  var notifications = $app.findRecordsByFilter("notifications", "global = false && seen != null && recipients != null && seen:length >= recipients:length");
  notifications.forEach((notification) => {
    $app.delete(notification);
  });
});
