/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1889871825")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  custom_puzzles.id,\n  custom_puzzles.author,\n  COALESCE(users.username, 'Unknown User') AS author_name,\n  custom_puzzles.title,\n  custom_puzzles.puzzle,\n  custom_puzzles.public,\n  custom_puzzles.type,\n  custom_puzzles.created,\n  custom_puzzles.updated,\n  COALESCE(AVG(ratings.rating), 0) AS avg_rating,\n  IIF(\n    custom_puzzles.type = 'connections',\n    COALESCE(cl_counts.completions, 0),\n    IIF(\n      custom_puzzles.type = 'wordle',\n      COALESCE(wl_counts.completions, 0),\n      COALESCE(puzzle_stats.completions, 0)\n    )\n  ) AS completions\nFROM custom_puzzles\nLEFT JOIN ratings ON ratings.puzzle_id = custom_puzzles.id\nLEFT JOIN puzzle_stats ON puzzle_stats.id = custom_puzzles.id\nLEFT JOIN (\n  SELECT puzzle_id, COUNT(*) AS completions\n  FROM connections_leaderboard\n  GROUP BY puzzle_id\n) cl_counts ON cl_counts.puzzle_id = custom_puzzles.id\nLEFT JOIN (\n  SELECT puzzle_id, COUNT(*) AS completions\n  FROM wordle_leaderboard\n  GROUP BY puzzle_id\n) wl_counts ON wl_counts.puzzle_id = custom_puzzles.id\nLEFT JOIN users ON users.id = custom_puzzles.author\nGROUP BY custom_puzzles.id"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_BISq")

  // remove field
  collection.fields.removeById("_clone_9JK5")

  // remove field
  collection.fields.removeById("_clone_F5l0")

  // remove field
  collection.fields.removeById("_clone_b6eX")

  // remove field
  collection.fields.removeById("_clone_pR4D")

  // remove field
  collection.fields.removeById("_clone_Lt8Z")

  // remove field
  collection.fields.removeById("_clone_pqK7")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "help": "",
    "hidden": false,
    "id": "_clone_RzZM",
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
    "help": "",
    "hidden": false,
    "id": "_clone_CQNu",
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
    "help": "",
    "hidden": false,
    "id": "_clone_Dimf",
    "maxSize": 0,
    "name": "puzzle",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_TqR7",
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_pXPM",
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
      "connections",
      "wordle"
    ]
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "_clone_JbFH",
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
    "id": "_clone_i67M",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1889871825")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  custom_puzzles.id,\n  custom_puzzles.author,\n  COALESCE(users.username, 'Unknown User') AS author_name,\n  custom_puzzles.title,\n  custom_puzzles.puzzle,\n  custom_puzzles.public,\n  custom_puzzles.type,\n  custom_puzzles.created,\n  custom_puzzles.updated,\n  COALESCE(AVG(ratings.rating), 0) AS avg_rating,\n  IIF(custom_puzzles.type = 'connections', COALESCE(cl_counts.completions, 0), COALESCE(puzzle_stats.completions, 0)) AS completions\nFROM custom_puzzles\nLEFT JOIN ratings ON ratings.puzzle_id = custom_puzzles.id\nLEFT JOIN puzzle_stats ON puzzle_stats.id = custom_puzzles.id\nLEFT JOIN (\n  SELECT puzzle_id, COUNT(*) AS completions\n  FROM connections_leaderboard\n  GROUP BY puzzle_id\n) cl_counts ON cl_counts.puzzle_id = custom_puzzles.id\nLEFT JOIN users ON users.id = custom_puzzles.author\nGROUP BY custom_puzzles.id"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "help": "",
    "hidden": false,
    "id": "_clone_BISq",
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
    "help": "",
    "hidden": false,
    "id": "_clone_9JK5",
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
    "help": "",
    "hidden": false,
    "id": "_clone_F5l0",
    "maxSize": 0,
    "name": "puzzle",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_b6eX",
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "_clone_pR4D",
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
      "connections",
      "wordle"
    ]
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "_clone_Lt8Z",
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
    "id": "_clone_pqK7",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // remove field
  collection.fields.removeById("_clone_RzZM")

  // remove field
  collection.fields.removeById("_clone_CQNu")

  // remove field
  collection.fields.removeById("_clone_Dimf")

  // remove field
  collection.fields.removeById("_clone_TqR7")

  // remove field
  collection.fields.removeById("_clone_pXPM")

  // remove field
  collection.fields.removeById("_clone_JbFH")

  // remove field
  collection.fields.removeById("_clone_i67M")

  return app.save(collection)
})
