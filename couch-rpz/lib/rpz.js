module.exports = {
    "title": "Monthly CPI",
    "type": "object",

    "properties": {
        "name": {
            "type": "string"
        },
        "fromDate": {
            "type": "string"
        },
        "toDate": {
            "type": "string"
        },
        "maxIncrease": {
            "type": "number"
        },
        "postcodes": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "uprns": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "username": {
            "type": "string"
        },
        "timestamp": {
            "type": "number"
        },
        "history": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "fromDate": {
                        "type": "string"
                    },
                    "toDate": {
                        "type": "string"
                    },
                    "maxIncrease": {
                        "type": "number"
                    },
                    "postcodes": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "uprns": {
                        "items": {
                            "type": "string"
                        },
                        "type": "array"
                    },
                    "username": {
                        "type": "string"
                    },
                    "timestamp": {
                        "type": "number"
                    },
                },
                "required": [
                    "name", "fromDate", "toDate", "postcodes", "uprns", "username", "timestamp"
                ]
            }
        }

    },
    "required": [
        "name", "fromDate", "toDate", "postcodes", "uprns", "history", "username", "timestamp"
    ]
};
