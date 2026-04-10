/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/friends/from_code/{code}", (e) => {
  const friendCode = e.request.pathValue("code");

  try {
    const record = $app.findFirstRecordByData("users", "friend_code", friendCode);
    if (!record) {
      return e.json(204);
    }

    return e.json(200, { id: record.id, username: record.get("username") });
  } catch (err) {
    return e.json(204);
  }
});

routerAdd("GET", "/api/friends/suggestions", (e) => {
  let user = e.auth;
  if (!user) {
    return e.json(401, { error: "Unauthorized" });
  }
  $app.expandRecord(user, ["friends"], null);
  const friends = user.expandedAll("friends");
  const friendCounts = {};
  friends.forEach((friend) => {
    const friendsFriends = friend.friends || [];
    friendsFriends.forEach((ff) => {
      if (ff.id === user.id) return;
      if (friends.some((f) => f.id === ff.id)) return;
      friendCounts[ff.id] = (friendCounts[ff.id] || 0) + 1;
    });
  });
  const suggestions = Object.entries(friendCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return e.json(200, { suggestions });
});
