# Housing Data
This package provides access to data used by mygov housing forms:
- CPI data from ONS
- Rent pressure zone

# Usage
This package provides an endpoint that provides access to the most recently
available CPI data from the ONS.  All versions of the CPI data are cached in couch.

It also provides a REST interface to allow manipulate rent pressure zone information.

GET [/rpz/]

Fetch a list of rent pressure zones.

```json
[{
    "id": "22222",
    "name": "rent pressure zone name",
    "fromDate": "2010-01-01",
    "toDate": "2011-01-01",
    "maxIncrease": 1.7,
    "postcodes": [],
    "uprns": ["906169837"]
}]
```

GET [/rpz/:id]

Fetch the full details including history of a rent pressure zone

```json
{
    "id": "22222",
    "name": "rent pressure zone name",
    "fromDate": "2010-01-01",
    "toDate": "2011-01-01",
    "maxIncrease": 1.7,
    "postcodes": [],
    "uprns": ["906169837"],
    "history": []
}
```

POST [/rpz/]

Create a new rent pressure zone.

```json
{
    "name": "rent pressure zone name",
    "fromDate": "2010-01-01",
    "toDate": "2011-01-01",
    "maxIncrease": 1.7,
    "postcodes": [],
    "uprns": ["906169837"]
}
```

PUT [/rpz/:id]

Update a rent pressure zone.

```json
{
    "name": "rent pressure zone name",
    "fromDate": "2010-01-01",
    "toDate": "2011-01-01",
    "maxIncrease": 1.7,
    "postcodes": [],
    "uprns": ["906169837"]
}
```

DELETE [/rpz/:id]

Delete a rent pressure zone.


# Configuration

* `cpi.graceperiod`
  * grace period to use when determining of the CPi data has expired.
  * Type ISO 8601 Duration
  * Default: `PT12H`

* `cpi.source.url`
  * the url used to fetch CPI data from ONS.
  * Type: URL
  * Default: `https://www.ons.gov.uk/generator?format=csv&uri=/economy/inflationandpriceindices/timeseries/d7bt/mm23`

* `cpi.update.crontab`
  * The crontab used to schedule regular updates of the cpi data in couchdb and elastcisearch
  * Type: string
  * Default: 0 * * * *

* `cpi.update.retryinterval`
  * The retry interval in millis to use when retrying indexing cpi data in elasticsearch
  * Type: int
  * Default: 60000

* `rpz.index.retryinterval`
  * The retry interval in millis to use when retrying indexing rpz data in elasticsearch
  * Type: int
  * Default: 60000

* `rpz.index.crontab`
  * The crontab used to schedule regular updates of the rpz data from couchdb to elastcisearch
  * Type: string
  * Default: *\5 * * * *

* `elasticsearch.logLevel`
  * Log level for elastic search library.  
  * Default: warning
