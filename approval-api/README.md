# Approval-API

## Folder Structure

```
approval-api/
│   constants.js
│   handler.js  
│   index.js
│
└─── data/
│      create.js
│      delete.js
│      get.js
│
└─── manager/
    │   approve.js
    │   deny.js
    │
    └─── resource/
        │   edge.js
        │   poi.js
        │   user.js
```

* _handler.js_ is a delegator responsible for the lambda api
* _index.js_ is a wrapper for the `manager` which adds makes the manager ready to be used externally or for the `handler`
* **_data/_** contains all data level operations (db/ cache etc) which directly manipulate the data, all these should only be used by the `handler` and not anywhere else directly
* **_manager/_** handles the business logic of the approval process and is used to approve/ deny items and uses the `data` files to manipulate the data

The _index.js_ is the only file that should be used as an api to use the approval api features. _manager_ or _data_ should never be used directly anywhere else then in th _index.js_. Only the _manager_ is allowed to use the _data_ files.
