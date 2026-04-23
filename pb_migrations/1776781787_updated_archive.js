/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "number1520960948",
    "max": null,
    "min": null,
    "name": "wordle_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "json3338651345",
    "maxSize": 0,
    "name": "wordle",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // remove field
  collection.fields.removeById("number1520960948")

  // remove field
  collection.fields.removeById("json3338651345")

  return app.save(collection)
})
