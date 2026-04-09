/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2318666520")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json4113142680",
    "maxSize": 0,
    "name": "order",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2318666520")

  // remove field
  collection.fields.removeById("json4113142680")

  return app.save(collection)
})
