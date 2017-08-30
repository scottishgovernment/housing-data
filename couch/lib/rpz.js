module.exports = {
    "title": "Monthly CPI",
    "type": "object",

    "properties": {
        "id": {
            "id": "/properties/id",
            "type": "integer"
        },
        "name": {
            "id": "/properties/name",
            "type": "string"
        },
        "fromDate": {
            "id": "/properties/fromDate",
            "type": "string"
        },
        "toDate": {
            "id": "/properties/toDate",
            "type": "string"
        },
        "maxIncrease": {
            "id": "/properties/maxIncrease",
            "type": "number"
        },
        "postcodes": {
            "id": "/properties/postcodes",
            "items": {
                "id": "/properties/postcodes/items",
                "type": "string"
            },
            "type": "array"
        },
        "uprns": {
            "id": "/properties/uprns",
            "items": {
                "id": "/properties/uprns/items",
                "type": "string"
            },
            "type": "array"
        }
    },
    "required": [
        "id", "name", "fromDate", "toDate", "postcodes", "uprns"
    ]
};
