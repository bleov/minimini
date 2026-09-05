/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3644265509");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id = user.id",
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation2375276105",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select3206337475",
        "maxSelect": 0,
        "name": "version",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "1"
        ]
      },
      {
        "help": "",
        "hidden": false,
        "id": "number2254405824",
        "max": null,
        "min": 0,
        "name": "duration",
        "onlyInt": true,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1401378634",
        "maxSize": 0,
        "name": "events",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_3644265509",
    "indexes": [],
    "listRule": "@request.auth.id = user.id",
    "name": "replays",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": ""
  });

  return app.save(collection);
})
