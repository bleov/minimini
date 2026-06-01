/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2283879969")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = user.id",
    "listRule": "@request.auth.id != \"\" && (@request.auth.friends ?~ user.id || @request.auth.id = user.id)",
    "viewRule": "@request.auth.id = user.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2283879969")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
