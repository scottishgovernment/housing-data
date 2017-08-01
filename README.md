# Housing Data
This package provides access to data used by mygov housing forms:
- CPI data from ONS

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

# Usage
This package provides an endpoint that provides access to the most recently
available CPI data from the ONS.  All versions of the CPI data are cached in couch.
