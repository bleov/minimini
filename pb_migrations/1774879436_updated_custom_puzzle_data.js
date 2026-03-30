/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1889871825")

  // update collection data
  unmarshal({
    "viewQuery": "SELECT\n  custom_puzzles.id,\n  custom_puzzles.author,\n  COALESCE(users.username, 'Unknown User') AS author_name,\n  custom_puzzles.title,\n  custom_puzzles.puzzle,\n  custom_puzzles.public,\n  custom_puzzles.type,\n  custom_puzzles.created,\n  custom_puzzles.updated,\n  COALESCE(AVG(ratings.rating), 0) AS avg_rating,\n  COALESCE(puzzle_stats.completions, 0) AS completions\nFROM custom_puzzles\nLEFT JOIN ratings ON ratings.puzzle_id = custom_puzzles.id\nLEFT JOIN puzzle_stats ON puzzle_stats.id = custom_puzzles.id\nLEFT JOIN users ON users.id = custom_puzzles.author\nGROUP BY custom_puzzles.id"
  }, collection)

  // remove field
  collection.fields.removeById("_clone_XZtI")

  // remove field
  collection.fields.removeById("_clone_BpDB")

  // remove field
  collection.fields.removeById("_clone_QRxL")

  // remove field
  collection.fields.removeById("_clone_VPJ8")

  // remove field
  collection.fields.removeById("_clone_5gVM")

  // remove field
  collection.fields.removeById("_clone_A5aO")

  // remove field
  collection.fields.removeById("_clone_YoEq")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_EwGM",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "author",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "json3133994713",
    "maxSize": 1,
    "name": "author_name",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_aHYq",
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
    "id": "_clone_TKtj",
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
    "id": "_clone_lQU6",
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "_clone_Lki7",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "mini",
      "midi",
      "daily"
    ]
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "_clone_SGpZ",
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
    "id": "_clone_GERz",
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
    "viewQuery": "SELECT\n  custom_puzzles.id,\n  custom_puzzles.author,\n  custom_puzzles.title,\n  custom_puzzles.puzzle,\n  custom_puzzles.public,\n  custom_puzzles.type,\n  custom_puzzles.created,\n  custom_puzzles.updated,\n  COALESCE(AVG(ratings.rating), 0) AS avg_rating,\n  COALESCE(puzzle_stats.completions, 0) AS completions\nFROM custom_puzzles\nLEFT JOIN ratings ON ratings.puzzle_id = custom_puzzles.id\nLEFT JOIN puzzle_stats ON puzzle_stats.id = custom_puzzles.id\nGROUP BY custom_puzzles.id"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "_clone_XZtI",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "author",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "_clone_BpDB",
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
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "_clone_QRxL",
    "maxSize": 0,
    "name": "puzzle",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "_clone_VPJ8",
    "name": "public",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "_clone_5gVM",
    "maxSelect": 1,
    "name": "type",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "mini",
      "midi",
      "daily"
    ]
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "_clone_A5aO",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "_clone_YoEq",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // remove field
  collection.fields.removeById("_clone_EwGM")

  // remove field
  collection.fields.removeById("json3133994713")

  // remove field
  collection.fields.removeById("_clone_aHYq")

  // remove field
  collection.fields.removeById("_clone_TKtj")

  // remove field
  collection.fields.removeById("_clone_lQU6")

  // remove field
  collection.fields.removeById("_clone_Lki7")

  // remove field
  collection.fields.removeById("_clone_SGpZ")

  // remove field
  collection.fields.removeById("_clone_GERz")

  return app.save(collection)
})
