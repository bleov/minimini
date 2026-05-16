/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)",
      "CREATE INDEX `idx_c7v9wzr8p3` ON `archive` (\n  `mini_id`,\n  `daily_id`,\n  `midi_id`,\n  `connections_id`,\n  `wordle_id`,\n  `publication_date`\n)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "json1612619704",
    "maxSize": 0,
    "name": "mini",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_x8SKaEkzoe` ON `archive` (\n  `mini_id`,\n  `daily_id`,\n  `midi_id`\n)",
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)"
    ]
  }, collection)

  // update field
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "json1612619704",
    "maxSize": 0,
    "name": "mini",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
