/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_770882251")

  // update collection data
  unmarshal({
    "listRule": "public = true || author.id = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_770882251")

  // update collection data
  unmarshal({
    "listRule": null
  }, collection)

  return app.save(collection)
})
