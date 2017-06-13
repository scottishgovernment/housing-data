# Housing Data
This package provides access to data used by mygov housing forms:
- CPI data from ONS

### Configuration
ons.cpiUrl: the url used to fetch CPI data from.
couch.url: url of the couchdb used to cache CPI data

### Usage
This package provides an endpoint that provides access to the most recently
available CPI data from the ONS.  All versions of the CPI data are cached in couch.
