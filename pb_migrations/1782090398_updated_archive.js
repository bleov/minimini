/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)",
      "CREATE INDEX `idx_c7v9wzr8p3` ON `archive` (\n  `mini_id`,\n  `daily_id`,\n  `midi_id`,\n  `connections_id`,\n  `wordle_id`,\n  `publication_date`,\n  `strands_id`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "number784972159",
    "max": null,
    "min": null,
    "name": "strands_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "help": "",
    "hidden": false,
    "id": "json1510150617",
    "maxSize": 0,
    "name": "strands",
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
      "CREATE UNIQUE INDEX `idx_QO0HC094Bm` ON `archive` (`publication_date`)",
      "CREATE INDEX `idx_c7v9wzr8p3` ON `archive` (\n  `mini_id`,\n  `daily_id`,\n  `midi_id`,\n  `connections_id`,\n  `wordle_id`,\n  `publication_date`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("number784972159")

  // remove field
  collection.fields.removeById("json1510150617")

  return app.save(collection)
})
