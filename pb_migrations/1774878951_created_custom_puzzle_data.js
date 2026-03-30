/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 0,
        "min": 0,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "_clone_effC",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "author",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "_clone_DFIA",
        "max": 0,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "_clone_jFzM",
        "maxSize": 0,
        "name": "puzzle",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "_clone_n5kJ",
        "name": "public",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "_clone_VaLI",
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
      },
      {
        "hidden": false,
        "id": "_clone_3OiB",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "_clone_FeOr",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "json955124250",
        "maxSize": 1,
        "name": "avg_rating",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json2894808327",
        "maxSize": 1,
        "name": "completions",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_1889871825",
    "indexes": [],
    "listRule": "public = true || author.id = @request.auth.id",
    "name": "custom_puzzle_data",
    "system": false,
    "type": "view",
    "updateRule": null,
    "viewQuery": "SELECT\n  custom_puzzles.id,\n  custom_puzzles.author,\n  custom_puzzles.title,\n  custom_puzzles.puzzle,\n  custom_puzzles.public,\n  custom_puzzles.type,\n  custom_puzzles.created,\n  custom_puzzles.updated,\n  COALESCE(AVG(ratings.rating), 0) AS avg_rating,\n  COALESCE(puzzle_stats.completions, 0) AS completions\nFROM custom_puzzles\nLEFT JOIN ratings ON ratings.puzzle_id = custom_puzzles.id\nLEFT JOIN puzzle_stats ON puzzle_stats.id = custom_puzzles.id\nWHERE custom_puzzles.public = true\nGROUP BY custom_puzzles.id",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1889871825");

  return app.delete(collection);
})
