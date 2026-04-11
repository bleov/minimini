/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1889871825")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  base.id,\n  base.author,\n  base.author_name,\n  base.title,\n  base.puzzle,\n  base.public,\n  base.type,\n  base.created,\n  base.updated,\n  base.avg_rating,\n  base.completions\nFROM (\n  SELECT\n    custom_puzzles.id,\n    custom_puzzles.author,\n    COALESCE(users.username, 'Unknown User') AS author_name,\n    custom_puzzles.title,\n    custom_puzzles.puzzle,\n    custom_puzzles.public,\n    custom_puzzles.type,\n    custom_puzzles.created,\n    custom_puzzles.updated,\n    COALESCE(AVG(ratings.rating), 0) AS avg_rating,\n    CASE\n      WHEN custom_puzzles.type = 'connections' THEN COALESCE(cl_counts.completions, 0)\n      ELSE COALESCE(puzzle_stats.completions, 0)\n    END AS completions\n  FROM custom_puzzles\n  LEFT JOIN ratings ON ratings.puzzle_id = custom_puzzles.id\n  LEFT JOIN puzzle_stats ON puzzle_stats.id = custom_puzzles.id\n  LEFT JOIN (\n    SELECT puzzle_id, COUNT(*) AS completions\n    FROM connections_leaderboard\n    GROUP BY puzzle_id\n  ) cl_counts ON cl_counts.puzzle_id = custom_puzzles.id\n  LEFT JOIN users ON users.id = custom_puzzles.author\n  GROUP BY custom_puzzles.id\n) AS base"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_Z6MP")

  // remove field
  collection.fields.removeById("_clone_KRsP")

  // remove field
  collection.fields.removeById("_clone_GPLl")

  // remove field
  collection.fields.removeById("_clone_5l8y")

  // remove field
  collection.fields.removeById("_clone_M1Fr")

  // remove field
  collection.fields.removeById("_clone_Zwrw")

  // remove field
  collection.fields.removeById("_clone_qm2S")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "json3182418120",
    "maxSize": 1,
    "name": "author",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json724990059",
    "maxSize": 1,
    "name": "title",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json581361631",
    "maxSize": 1,
    "name": "puzzle",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json1001664029",
    "maxSize": 1,
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json2363381545",
    "maxSize": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json2990389176",
    "maxSize": 1,
    "name": "created",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json3332085495",
    "maxSize": 1,
    "name": "updated",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1889871825")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  custom_puzzles.id,\n  custom_puzzles.author,\n  COALESCE(users.username, 'Unknown User') AS author_name,\n  custom_puzzles.title,\n  custom_puzzles.puzzle,\n  custom_puzzles.public,\n  custom_puzzles.type,\n  custom_puzzles.created,\n  custom_puzzles.updated,\n  COALESCE(AVG(ratings.rating), 0) AS avg_rating,\n  COALESCE(puzzle_stats.completions, 0) AS completions\nFROM custom_puzzles\nLEFT JOIN ratings ON ratings.puzzle_id = custom_puzzles.id\nLEFT JOIN puzzle_stats ON puzzle_stats.id = custom_puzzles.id\nLEFT JOIN users ON users.id = custom_puzzles.author\nGROUP BY custom_puzzles.id"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_Z6MP",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "author",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_KRsP",
    "max": 0,
    "min": 0,
    "name": "title",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "_clone_GPLl",
    "maxSize": 0,
    "name": "puzzle",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "_clone_5l8y",
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "_clone_M1Fr",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "mini",
      "midi",
      "daily",
      "connections"
    ]
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "_clone_Zwrw",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "_clone_qm2S",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // remove field
  collection.fields.removeById("json3182418120")

  // remove field
  collection.fields.removeById("json724990059")

  // remove field
  collection.fields.removeById("json581361631")

  // remove field
  collection.fields.removeById("json1001664029")

  // remove field
  collection.fields.removeById("json2363381545")

  // remove field
  collection.fields.removeById("json2990389176")

  // remove field
  collection.fields.removeById("json3332085495")

  return app.save(collection)
})
