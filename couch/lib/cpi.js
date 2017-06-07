module.exports = {
    "title": "Monthly CPI",
    "type": "object",

    "properties": {
        "type": {
            "type": "string"
        },
        "cdid": {
            "type": "string"
        },
        "datasetId": {
            "type": "string"
        },
        "releaseDate" : {
            "type": "string"
        },
        "nextRelease" : {
            "type": "string"
        },
        "importTimestamp" : {
            "type": "string"
        },

        "data": {
            "type": "array",
                "items": {
                    "type": "object",

                    "properties": {

                        "year": {
                            "type": "integer"
                        },
                        "month": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 12
                        },
                        "value": {
                            "type": "number"
                        }
                    },

                    "required": [
                        "year", "month", "value"
                    ]
                }
        }
    },
    "required": [
        "type", "cdid", "datasetId", "releaseDate", "nextRelease", "data"
    ]
};
