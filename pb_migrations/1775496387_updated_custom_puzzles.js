/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_770882251")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2764626012",
    "hidden": false,
    "id": "relation3710975960",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "shape",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_770882251")

  // remove field
  collection.fields.removeById("relation3710975960")

  return app.save(collection)
})
