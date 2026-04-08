/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number2424003980",
    "max": null,
    "min": null,
    "name": "connections_id",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "json3220634645",
    "maxSize": 0,
    "name": "connections",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1152328310")

  // remove field
  collection.fields.removeById("number2424003980")

  // remove field
  collection.fields.removeById("json3220634645")

  return app.save(collection)
})
