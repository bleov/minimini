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

routerAdd("GET", "/api/friends/mutual", (e) => {
  let user = e.auth;
  if (!user) {
    return e.json(401, { error: "Unauthorized" });
  }

  const result = arrayOf(
    new DynamicModel({
      id: "",
      username: "",
      mutual: ""
    })
  );

  const query = $app.db().newQuery(`SELECT DISTINCT
    fof.id,
    fof.username,
    GROUP_CONCAT(df.username, ', ') AS mutual
FROM
    users u
    JOIN json_each(u.friends) AS f1 ON 1=1
    JOIN users df ON df.id = f1.value
    JOIN json_each(df.friends) AS f2 ON 1=1
    JOIN users fof ON fof.id = f2.value
WHERE
    u.id = {:userId}
    AND fof.id != u.id
    AND fof.id NOT IN (
        SELECT f.value
        FROM json_each(u.friends) AS f
    )
GROUP BY fof.id, fof.username`);

  query.bind({ userId: user.id });
  query.all(result);

  const response = result
    .map((entry) => {
      return {
        id: entry.id,
        username: entry.username,
        mutual: entry.mutual ? entry.mutual.split(", ") : []
      };
    })
    .sort((a, b) => b.mutual.length - a.mutual.length)
    .filter((entry) => entry.mutual.length > 1);

  return e.json(200, { result: response });
});
